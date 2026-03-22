import rateLimit from "express-rate-limit";

export function createRateLimit({ windowMs, max, message }) {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            status: 429,
            code: "RATE_LIMITED",
            message: message || "Too many requests, please try again later",
        },
    });
}

export const registerRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many registration attempts, please try again later",
});

export const loginRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts, please try again later",
});

export const refreshRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many session refresh attempts, please try again later",
});
