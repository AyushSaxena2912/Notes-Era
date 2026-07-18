import { Router } from "express";
import {
  getModuleAccess,
  listMyModules,
} from "../controllers/access.controller";
import {
  requireAuth,
  requireVerifiedEmail,
} from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth, requireVerifiedEmail);
router.get("/modules", listMyModules);
router.get("/modules/:slug", getModuleAccess);

export default router;
