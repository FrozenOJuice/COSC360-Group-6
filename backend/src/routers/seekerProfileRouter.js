import express from "express";
import {
    getSeekerProfileByUserId,
    getSelfSeekerProfile,
    updateSelfSeekerProfile,
} from "../controllers/seekerProfileController.js";
import { attachAuth } from "../middleware/attachAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateParams } from "../middleware/validateParams.js";
import { profileUserParamsSchema, updateSeekerProfileSchema } from "../validators/profileSchemas.js";

const router = express.Router();

router.get("/me", requireAuth, requireRole("seeker"), getSelfSeekerProfile);
router.put(
    "/me",
    requireAuth,
    requireRole("seeker"),
    validateBody(updateSeekerProfileSchema),
    updateSelfSeekerProfile
);
router.get("/:userId", attachAuth, validateParams(profileUserParamsSchema), getSeekerProfileByUserId);

export default router;
