import { Router } from "express";
import {
  changePassword,
  googleCallback,
  googleStart,
  login,
  logout,
  me,
  meta,
  resendVerification,
  signup,
  updateProfile,
  verifyEmail,
  verifyOtp,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/meta", meta);
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.get("/verify-email", verifyEmail);
router.post("/verify-otp", verifyOtp);
router.post("/resend-verification", resendVerification);
router.get("/me", requireAuth, me);
router.patch("/profile", requireAuth, updateProfile);
router.post("/change-password", requireAuth, changePassword);
router.post("/logout", logout);
// Google OAuth stubs — same JWT issuance path later
router.get("/google", googleStart);
router.get("/google/callback", googleCallback);

export default router;
