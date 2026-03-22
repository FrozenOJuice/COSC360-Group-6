import Profile from "../models/Profile.js";

export async function findById(profileId) {
    const query = Profile.findById(profileId);

    return query.exec();
}

export async function findByUserId(userId, options = {}) {
    const query = Profile.findOne({ userId });

    if (options.session) {
        query.session(options.session);
    }

    return query.exec();
}

export async function createProfile(profileData, options = {}) {
    const profile = new Profile(profileData);
    return profile.save(options.session ? { session: options.session } : undefined);
}

export async function updateProfile(profileId, updateData) {
    const query = Profile.findByIdAndUpdate(profileId, updateData, {
        new: true,
        runValidators: true,
    });
    return query.exec();
}

export async function saveProfile(profile) {
    return profile.save();
}
