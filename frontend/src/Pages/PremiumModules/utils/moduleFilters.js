import { MODULE_LOCAL_FILES } from "./moduleLocalFiles";

const COLLEGE_PATTERNS = [
  { match: /medi-?caps/i, label: "Medi-Caps University" },
  { match: /ips/i, label: "IPS Academy" },
  {
    match: /acropolis/i,
    label: "Acropolis Institute",
  },
  { match: /rgpv/i, label: "Medi-Caps University" },
  { match: /iist/i, label: "Medi-Caps University" },
  { match: /svit/i, label: "Medi-Caps University" },
];

export const COLLEGE_OPTIONS = [
  "Medi-Caps University",
  "IPS Academy",
  "Acropolis Institute",
];

export function extractCollege(about = "", fallback = COLLEGE_OPTIONS[0]) {
  for (const item of COLLEGE_PATTERNS) {
    if (item.match.test(about)) return item.label;
  }
  return fallback;
}

/** Fixed year filter labels (B.Tech) */
export const YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];

const YEAR_LABELS = {
  1: "1st Year",
  2: "2nd Year",
  3: "3rd Year",
  4: "4th Year",
};

/** repoId like ml-6 or rm25-6 → academic year (not semester) */
export function extractYear(repoId = "") {
  const match = String(repoId).match(/-(\d+)$/);
  if (!match) return "1st Year";
  const num = Number(match[1]);
  if (num >= 1 && num <= 8) {
    return YEAR_LABELS[Math.ceil(num / 2)] || "1st Year";
  }
  return YEAR_LABELS[num] || `Year ${num}`;
}

export function normalizeRepos(repos = []) {
  return repos.map((repo) => {
    const college = extractCollege(repo.about);
    const year = extractYear(repo.repoId);
    const modules = (repo.modules || []).map((module) => ({
      ...module,
      college,
      year,
      subject: repo.name,
      searchText: [
        module.name,
        module.about,
        module.description,
        module.slug,
        repo.name,
        college,
        year,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }));
    return { ...repo, college, year, modules };
  });
}

export function flattenModules(repos = []) {
  return repos.flatMap((repo) => repo.modules || []);
}

export function getUniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort();
}

const DEFAULT_MODULE_COVER = "/Assets2/Premium-Modules/module-cover.png";
const MODULES_ASSET_PREFIX = "/Assets2/Premium-Modules/Modules";

/** Vercel/Linux is case-sensitive — map DB folder names to real public folders. */
const MODULE_ASSET_FOLDERS = {
  ad12: "AD12",
  ad12345: "AD12345",
  ad5: "AD5",
  bde12: "BDE12",
  bde12345: "BDE12345",
  bde34: "BDE34",
  bde5: "BDE5",
  cd: "CD",
  csf: "CSF",
  csf12345: "CSF12345",
  csf5: "CSF5",
  iot: "IOT",
  iot12: "IOT12",
  iot12345: "IOT12345",
  iot34: "IOT34",
  iot55: "IOT55",
  ml12: "ML12",
  ml12345: "ML12345",
  ml34: "ML34",
  ml5: "ML5",
  py12: "PY12",
  py345: "PY345",
  pyoneshot: "PYOneshot",
  r12: "R12",
  r5: "R5",
  rm: "RM",
  rm12: "RM12",
  rm25: "RM25",
  rm5: "RM5",
  rmoneshot: "RMOneshot",
  rp: "RP",
  sc12345: "SC12345",
  se: "SE",
  xml: "XML",
  xml12345: "XML12345",
};

/**
 * Convert legacy notesera.in / absolute URLs to local /Assets2 paths
 * and fix Modules/<folder> casing for production.
 */
export function normalizeModuleAssetUrl(src = "") {
  const raw = String(src || "").trim();
  if (!raw || raw.includes("undefined") || raw.includes("null")) return "";

  let path = raw;
  try {
    if (/^https?:\/\//i.test(raw)) {
      path = new URL(raw).pathname;
    }
  } catch {
    return "";
  }

  if (!path.startsWith("/")) path = `/${path}`;
  if (!path.includes("/Assets2/")) return "";

  // Keep only the /Assets2/... suffix
  path = path.slice(path.indexOf("/Assets2/"));

  const match = path.match(/^(\/Assets2\/Premium-Modules\/Modules\/)([^/]+)(\/.*)$/i);
  if (match) {
    const [, prefix, folder, rest] = match;
    const fixedFolder = MODULE_ASSET_FOLDERS[folder.toLowerCase()] || folder;
    path = `${prefix}${fixedFolder}${rest}`;
  }

  return path;
}

