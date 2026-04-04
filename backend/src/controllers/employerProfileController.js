import { createProfileController } from "./profileControllerFactory.js";
import {
    getCurrentEmployerProfile,
    getCurrentEmployerProfileLogo,
    removeCurrentEmployerProfileLogo,
    getEmployerProfileLogo,
    getVisibleEmployerProfile,
    setCurrentEmployerProfileLogo,
    updateCurrentEmployerProfile,
} from "../services/employerProfileService.js";

const employerProfileController = createProfileController({
    getCurrentProfile: getCurrentEmployerProfile,
    getCurrentProfileMedia: getCurrentEmployerProfileLogo,
    getProfileMedia: getEmployerProfileLogo,
    getVisibleProfile: getVisibleEmployerProfile,
    removeCurrentProfileMedia: removeCurrentEmployerProfileLogo,
    setCurrentProfileMedia: setCurrentEmployerProfileLogo,
    updateCurrentProfile: updateCurrentEmployerProfile,
});

export const {
    streamSelfProfile: streamSelfEmployerProfile,
    getSelfProfile: getSelfEmployerProfile,
    updateSelfProfile: updateSelfEmployerProfile,
    uploadSelfProfileMedia: uploadSelfEmployerProfileLogo,
    removeSelfProfileMedia: removeSelfEmployerProfileLogo,
    getSelfProfileMedia: getSelfEmployerProfileLogo,
    getProfileByUserId: getEmployerProfileByUserId,
    getProfileMediaByUserId: getEmployerProfileLogoByUserId,
} = employerProfileController;
