import {
    toSeekerProfileDto,
} from "../dto/profileDto.js";
import {
    clearSeekerProfilePicture,
    createSeekerProfile,
    findSeekerProfileByUserId,
    setSeekerProfilePicture,
    updateSeekerProfile,
} from "../repositories/seekerProfileRepository.js";
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
