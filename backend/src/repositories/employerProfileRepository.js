import EmployerProfile from "../models/EmployerProfile.js";

export async function findEmployerProfileByUserId(userId, options = {}) {
    const query = EmployerProfile.findOne({ userId });

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
