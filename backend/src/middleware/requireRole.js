import { appError } from "../utils/appError.js";

export function requireRole(requiredRoles) {
    const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    return (req, res, next) => {
        const userRole = req.auth && req.auth.role;

        if (!userRole) {
            return next(appError("UNAUTHORIZED", "Not authenticated"));
        }

        if (!allowedRoles.includes(userRole)) {
            return next(appError("ROLE_NOT_ALLOWED", "You do not have permission to access this resource"));
        }

        next();
    };
}
