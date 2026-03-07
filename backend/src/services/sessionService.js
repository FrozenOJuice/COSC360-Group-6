import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { httpError } from "../utils/httpError.js";

export function signAccessToken(userId) {
    if (!userId) {
        throw httpError(401, "INVALID_TOKEN_PAYLOAD", "Cannot sign access token without user id");
    }

    return jwt.sign(
        { sub: String(userId), type: "access" },
        config.JWT_ACCESS_SECRET,
        { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
    );
}

export function signRefreshToken(userId) {
    if (!userId) {
        throw httpError(401, "INVALID_TOKEN_PAYLOAD", "Cannot sign refresh token without user id");
    }

    return jwt.sign(
        { sub: String(userId), type: "refresh" },
        config.JWT_REFRESH_SECRET,
        { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
    );
}

export function verifyAccessToken(token) {
    if (!token) {
        throw httpError(401, "MISSING_ACCESS_TOKEN", "Access token is required");
    }

    try {
        const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
        if (decoded.type !== "access") {
            throw httpError(401, "INVALID_ACCESS_TOKEN", "Invalid access token type");
        }
        return decoded;
    } catch (error) {
        if (error.status && error.code) throw error;
        throw httpError(401, "INVALID_ACCESS_TOKEN", "Access token is invalid or expired");
    }
}

export function verifyRefreshToken(token) {
    if (!token) {
        throw httpError(401, "MISSING_REFRESH_TOKEN", "Refresh token is required");
    }

    try {
        const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
        if (decoded.type !== "refresh") {
            throw httpError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token type");
        }
        return decoded;
    } catch (error) {
        if (error.status && error.code) throw error;
        throw httpError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired");
    }
}

export function hashRefreshToken(refreshToken) {
    if (!refreshToken) {
        throw httpError(401, "MISSING_REFRESH_TOKEN", "Refresh token is required");
    }

    return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

export function createSessionTokens(userId) {
    const accessToken = signAccessToken(userId);
    const refreshToken = signRefreshToken(userId);
    const refreshTokenHash = hashRefreshToken(refreshToken);

    return { accessToken, refreshToken, refreshTokenHash };
}
