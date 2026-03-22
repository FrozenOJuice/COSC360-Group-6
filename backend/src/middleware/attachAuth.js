import { findById } from "../repositories/userRepository.js";
import { verifyAccessToken } from "../services/sessionService.js";

export async function attachAuth(req, res, next) {
    try {
        const cookieToken = req.cookies?.accessToken;
        if (!cookieToken) {
            return next();
        }

        const decoded = verifyAccessToken(cookieToken);
        const user = await findById(decoded.sub);

        if (!user || user.status === "disabled") {
            return next();
        }

        req.auth = {
            userId: user.id,
            role: user.role,
        };
        return next();
    } catch {
        return next();
    }
}
