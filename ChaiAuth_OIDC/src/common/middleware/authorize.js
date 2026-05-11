import { verifyAccessToken } from "../utils/jwt.utils.js";
import ApiError from "../utils/apiError.js";
import { Role } from "../constants/roles.js";

function extractToken(req) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return null;
    return header.split(" ")[1];
}

export function requireRole(...roles) {
    return (req, res, next) => {
        const token = extractToken(req);
        if (!token) return next(ApiError.unauthorized("Missing token"));
        try {
            const decoded = verifyAccessToken(token);
            if (!roles.includes(decoded.role)) return next(ApiError.forbidden("Insufficient permissions"));
            req.user = decoded;
            next();
        } catch {
            next(ApiError.unauthorized("Invalid or expired token"));
        }
    };
}

export const requireAdmin = requireRole(Role.ADMIN);
export const requireDeveloper = requireRole(Role.DEVELOPER, Role.ADMIN);
