import {
  authFetch,
  getAccessToken,
  isStudentLoggedIn,
  subscribeStudentAuth,
} from "./studentAuth";

const OWNED_EVENT = "notesera-owned-modules-updated";

let ownedCache = null;
let ownedPromise = null;

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OWNED_EVENT));
  }
}

if (typeof window !== "undefined") {
  subscribeStudentAuth(() => {
    if (!isStudentLoggedIn()) {
      ownedCache = null;
      ownedPromise = null;
      notify();
    }
  });
}

function activeSlugsFromResponse(data) {
  const modules = data?.body?.modules;
  if (!Array.isArray(modules)) return new Set();
  return new Set(
    modules
      .filter((item) => item?.active && item?.productId)
      .map((item) => item.productId),
  );
}

/** Fetch active purchased module slugs for the logged-in student. */
export async function fetchOwnedModuleSlugs({ force = false } = {}) {
  if (!isStudentLoggedIn() || !getAccessToken()) {
    ownedCache = new Set();
    ownedPromise = null;
    return ownedCache;
  }

  if (!force && ownedCache) return ownedCache;
  if (!force && ownedPromise) return ownedPromise;

  ownedPromise = authFetch("/access/modules")
    .then(({ response, data }) => {
      if (!response.ok) {
        ownedCache = ownedCache || new Set();
        return ownedCache;
      }
      ownedCache = activeSlugsFromResponse(data);
      notify();
      return ownedCache;
    })
    .catch(() => {
      ownedCache = ownedCache || new Set();
      return ownedCache;
    })
    .finally(() => {
      ownedPromise = null;
    });

  return ownedPromise;
}

export function getOwnedModuleSlugsSync() {
  return ownedCache || new Set();
}

export function isModuleOwned(slug) {
  if (!slug || !ownedCache) return false;
  return ownedCache.has(slug);
}

/** Call after a successful purchase so UI updates without a full reload. */
export function markModulesOwned(slugs = []) {
  const next = new Set(ownedCache || []);
  slugs.filter(Boolean).forEach((slug) => next.add(slug));
  ownedCache = next;
  notify();
}

export function clearOwnedModulesCache() {
  ownedCache = null;
  ownedPromise = null;
  notify();
}

export function subscribeOwnedModules(listener) {
  const handler = () => listener(getOwnedModuleSlugsSync());
  window.addEventListener(OWNED_EVENT, handler);
  return () => window.removeEventListener(OWNED_EVENT, handler);
}
