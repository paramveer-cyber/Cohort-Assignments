import { verifyAccessToken } from "../utils/jwt.utils.js";
import ApiError from "../utils/apiError.js";

const ADMIN = "Paramveer"; // I added this just for fun:) can be ignored as ofcourse in realworld scenario we would check role of user and not just the name

export function verifyAdmin(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return next(ApiError.unauthorized("Missing token"));

    try {
        const token = header.split(" ")[1];
        const decoded = verifyAccessToken(token);
        if (decoded.name !== ADMIN) return next(ApiError.unauthorized("Forbidden"));
        req.user = decoded;
        next();
    } catch {
        next(ApiError.unauthorized("Invalid or expired token"));
    }
}