import EmployerProfile from "../models/EmployerProfile.js";

export async function findEmployerProfileByUserId(userId, options = {}) {
    const query = EmployerProfile.findOne({ userId });

    if (options.includeImageData) {
        query.select("+logoData +logoContentType");
    }

    if (options.session) {
        query.session(options.session);
    }

    return query.exec();
}

export async function createEmployerProfile(profileData, options = {}) {
    const profile = new EmployerProfile(profileData);
    return profile.save(options.session ? { session: options.session } : undefined);
}

export async function updateEmployerProfile(profileId, updateData) {
    return EmployerProfile.findByIdAndUpdate(profileId, updateData, {
        new: true,
        runValidators: true,
    }).exec();
}

export async function setEmployerProfileLogo(profileId, logoData) {
    return EmployerProfile.findByIdAndUpdate(
        profileId,
        {
            $set: {
                logoData: logoData.buffer,
                logoContentType: logoData.contentType,
                hasUploadedLogo: true,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).exec();
}

export async function clearEmployerProfileLogo(profileId) {
    return EmployerProfile.findByIdAndUpdate(
        profileId,
        {
            $set: {
                hasUploadedLogo: false,
            },
            $unset: {
                logoData: 1,
                logoContentType: 1,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).exec();
}
