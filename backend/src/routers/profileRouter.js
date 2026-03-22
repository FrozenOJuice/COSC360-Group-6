import express from "express";
import { getCurrentUserProfile, updateCurrentUserProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validateBody.js";
import { updateProfileSchema } from "../validators/profileSchemas.js";

const router = express.Router();

router.use(requireAuth, requireRole("seeker"));

router.get("/me", getCurrentUserProfile);

router.put("/me", validateBody(updateProfileSchema), updateCurrentUserProfile);

export default router;
