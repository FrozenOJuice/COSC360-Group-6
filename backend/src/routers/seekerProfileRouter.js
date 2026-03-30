import express from "express";
import {
    getSeekerProfileByUserId,
    getSeekerProfilePictureByUserId,
    getSeekerResumeFileByUserId,
    getSelfSeekerProfile,
    getSelfSeekerProfilePicture,
    getSelfSeekerResumeFile,
    removeSelfSeekerProfilePicture,
    removeSelfSeekerResume,
    updateSelfSeekerProfile,
    uploadSelfSeekerProfilePicture,
    uploadSelfSeekerResume,
} from "../controllers/seekerProfileController.js";
import { attachAuth } from "../middleware/attachAuth.js";
import { uploadSeekerProfilePicture } from "../middleware/profileImageUpload.js";
import { uploadSeekerResume } from "../middleware/resumeUpload.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateParams } from "../middleware/validateParams.js";
import { profileUserParamsSchema, updateSeekerProfileSchema } from "../validators/profileSchemas.js";

const router = express.Router();

router.get("/me/picture", requireAuth, requireRole("seeker"), getSelfSeekerProfilePicture);
router.get("/me/resume", requireAuth, requireRole("seeker"), getSelfSeekerResumeFile);
router.get("/me", requireAuth, requireRole("seeker"), getSelfSeekerProfile);
router.put(
    "/me",
    requireAuth,
    requireRole("seeker"),
    validateBody(updateSeekerProfileSchema),
    updateSelfSeekerProfile
);
router.post(
    "/me/picture",
    requireAuth,
    requireRole("seeker"),
    uploadSeekerProfilePicture,
    uploadSelfSeekerProfilePicture
);
router.post(
    "/me/resume",
    requireAuth,
    requireRole("seeker"),
    uploadSeekerResume,
    uploadSelfSeekerResume
);
router.delete(
    "/me/picture",
    requireAuth,
    requireRole("seeker"),
    removeSelfSeekerProfilePicture
);
router.delete(
    "/me/resume",
    requireAuth,
    requireRole("seeker"),
    removeSelfSeekerResume
);
router.get("/:userId/picture", attachAuth, validateParams(profileUserParamsSchema), getSeekerProfilePictureByUserId);
router.get("/:userId/resume", attachAuth, validateParams(profileUserParamsSchema), getSeekerResumeFileByUserId);
router.get("/:userId", attachAuth, validateParams(profileUserParamsSchema), getSeekerProfileByUserId);

export default router;
