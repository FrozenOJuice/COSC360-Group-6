import SeekerProfile from "../models/SeekerProfile.js";

export async function findSeekerProfileByUserId(userId, options = {}) {
    const query = SeekerProfile.findOne({ userId });

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
