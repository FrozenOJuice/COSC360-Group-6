import User from "../models/User.js";

export async function setRefreshTokenHash(userId, refreshTokenHash) {
    return User.findByIdAndUpdate(
        userId,
        { refreshTokenHash },
        { new: true }
    );
}

export async function clearRefreshTokenHash(userId) {
    return User.findByIdAndUpdate(
        userId,
        { refreshTokenHash: null },
        { new: true }
    );
}
