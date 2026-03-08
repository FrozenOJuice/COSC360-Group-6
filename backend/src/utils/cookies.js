import { config } from "../config/env.js";
import { durationToMs } from "./duration.js";

export const buildCookieOptions = (maxAgeMs) => {
    const options = {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: config.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    };
    if (maxAgeMs) options.maxAge = maxAgeMs;
    return options;
}

export function setAuthCookies(res, accessToken, refreshToken) {
    const accessMaxAge = durationToMs(config.JWT_ACCESS_EXPIRES_IN);
    const refreshMaxAge = durationToMs(config.JWT_REFRESH_EXPIRES_IN);

    res.cookie("accessToken", accessToken, buildCookieOptions(accessMaxAge));
    res.cookie("refreshToken", refreshToken, buildCookieOptions(refreshMaxAge));
}

export function clearAuthCookies(res) {
    const options = buildCookieOptions();
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);
}