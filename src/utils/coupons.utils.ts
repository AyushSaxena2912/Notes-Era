type Coupon = {
  code: string;
  type: "percent" | "flat";
  value: number;
};

const COUPONS: Record<string, Coupon> = {
  NOTESERA10: { code: "NOTESERA10", type: "percent", value: 10 },
  NOTESERA50: { code: "NOTESERA50", type: "flat", value: 50 },
  WELCOME: { code: "WELCOME", type: "percent", value: 15 },
};

const getCouponDiscount = (code: string | undefined, subtotal: number) => {
  if (!code || subtotal <= 0) return 0;
  const coupon = COUPONS[code.trim().toUpperCase()];
  if (!coupon) return 0;
  if (coupon.type === "percent") {
    return Math.min(subtotal, Math.round((subtotal * coupon.value) / 100));
  }
  return Math.min(subtotal, Number(coupon.value) || 0);
};

export { getCouponDiscount };
