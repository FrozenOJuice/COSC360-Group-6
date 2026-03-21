import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/:userId", getUserProfile);

router.put("/:userId", updateUserProfile);

export default router;