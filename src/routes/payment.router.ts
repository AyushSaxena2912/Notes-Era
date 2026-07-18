import { Router } from "express";
import {
  createCartOrder,
  createNewOrder,
  verifyPayment,
} from "../controllers/payment.controller";
import {
  requireAuth,
  requireVerifiedEmail,
} from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/create-order",
  requireAuth,
  requireVerifiedEmail,
  createNewOrder,
);
router.post(
  "/create-cart-order",
  requireAuth,
  requireVerifiedEmail,
  createCartOrder,
);
router.post("/verify", requireAuth, requireVerifiedEmail, verifyPayment);

export default router;
