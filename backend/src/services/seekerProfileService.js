import {
    toSeekerProfileDto,
} from "../dto/profileDto.js";
import {
    clearSeekerProfilePicture,
    clearSeekerResume,
    createSeekerProfile,
    findSeekerProfileByUserId,
    setSeekerProfilePicture,
    setSeekerResume,
    updateSeekerProfile,
} from "../repositories/seekerProfileRepository.js";
import { appError } from "../utils/appError.js";
import { assertCanReadProfile } from "./profileAccess.js";
import { createProfileService } from "./profileServiceFactory.js";

export async function createInitialSeekerProfile(userId, options = {}) {
    return createSeekerProfile({
        userId,
        visibility: "private",
    }, options);
}

const seekerProfileService = createProfileService({
    clearProfileMedia: clearSeekerProfilePicture,
    findProfileByUserId: findSeekerProfileByUserId,
    mediaContentTypeField: "profilePictureContentType",
    mediaDataField: "profilePictureData",
    mediaNotFoundMessage: "Profile picture not found",
    normalizeProfile: toSeekerProfileDto,
    profileNotFoundMessage: "Profile not found",
    setProfileMedia: setSeekerProfilePicture,
    updateProfile: updateSeekerProfile,
});

export const {
    getCurrentProfile: getCurrentSeekerProfile,
    updateCurrentProfile: updateCurrentSeekerProfile,
    setCurrentProfileMedia: setCurrentSeekerProfilePicture,
    removeCurrentProfileMedia: removeCurrentSeekerProfilePicture,
    getCurrentProfileMedia: getCurrentSeekerProfilePicture,
    getVisibleProfile: getVisibleSeekerProfile,
    getProfileMedia: getSeekerProfilePicture,
} = seekerProfileService;

function assertProfileExists(profile) {
    if (!profile) {
        throw appError("NOT_FOUND", "Profile not found");
    }
}

function resolveResumePayload(profile) {
    if (!profile?.resumeData || !profile?.resumeContentType) {
        throw appError("NOT_FOUND", "Resume not found");
    }

    return {
        data: profile.resumeData,
        contentType: profile.resumeContentType,
    };
}

export async function uploadCurrentSeekerResume(userId, file) {
    const existing = await findSeekerProfileByUserId(userId);
    assertProfileExists(existing);

    const profile = await setSeekerResume(existing._id, {
        buffer: file.buffer,
        contentType: file.mimetype,
    });

    return toSeekerProfileDto(profile);
}

export async function removeCurrentSeekerResume(userId) {
    const existing = await findSeekerProfileByUserId(userId);
    assertProfileExists(existing);

    const profile = await clearSeekerResume(existing._id);
    return toSeekerProfileDto(profile);
}

export async function getCurrentSeekerResumeFile(userId) {
    const profile = await findSeekerProfileByUserId(userId, { includeResumeData: true });
    assertProfileExists(profile);

    return resolveResumePayload(profile);
}

export async function getSeekerResumeFile(targetUserId, viewer) {
    const profile = await findSeekerProfileByUserId(targetUserId, { includeResumeData: true });
    assertProfileExists(profile);

    assertCanReadProfile(profile, viewer);
    return resolveResumePayload(profile);
}
