/** Frontend coupon codes for cart preview (checkout can re-validate later). */
const COUPONS = {
  NOTESERA10: {
    code: "NOTESERA10",
    label: "10% off",
    type: "percent",
    value: 10,
  },
  NOTESERA50: {
    code: "NOTESERA50",
    label: "₹50 off",
    type: "flat",
    value: 50,
  },
  WELCOME: {
    code: "WELCOME",
    label: "15% off",
    type: "percent",
    value: 15,
  },
};

export function findCoupon(rawCode) {
  const code = String(rawCode || "")
    .trim()
    .toUpperCase();
  return COUPONS[code] || null;
}

export function getCouponDiscount(coupon, subtotal) {
  if (!coupon || subtotal <= 0) return 0;
  if (coupon.type === "percent") {
    return Math.min(subtotal, Math.round((subtotal * coupon.value) / 100));
  }
  return Math.min(subtotal, Number(coupon.value) || 0);
}
