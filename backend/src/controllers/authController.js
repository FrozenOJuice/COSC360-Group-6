import { asyncHandler } from "../middleware/asyncHandler.js";
import { getCurrentUser, loginUser, logoutSession, refreshSession, registerUser } from "../services/authService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies.js";
import { addUserClient, removeUserClient } from "../utils/userEventBus.js";

export const register = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await registerUser(req.body);
    setAuthCookies(res, accessToken, refreshToken);

    return sendSuccess(res, { user }, 201);
});

export const login = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await loginUser(req.body);
    setAuthCookies(res, accessToken, refreshToken);

    return sendSuccess(res, { user });
});

export const me = asyncHandler(async (req, res) => {
    const userId = req.auth && req.auth.userId;
    const result = await getCurrentUser(userId);
    return sendSuccess(res, result);
});

export const refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies && req.cookies.refreshToken;
    const { user, accessToken, refreshToken: nextRefreshToken } = await refreshSession(refreshToken);
    setAuthCookies(res, accessToken, nextRefreshToken);
    return sendSuccess(res, { user });
});

export function streamAuthState(req, res) {
    const userId = req.auth.userId;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    addUserClient(userId, res);

    const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 30000);

    req.on("close", () => {
        clearInterval(heartbeat);
        removeUserClient(userId, res);
    });
}

export const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies && req.cookies.refreshToken;
    try {
        await logoutSession(refreshToken);
    } finally {
        clearAuthCookies(res);
    }
    return sendSuccess(res, { loggedOut: true });
});
