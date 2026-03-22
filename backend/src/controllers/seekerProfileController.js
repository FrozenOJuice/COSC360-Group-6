import {
    getCurrentSeekerProfile,
    getVisibleSeekerProfile,
    updateCurrentSeekerProfile,
} from "../services/seekerProfileService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const getSelfSeekerProfile = asyncHandler(async (req, res) => {
    const profile = await getCurrentSeekerProfile(req.auth?.userId);
    res.status(200).json({ success: true, data: profile });
});

export const updateSelfSeekerProfile = asyncHandler(async (req, res) => {
    const profile = await updateCurrentSeekerProfile(req.auth?.userId, req.body);
    res.status(200).json({ success: true, data: profile });
});

export const getSeekerProfileByUserId = asyncHandler(async (req, res) => {
    const profile = await getVisibleSeekerProfile(req.params?.userId, req.auth);
    res.status(200).json({ success: true, data: profile });
});
