import { asyncHandler } from "../middleware/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { createProfileController } from "./profileControllerFactory.js";
import {
    getCurrentSeekerProfile,
    getCurrentSeekerProfilePicture,
    getCurrentSeekerResumeFile,
    getSeekerProfilePicture,
    getSeekerResumeFile,
    getVisibleSeekerProfile,
    removeCurrentSeekerProfilePicture,
    removeCurrentSeekerResume,
    setCurrentSeekerProfilePicture,
    updateCurrentSeekerProfile,
    uploadCurrentSeekerResume,
} from "../services/seekerProfileService.js";

const seekerProfileController = createProfileController({
    getCurrentProfile: getCurrentSeekerProfile,
    getCurrentProfileMedia: getCurrentSeekerProfilePicture,
    getProfileMedia: getSeekerProfilePicture,
    getVisibleProfile: getVisibleSeekerProfile,
    removeCurrentProfileMedia: removeCurrentSeekerProfilePicture,
    setCurrentProfileMedia: setCurrentSeekerProfilePicture,
    updateCurrentProfile: updateCurrentSeekerProfile,
});

export const {
    streamSelfProfile: streamSelfSeekerProfile,
    getSelfProfile: getSelfSeekerProfile,
    updateSelfProfile: updateSelfSeekerProfile,
    uploadSelfProfileMedia: uploadSelfSeekerProfilePicture,
    removeSelfProfileMedia: removeSelfSeekerProfilePicture,
    getSelfProfileMedia: getSelfSeekerProfilePicture,
    getProfileByUserId: getSeekerProfileByUserId,
    getProfileMediaByUserId: getSeekerProfilePictureByUserId,
} = seekerProfileController;

export const uploadSelfSeekerResume = asyncHandler(async (req, res) => {
    const profile = await uploadCurrentSeekerResume(req.auth?.userId, req.file);
    sendSuccess(res, profile);
});

export const removeSelfSeekerResume = asyncHandler(async (req, res) => {
    const profile = await removeCurrentSeekerResume(req.auth?.userId);
    sendSuccess(res, profile);
});

export const getSelfSeekerResumeFile = asyncHandler(async (req, res) => {
    const resume = await getCurrentSeekerResumeFile(req.auth?.userId);
    res.set("Content-Type", resume.contentType);
    res.set("Content-Disposition", "inline; filename=\"resume.pdf\"");
    res.status(200).send(resume.data);
});

export const getSeekerResumeFileByUserId = asyncHandler(async (req, res) => {
    const resume = await getSeekerResumeFile(req.params?.userId, req.auth);
    res.set("Content-Type", resume.contentType);
    res.set("Content-Disposition", "inline; filename=\"resume.pdf\"");
    res.status(200).send(resume.data);
});
