const SCRIPT_SRC = "https://sdk.cashfree.com/js/v3/cashfree.js";

let scriptPromise = null;

const loadCashfree = () => {
  if (window.Cashfree) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Cashfree SDK failed to load.")),
      );
      if (window.Cashfree) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Cashfree SDK failed to load. Are you online?"));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
};

/**
 * @param {"sandbox"|"production"} mode
 */
const getCashfree = async (mode = "sandbox") => {
  await loadCashfree();
  if (!window.Cashfree) {
    throw new Error("Cashfree SDK is unavailable.");
  }
  return window.Cashfree({
    mode: mode === "production" ? "production" : "sandbox",
  });
};

/**
 * Opens Cashfree checkout (modal). Resolves when the modal closes.
 * Always verify the order on your backend after this returns.
 */
const openCashfreeCheckout = async ({ paymentSessionId, mode = "sandbox" }) => {
  const cashfree = await getCashfree(mode);
  return cashfree.checkout({
    paymentSessionId,
    redirectTarget: "_modal",
  });
};

export { loadCashfree, getCashfree, openCashfreeCheckout };
