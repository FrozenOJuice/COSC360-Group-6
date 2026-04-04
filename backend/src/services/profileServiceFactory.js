import { appError } from "../utils/appError.js";
import { broadcastProfile } from "../utils/profileEventBus.js";
import { assertCanReadProfile } from "./profileAccess.js";

function assertProfileExists(profile, message) {
    if (!profile) {
        throw appError("NOT_FOUND", message);
    }
}

function resolveProfileMediaPayload(profile, { dataField, contentTypeField, notFoundMessage, }) {
    if (!profile?.[dataField] || !profile?.[contentTypeField]) {
        throw appError("NOT_FOUND", notFoundMessage);
    }

    return {
        data: profile[dataField],
        contentType: profile[contentTypeField],
    };
}

export function createProfileService({
    clearProfileMedia,
    findProfileByUserId,
    mediaContentTypeField,
    mediaDataField,
    mediaNotFoundMessage,
    normalizeProfile,
    profileNotFoundMessage,
    setProfileMedia,
    updateProfile,
}) {
    async function getCurrentProfile(userId) {
        const profile = await findProfileByUserId(userId);
        assertProfileExists(profile, profileNotFoundMessage);

        return normalizeProfile(profile);
    }

    async function updateCurrentProfile(userId, profileData) {
        const existingProfile = await findProfileByUserId(userId);
        assertProfileExists(existingProfile, profileNotFoundMessage);

        const safeProfileData = { ...(profileData || {}) };
        delete safeProfileData.userId;
        delete safeProfileData._id;

        const profile = await updateProfile(existingProfile._id, safeProfileData);
        broadcastProfile(userId);
        return normalizeProfile(profile);
    }

    async function setCurrentProfileMedia(userId, file) {
        const existingProfile = await findProfileByUserId(userId);
        assertProfileExists(existingProfile, profileNotFoundMessage);

        const profile = await setProfileMedia(existingProfile._id, {
            buffer: file.buffer,
            contentType: file.mimetype,
        });

        broadcastProfile(userId);
        return normalizeProfile(profile);
    }

    async function removeCurrentProfileMedia(userId) {
        const existingProfile = await findProfileByUserId(userId);
        assertProfileExists(existingProfile, profileNotFoundMessage);

        const profile = await clearProfileMedia(existingProfile._id);
        broadcastProfile(userId);
        return normalizeProfile(profile);
    }

    async function getCurrentProfileMedia(userId) {
        const profile = await findProfileByUserId(userId, { includeImageData: true });
        assertProfileExists(profile, profileNotFoundMessage);

        return resolveProfileMediaPayload(profile, {
            dataField: mediaDataField,
            contentTypeField: mediaContentTypeField,
            notFoundMessage: mediaNotFoundMessage,
        });
    }

    async function getVisibleProfile(targetUserId, viewer) {
        const profile = await findProfileByUserId(targetUserId);
        assertProfileExists(profile, profileNotFoundMessage);

        assertCanReadProfile(profile, viewer);
        return normalizeProfile(profile);
    }

    async function getProfileMedia(targetUserId, viewer) {
        const profile = await findProfileByUserId(targetUserId, { includeImageData: true });
        assertProfileExists(profile, profileNotFoundMessage);

        assertCanReadProfile(profile, viewer);

        return resolveProfileMediaPayload(profile, {
            dataField: mediaDataField,
            contentTypeField: mediaContentTypeField,
            notFoundMessage: mediaNotFoundMessage,
        });
    }

    return {
        getCurrentProfile,
        updateCurrentProfile,
        setCurrentProfileMedia,
        removeCurrentProfileMedia,
        getCurrentProfileMedia,
        getVisibleProfile,
        getProfileMedia,
    };
}
