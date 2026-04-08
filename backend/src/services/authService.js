import { toUserDto } from "../dto/userDto.js";
import { clearRefreshTokenHash, createUser, findByEmail, findByUsername, findById, setRefreshTokenHash, } from "../repositories/userRepository.js";
import { hashRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken, } from "./sessionService.js";
import { appError } from "../utils/appError.js";
import { createInitialEmployerProfile } from "./employerProfileService.js";
import { createInitialSeekerProfile } from "./seekerProfileService.js";

export async function registerUser(payload) {
    const safePayload = payload || {};
    const { name: rawName, username: rawUsername, email: rawEmail, password: rawPassword, role } = safePayload;
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const username = typeof rawUsername === "string" ? rawUsername.trim() : "";
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const password = typeof rawPassword === "string" ? rawPassword : "";

    if (!name || !username || !email || !password) {
        throw appError("INVALID_REQUEST", "Name, username, email, and password are required");
    }

    if (role === "admin") {
        throw appError("ROLE_NOT_ALLOWED", "Admin role cannot be selected during registration");
    }

    const existingUser = await findByEmail(email);
    if (existingUser) {
        throw appError("EMAIL_ALREADY_IN_USE", "Email is already registered");
    }

    const existingUsername = await findByUsername(username);
    if (existingUsername) {
        throw appError("USERNAME_ALREADY_IN_USE", "Username is already taken");
    }

    const user = await createUser({ name, username, email, password, role });

    if (user.role === "seeker") {
        await createInitialSeekerProfile(user._id);
    }

    if (user.role === "employer") {
        await createInitialEmployerProfile(user);
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    const refreshTokenHash = hashRefreshToken(refreshToken);
    await setRefreshTokenHash(user.id, refreshTokenHash);

    return {
        user: toUserDto(user),
        accessToken,
        refreshToken,
    };
}

export async function loginUser(payload) {
    const safePayload = payload || {};
    const { email: rawEmail, password: rawPassword } = safePayload;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const password = typeof rawPassword === "string" ? rawPassword : "";

    if (!email || !password) {
        throw appError("INVALID_REQUEST", "Email and password are required");
    }

    const user = await findByEmail(email, { includePassword: true });
    if (!user) {
        throw appError("INVALID_CREDENTIALS", "Invalid email or password");
    }

    if (user.status === "disabled") {
        throw appError("ACCOUNT_DISABLED", "This account has been disabled");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw appError("INVALID_CREDENTIALS", "Invalid email or password");
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    const refreshTokenHash = hashRefreshToken(refreshToken);
    await setRefreshTokenHash(user.id, refreshTokenHash);

    return {
        user: toUserDto(user),
        accessToken,
        refreshToken,
    };
}

export async function refreshSession(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await findById(decoded.sub, { includeRefreshTokenHash: true });

    if (!user) {
        throw appError("INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired");
    }

    if (user.status === "disabled") {
        await clearRefreshTokenHash(user.id);
        throw appError("ACCOUNT_DISABLED", "This account has been disabled");
    }

    if (!user.refreshTokenHash) {
        throw appError("INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired");
    }

    const incomingHash = hashRefreshToken(refreshToken);
    if (user.refreshTokenHash !== incomingHash) {
        await clearRefreshTokenHash(user.id);
        throw appError("INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired");
    }

    const nextAccessToken = signAccessToken(user.id);
    const nextRefreshToken = signRefreshToken(user.id);
    const nextRefreshTokenHash = hashRefreshToken(nextRefreshToken);
    await setRefreshTokenHash(user.id, nextRefreshTokenHash);

    return {
        user: toUserDto(user),
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
    };
}

export async function logoutSession(refreshToken) {
    if (!refreshToken) {
        return { success: true };
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await findById(decoded.sub, { includeRefreshTokenHash: true });

        if (!user || !user.refreshTokenHash) {
            return { success: true };
        }

        const incomingHash = hashRefreshToken(refreshToken);
        if (user.refreshTokenHash !== incomingHash) {
            return { success: true };
        }

        await clearRefreshTokenHash(user.id);
    } catch (error) {
        if (error.isAppError && error.code === "INVALID_REFRESH_TOKEN") {
            return { success: true };
        }

        throw error;
    }

    return { success: true };
}

export async function getCurrentUser(userId) {
    if (!userId) {
        throw appError("UNAUTHORIZED", "Not authenticated");
    }

    const user = await findById(userId);
    if (!user) {
        throw appError("USER_NOT_FOUND", "User not found");
    }

    return {
        user: toUserDto(user),
    };
}
