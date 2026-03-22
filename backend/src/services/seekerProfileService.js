import {
    createSeekerProfile,
    findSeekerProfileByUserId,
    updateSeekerProfile,
} from "../repositories/seekerProfileRepository.js";
import { appError } from "../utils/appError.js";
import {
    assertCanReadProfile,
    getProfileOwnerId,
    getProfileVisibility,
} from "./profileAccess.js";

function normalizeSeekerProfile(profile) {
    return {
        id: profile.id ?? String(profile._id),
        userId: getProfileOwnerId(profile),
        visibility: getProfileVisibility(profile),
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

export async function createInitialSeekerProfile(userId, options = {}) {
    return createSeekerProfile({
        userId,
        visibility: "private",
    }, options);
}

export async function getCurrentSeekerProfile(userId) {
    const profile = await findSeekerProfileByUserId(userId);
    if (!profile) {
        throw appError("NOT_FOUND", "Profile not found");
    }

    return normalizeSeekerProfile(profile);
}

export async function updateCurrentSeekerProfile(userId, profileData) {
    const safeProfileData = { ...(profileData || {}) };
    delete safeProfileData.userId;
    delete safeProfileData._id;

    const existingProfile = await findSeekerProfileByUserId(userId);
    if (!existingProfile) {
        throw appError("NOT_FOUND", "Profile not found");
    }

    const profile = await updateSeekerProfile(existingProfile._id, safeProfileData);
    return normalizeSeekerProfile(profile);
}

export async function getVisibleSeekerProfile(targetUserId, viewer) {
    const profile = await findSeekerProfileByUserId(targetUserId);
    if (!profile) {
        throw appError("NOT_FOUND", "Profile not found");
    }

    assertCanReadProfile(profile, viewer);
    return normalizeSeekerProfile(profile);
}
