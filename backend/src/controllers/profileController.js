import { getProfile, updateExistingProfile } from "../services/profileService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const userId = req.auth?.userId;
    const profile = await getProfile(userId);
    res.status(200).json({
        success: true,
        data: profile,
    });
});

export const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const userId = req.auth?.userId;
    const profileData = req.body;
    const profile = await updateExistingProfile(userId, profileData);
    res.status(200).json({
        success: true,
        data: profile,
    });
});
