import {
    getCurrentEmployerProfile,
    getVisibleEmployerProfile,
    updateCurrentEmployerProfile,
} from "../services/employerProfileService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const getSelfEmployerProfile = asyncHandler(async (req, res) => {
    const profile = await getCurrentEmployerProfile(req.auth?.userId);
    res.status(200).json({ success: true, data: profile });
});

export const updateSelfEmployerProfile = asyncHandler(async (req, res) => {
    const profile = await updateCurrentEmployerProfile(req.auth?.userId, req.body);
    res.status(200).json({ success: true, data: profile });
});

export const getEmployerProfileByUserId = asyncHandler(async (req, res) => {
    const profile = await getVisibleEmployerProfile(req.params?.userId, req.auth);
    res.status(200).json({ success: true, data: profile });
});
