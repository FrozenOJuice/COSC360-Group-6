import { findById } from "../repositories/userRepository.js";
import { verifyAccessToken } from "../services/sessionService.js";
import { appError } from "../utils/appError.js";

export async function requireAuth(req, res, next) {
    try {
        const cookieToken = req.cookies && req.cookies.accessToken;
        const decoded = verifyAccessToken(cookieToken);
        const user = await findById(decoded.sub);

        if (!user) {
            throw appError("UNAUTHORIZED", "Not authenticated");
        }

        if (user.status === "disabled") {
            throw appError("ACCOUNT_DISABLED", "This account has been disabled");
        }

        req.auth = {
            userId: user.id,
            role: user.role,
        };
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}
