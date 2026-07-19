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
