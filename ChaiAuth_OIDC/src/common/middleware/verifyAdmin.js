import { verifyAccessToken } from "../utils/jwt.utils.js";
import ApiError from "../utils/apiError.js";
import { Role } from "../constants/roles.js";

export function verifyAdmin(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return next(ApiError.unauthorized("Missing token"));

    try {
        const decoded = verifyAccessToken(header.split(" ")[1]);
        if (decoded.role !== Role.ADMIN) return next(ApiError.forbidden("Admin access required"));
        req.user = decoded;
        next();
    } catch {
        next(ApiError.unauthorized("Invalid or expired token"));
    }
}
