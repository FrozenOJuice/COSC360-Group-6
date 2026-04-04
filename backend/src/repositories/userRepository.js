import User from "../models/User.js";

export async function findByUsername(username, options = {}) {
    const query = User.findOne({ username });

    if (options.session) {
        query.session(options.session);
    }

    return query.exec();
}

export async function findByEmail(email, options = {}) {
    const query = User.findOne({ email });

    if (options.includePassword) {
        query.select("+password");
    }

    if (options.includeRefreshTokenHash) {
        query.select("+refreshTokenHash");
    }

    if (options.session) {
        query.session(options.session);
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

    if (options.session) {
        query.session(options.session);
    }

    return query.exec();
}

export async function listUsers(filters = {}, options = {}) {
    const query = User.find(filters);

    if (options.sort) {
        query.sort(options.sort);
    }

    if (typeof options.skip === "number" && options.skip > 0) {
        query.skip(options.skip);
    }

    if (typeof options.limit === "number" && options.limit > 0) {
        query.limit(options.limit);
    }

    return query.lean().exec();
}

export async function countUsers(filters = {}) {
    return User.countDocuments(filters).exec();
}

export async function createUser(userData, options = {}) {
    const user = new User(userData);
    return user.save(options.session ? { session: options.session } : undefined);
}

export async function saveUser(user) {
    return user.save();
}



export async function setRefreshTokenHash(userId, refreshTokenHash, options = {}) {
    return User.findByIdAndUpdate(
        userId,
        { refreshTokenHash },
        {
            new: true,
            session: options.session,
        }
    ).exec();
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
