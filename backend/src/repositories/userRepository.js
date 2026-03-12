import User from "../models/User.js";

export async function findByEmail(email, options = {}) {
    const query = User.findOne({ email });

    if (options.includePassword) {
        query.select("+password");
    }

    if (options.includeRefreshTokenHash) {
        query.select("+refreshTokenHash");
    }

    return query.exec();
}

export async function findById(userId, options = {}) {
    const query = User.findById(userId);

    if (options.includePassword) {
        query.select("+password");
    }

    if (options.includeRefreshTokenHash) {
        query.select("+refreshTokenHash");
    }

    return query.exec();
}

export async function listUsers(filters = {}) {
    return User.find(filters).exec();
}

export async function createUser(userData) {
    return User.create(userData);
}

export async function saveUser(user) {
    return user.save();
}



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

export async function updateUserStatus(userId, status) {
    return User.findByIdAndUpdate(
        userId,
        { status },
        {
            new: true,
            runValidators: true,
        }
    );
}
