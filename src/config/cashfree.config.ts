export type CashfreeEnv = "sandbox" | "production";

export const getCashfreeEnv = (): CashfreeEnv => {
  const mode = (process.env.CASHFREE_ENV || "sandbox").trim().toLowerCase();
  return mode === "production" ? "production" : "sandbox";
};

export const getCashfreeBaseUrl = () =>
  getCashfreeEnv() === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export const getCashfreeCredentials = () => {
  const appId = process.env.CASHFREE_APP_ID?.trim();
  const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();
  if (!appId || !secretKey) {
    throw new Error(
      "Cashfree credentials missing. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY.",
    );
  }
  return { appId, secretKey };
};

export const getCashfreeHeaders = () => {
  const { appId, secretKey } = getCashfreeCredentials();
  return {
    "Content-Type": "application/json",
    "x-api-version": "2023-08-01",
    "x-client-id": appId,
    "x-client-secret": secretKey,
  };
};