function extractModuleFolder(moduleOrUrl = {}) {
  const candidates = [];
  if (typeof moduleOrUrl === "string") {
    candidates.push(moduleOrUrl);
  } else {
    candidates.push(moduleOrUrl?.thumbnailSrc);
    const previews = Array.isArray(moduleOrUrl?.previews)
      ? moduleOrUrl.previews
      : [];
    previews.forEach((item) => candidates.push(item?.previewSrc));
  }

  for (const candidate of candidates) {
    const path = normalizeModuleAssetUrl(candidate);
    const match = path.match(/\/Modules\/([^/]+)\//i);
    if (!match) continue;
    const folder = match[1];
    return MODULE_ASSET_FOLDERS[folder.toLowerCase()] || folder;
  }
  return "";
}

function localAssetPaths(folder) {
  const files = MODULE_LOCAL_FILES[folder];
  if (!files?.length) return [];
  return files.map((file) => `${MODULES_ASSET_PREFIX}/${folder}/${file}`);
}

/**
 * Prefer real local module assets (case-safe).
 * Never keep dead notesera.in URLs — they return HTML stubs, not images.
 */
export function resolveModuleImage(module = {}) {
  const folder = extractModuleFolder(module);
  const localFiles = localAssetPaths(folder);
  if (localFiles.length) {
    return (
      localFiles.find((src) => /\/thumbnail\./i.test(src)) || localFiles[0]
    );
  }
  // Folder known from DB but assets not shipped yet (e.g. PY*)
  if (folder) return DEFAULT_MODULE_COVER;
  return (
    normalizeModuleAssetUrl(module?.thumbnailSrc) || DEFAULT_MODULE_COVER
  );
}

/** Thumbnail + preview slides for module purchase / detail page. */
export function resolveModuleGallery(module = {}) {
  const folder = extractModuleFolder(module);
  const localSlides = localAssetPaths(folder);
  if (localSlides.length) return localSlides;
  return [resolveModuleImage(module)];
}

/**
 * Offer price = softCopyPrice (what checkout charges).
 * MRP = module.mrp when higher than offer (strikethrough + % off).
 */
export function resolveModulePrices(module = {}) {
  const soft = Number(module.softCopyPrice);
  const mrp = Number(module.mrp);

  const price = Number.isFinite(soft) && soft > 0 ? soft : null;
  const oldPrice =
    price != null && Number.isFinite(mrp) && mrp > price ? mrp : null;

  return { price, oldPrice };
}

/** Group modules by subject name (repo / subject). */
export function groupModulesBySubject(modules = []) {
  const order = [];
  const map = new Map();

  modules.forEach((module) => {
    const subject = module.subject || module.name || "Other";
    if (!map.has(subject)) {
      map.set(subject, []);
      order.push(subject);
    }
    map.get(subject).push(module);
  });

  return order.map((subject) => ({
    subject,
    modules: map.get(subject),
  }));
}

/** Year sections with subject groups nested inside (All years view). */
export function groupModulesByYear(modules = []) {
  return YEAR_OPTIONS.map((yearLabel) => {
    const yearModules = modules.filter((module) => module.year === yearLabel);
    return {
      year: yearLabel,
      modules: yearModules,
      subjects: groupModulesBySubject(yearModules),
    };
  });
}

export function filterAndSortModules(
  modules,
  { query = "", college = "all", year = "all", sort = "relevance" } = {},
) {
  const q = query.trim().toLowerCase();
  let list = modules.filter((module) => {
    const matchesQuery =
      !q ||
      module.searchText?.includes(q) ||
      module.name?.toLowerCase().includes(q) ||
      module.about?.toLowerCase().includes(q) ||
      module.subject?.toLowerCase().includes(q);
    const matchesCollege = college === "all" || module.college === college;
    const matchesYear = year === "all" || module.year === year;
    return matchesQuery && matchesCollege && matchesYear;
  });

  const sorted = [...list];
  switch (sort) {
    case "name-asc":
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      break;
    case "name-desc":
      sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      break;
    case "price-asc":
      sorted.sort(
        (a, b) =>
          (resolveModulePrices(a).price ?? Number.POSITIVE_INFINITY) -
          (resolveModulePrices(b).price ?? Number.POSITIVE_INFINITY),
      );
      break;
    case "price-desc":
      sorted.sort(
        (a, b) =>
          (resolveModulePrices(b).price ?? -1) -
          (resolveModulePrices(a).price ?? -1),
      );
      break;
    case "rating-desc":
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    default:
      break;
  }
  return sorted;
}
