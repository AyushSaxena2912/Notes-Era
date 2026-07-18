import { verifyJWT } from "./utils";

interface OrderTokenType {
  orderId: string;
  type: "soft";
  /** Single-module checkout */
  productId?: string;
  /** Cart checkout (one or more modules) */
  productIds?: string[];
  userId: string;
  gateway?: "cashfree" | "razorpay";
}

const verifyOrderToken = (token: string) => {
  return verifyJWT(token) as OrderTokenType | null;
};

export { verifyOrderToken };
export type { OrderTokenType };
