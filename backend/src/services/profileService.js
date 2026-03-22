import { findByUserId, createProfile, updateProfile } from "../repositories/profileRepository.js";
import { appError } from "../utils/appError.js";

export async function getProfile(userId) {
    const profile = await findByUserId(userId);
    if (!profile) {
        throw appError("NOT_FOUND", "Profile not found");
    }
    return profile;
}

export async function createOrUpdateProfile(userId, profileData) {
    const safeProfileData = { ...(profileData || {}) };
    delete safeProfileData.userId;
    delete safeProfileData._id;

    let profile = await findByUserId(userId);
    if (profile) {
        profile = await updateProfile(profile._id, safeProfileData);
    } else {
        profile = await createProfile({
            ...safeProfileData,
            userId,
        });
    }
    return profile;
}
