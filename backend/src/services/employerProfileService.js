import {
    createEmployerProfile,
    findEmployerProfileByUserId,
    updateEmployerProfile,
} from "../repositories/employerProfileRepository.js";
import { appError } from "../utils/appError.js";
import {
    assertCanReadProfile,
    getProfileOwnerId,
    getProfileVisibility,
} from "./profileAccess.js";

function normalizeEmployerProfile(profile) {
    return {
        id: profile.id ?? String(profile._id),
        userId: getProfileOwnerId(profile),
        visibility: getProfileVisibility(profile),
        companyName: typeof profile.companyName === "string" ? profile.companyName : "",
        companyDescription: typeof profile.companyDescription === "string" ? profile.companyDescription : "",
        website: typeof profile.website === "string" ? profile.website : "",
        logo: typeof profile.logo === "string" ? profile.logo : "",
        location: typeof profile.location === "string" ? profile.location : "",
        contactEmail: typeof profile.contactEmail === "string" ? profile.contactEmail : "",
        contactPhone: typeof profile.contactPhone === "string" ? profile.contactPhone : "",
    };
}

export async function createInitialEmployerProfile(user, options = {}) {
    return createEmployerProfile({
        userId: user._id ?? user.id,
        companyName: user.name,
        contactEmail: user.email,
        visibility: "private",
    }, options);
}

export async function getCurrentEmployerProfile(userId) {
    const profile = await findEmployerProfileByUserId(userId);
    if (!profile) {
        throw appError("NOT_FOUND", "Employer profile not found");
    }

    return normalizeEmployerProfile(profile);
}

export async function updateCurrentEmployerProfile(userId, profileData) {
    const safeProfileData = { ...(profileData || {}) };
    delete safeProfileData.userId;
    delete safeProfileData._id;

    const existingProfile = await findEmployerProfileByUserId(userId);
    if (!existingProfile) {
        throw appError("NOT_FOUND", "Employer profile not found");
    }

    const profile = await updateEmployerProfile(existingProfile._id, safeProfileData);
    return normalizeEmployerProfile(profile);
}

export async function getVisibleEmployerProfile(targetUserId, viewer) {
    const profile = await findEmployerProfileByUserId(targetUserId);
    if (!profile) {
        throw appError("NOT_FOUND", "Employer profile not found");
    }

    assertCanReadProfile(profile, viewer);
    return normalizeEmployerProfile(profile);
}
