import { Router } from "express";
import {
  getColleges,
  getLinks,
  getSubjects,
  getTypes,
  getYears,
} from "../controllers/freeNotes.controller";
import {
  requireAuth,
  requireVerifiedEmail,
} from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth, requireVerifiedEmail);
router.get("/colleges", getColleges);
router.get("/:college/years", getYears);
router.get("/:college/:year/types", getTypes);
router.get("/:college/:year/:type/subjects", getSubjects);
router.get("/:college/:year/:type/:subject/links", getLinks);

export default router;
