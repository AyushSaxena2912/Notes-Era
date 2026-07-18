export type PaymentGateway = "cashfree" | "razorpay";

/**
 * Switch gateway via env:
 *   PAYMENT_GATEWAY=cashfree | razorpay
 * If unset, prefers Cashfree when its keys exist, else Razorpay.
 */
const hasCashfreeKeys = () =>
  Boolean(
    process.env.CASHFREE_APP_ID?.trim() &&
      process.env.CASHFREE_SECRET_KEY?.trim(),
  );

export const getPaymentGateway = (): PaymentGateway => {
  const explicit = (process.env.PAYMENT_GATEWAY || "").trim().toLowerCase();
  if (explicit === "cashfree") {
    if (hasCashfreeKeys()) return "cashfree";
    console.warn(
      "PAYMENT_GATEWAY=cashfree but CASHFREE_APP_ID/SECRET_KEY missing — using razorpay.",
    );
    return "razorpay";
  }
  if (explicit === "razorpay") return "razorpay";
  return hasCashfreeKeys() ? "cashfree" : "razorpay";
};
