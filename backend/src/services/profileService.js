import { findByUserId, createProfile, updateProfile } from "../repositories/profileRepository.js";
import { appError } from "../utils/appError.js";

export async function getProfile(userId) {
    const profile = await findByUserId(userId);
    if (!profile) {
        throw new appError("Profile not found", 404);
    }
    return profile;
}

export async function createOrUpdateProfile(userId, profileData) {
    let profile = await findByUserId(userId);
    if (profile) {
        profile = await updateProfile(profile._id, profileData);
    } else {
        profileData.userId = userId;
        profile = await createProfile(profileData);
    }
    return profile;
}