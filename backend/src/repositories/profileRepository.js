import Profile from "../models/Profile.js";

export async function findById(profileId) {
    const query = Profile.findById(profileId);

    return query.exec();
}

export async function findByUserId(userId) {
    const query = Profile.findOne({ userId });

    return query.exec();
}

export async function createProfile(profileData) {
    return Profile.create(profileData);
}

export async function updateProfile(profileId, updateData) {
    const query = Profile.findByIdAndUpdate(profileId, updateData, { new: true });
    return query.exec();
}

export async function saveProfile(profile) {
    return profile.save();
}
