import { getProfile, createOrUpdateProfile } from "../services/profileService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const profile = await getProfile(userId);
    res.status(200).json({
        success: true,
        data: profile,
    });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const profileData = req.body;
    const profile = await createOrUpdateProfile(userId, profileData);
    res.status(200).json({
        success: true,
        data: profile,
    });
});