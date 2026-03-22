import { findByUserId, updateProfile } from "../repositories/profileRepository.js";
import { appError } from "../utils/appError.js";

function normalizeProfile(profile) {
    return {
        id: profile.id ?? String(profile._id),
        bio: typeof profile.bio === "string" ? profile.bio : "",
        jobExperience: Array.isArray(profile.jobExperience) ? profile.jobExperience : [],
        education: Array.isArray(profile.education) ? profile.education : [],
        currentPosition: typeof profile.currentPosition === "string" ? profile.currentPosition : "",
        profilePicture: typeof profile.profilePicture === "string" && profile.profilePicture
            ? profile.profilePicture
            : "/default-profile.png",
        phone: typeof profile.phone === "string" ? profile.phone : "",
        resumeLink: typeof profile.resumeLink === "string" && profile.resumeLink
            ? profile.resumeLink
            : "#",
    };
}

export async function getProfile(userId) {
    const profile = await findByUserId(userId);
    if (!profile) {
        throw appError("NOT_FOUND", "Profile not found");
    }
    return normalizeProfile(profile);
}

export async function updateExistingProfile(userId, profileData) {
    const safeProfileData = { ...(profileData || {}) };
    delete safeProfileData.userId;
    delete safeProfileData._id;

    const existingProfile = await findByUserId(userId);
    if (!existingProfile) {
        throw appError("NOT_FOUND", "Profile not found");
    }

    const profile = await updateProfile(existingProfile._id, safeProfileData);
    return normalizeProfile(profile);
}
