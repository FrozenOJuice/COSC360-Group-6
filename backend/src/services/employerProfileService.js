import {
    toEmployerProfileDto,
} from "../dto/profileDto.js";
import {
    clearEmployerProfileLogo,
    createEmployerProfile,
    findEmployerProfileByUserId,
    setEmployerProfileLogo,
    updateEmployerProfile,
} from "../repositories/employerProfileRepository.js";
import { createProfileService } from "./profileServiceFactory.js";

export async function createInitialEmployerProfile(user, options = {}) {
    return createEmployerProfile({
        userId: user._id ?? user.id,
        companyName: user.name,
        contactEmail: user.email,
        visibility: "private",
    }, options);
}

const employerProfileService = createProfileService({
    clearProfileMedia: clearEmployerProfileLogo,
    findProfileByUserId: findEmployerProfileByUserId,
    mediaContentTypeField: "logoContentType",
    mediaDataField: "logoData",
    mediaNotFoundMessage: "Employer logo not found",
    normalizeProfile: toEmployerProfileDto,
    profileNotFoundMessage: "Employer profile not found",
    setProfileMedia: setEmployerProfileLogo,
    updateProfile: updateEmployerProfile,
});

export const {
    getCurrentProfile: getCurrentEmployerProfile,
    updateCurrentProfile: updateCurrentEmployerProfile,
    setCurrentProfileMedia: setCurrentEmployerProfileLogo,
    removeCurrentProfileMedia: removeCurrentEmployerProfileLogo,
    getCurrentProfileMedia: getCurrentEmployerProfileLogo,
    getVisibleProfile: getVisibleEmployerProfile,
    getProfileMedia: getEmployerProfileLogo,
} = employerProfileService;
