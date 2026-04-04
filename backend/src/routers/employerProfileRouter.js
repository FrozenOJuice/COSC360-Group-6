import express from "express";
import {
    getEmployerProfileByUserId,
    getEmployerProfileLogoByUserId,
    removeSelfEmployerProfileLogo,
    getSelfEmployerProfile,
    getSelfEmployerProfileLogo,
    streamSelfEmployerProfile,
    uploadSelfEmployerProfileLogo,
    updateSelfEmployerProfile,
} from "../controllers/employerProfileController.js";
import { attachAuth } from "../middleware/attachAuth.js";
import { uploadEmployerProfileLogo } from "../middleware/profileImageUpload.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateParams } from "../middleware/validateParams.js";
import { profileUserParamsSchema, updateEmployerProfileSchema } from "../validators/profileSchemas.js";

const router = express.Router();

router.get("/me/stream", requireAuth, requireRole("employer"), streamSelfEmployerProfile);
router.get("/me/logo", requireAuth, requireRole("employer"), getSelfEmployerProfileLogo);
router.get("/me", requireAuth, requireRole("employer"), getSelfEmployerProfile);
router.put(
    "/me",
    requireAuth,
    requireRole("employer"),
    validateBody(updateEmployerProfileSchema),
    updateSelfEmployerProfile
);
router.post(
    "/me/logo",
    requireAuth,
    requireRole("employer"),
    uploadEmployerProfileLogo,
    uploadSelfEmployerProfileLogo
);
router.delete(
    "/me/logo",
    requireAuth,
    requireRole("employer"),
    removeSelfEmployerProfileLogo
);
router.get("/:userId/logo", attachAuth, validateParams(profileUserParamsSchema), getEmployerProfileLogoByUserId);
router.get("/:userId", attachAuth, validateParams(profileUserParamsSchema), getEmployerProfileByUserId);

export default router;
