import { getRazorPay } from "../config/razorpay.config";

const createOrder = async (price: number) => {
  const razorpay = getRazorPay();
  if (!razorpay) {
    throw new Error("RazorPay not configured.");
  }
  const { id, amount, currency } = await razorpay.orders.create({
    amount: price,
    currency: "INR",
  });
  return { id, amount, currency };
};

export { createOrder };
