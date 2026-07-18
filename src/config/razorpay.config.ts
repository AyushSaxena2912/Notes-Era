import dotenv from "dotenv";
dotenv.config();
import { Razorpay } from "razorpay-typescript";

export const getRazorPay = () => {
  const keyId = process.env.RAZOR_ID?.trim();
  const keySecret = process.env.RAZOR_SECRET?.trim();
  // Cashfree-only deploys skip Razorpay — don't throw at startup
  if (!keyId || !keySecret) {
    return undefined;
  }
  try {
    return new Razorpay({
      authKey: {
        key_id: keyId,
        key_secret: keySecret,
      },
    });
  } catch (err) {
    console.error(`Error while getting RazorPay: ${err}`);
    return undefined;
  }
};
