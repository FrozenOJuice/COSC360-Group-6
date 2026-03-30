import SeekerProfile from "../models/SeekerProfile.js";

export async function findSeekerProfileByUserId(userId, options = {}) {
    const query = SeekerProfile.findOne({ userId });

    if (options.includeImageData) {
        query.select("+profilePictureData +profilePictureContentType");
    }

    if (options.includeResumeData) {
        query.select("+resumeData +resumeContentType");
    }

    if (options.session) {
        query.session(options.session);
    }

    return query.exec();
}

export async function createSeekerProfile(profileData, options = {}) {
    const profile = new SeekerProfile(profileData);
    return profile.save(options.session ? { session: options.session } : undefined);
}

export async function updateSeekerProfile(profileId, updateData) {
    return SeekerProfile.findByIdAndUpdate(profileId, updateData, {
        new: true,
        runValidators: true,
    }).exec();
}

export async function setSeekerProfilePicture(profileId, pictureData) {
    return SeekerProfile.findByIdAndUpdate(
        profileId,
        {
            $set: {
                profilePictureData: pictureData.buffer,
                profilePictureContentType: pictureData.contentType,
                hasUploadedProfilePicture: true,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).exec();
}

export async function setSeekerResume(profileId, resumeData) {
    return SeekerProfile.findByIdAndUpdate(
        profileId,
        {
            $set: {
                resumeData: resumeData.buffer,
                resumeContentType: resumeData.contentType,
                hasUploadedResume: true,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).exec();
}

export async function clearSeekerResume(profileId) {
    return SeekerProfile.findByIdAndUpdate(
        profileId,
        {
            $set: {
                hasUploadedResume: false,
            },
            $unset: {
                resumeData: 1,
                resumeContentType: 1,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).exec();
}

export async function clearSeekerProfilePicture(profileId) {
    return SeekerProfile.findByIdAndUpdate(
        profileId,
        {
            $set: {
                hasUploadedProfilePicture: false,
            },
            $unset: {
                profilePictureData: 1,
                profilePictureContentType: 1,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).exec();
}
