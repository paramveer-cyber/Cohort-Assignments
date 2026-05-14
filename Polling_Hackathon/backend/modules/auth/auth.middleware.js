import { verifyToken } from "../../common/utils/tokenLogic.js";
import ApiError from "../../common/utils/api-error.js";

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return next(ApiError.unAuthorized("Missing Bearer token"));
        }

        const token = authHeader.split(" ")[1];

        try {
            req.user = verifyToken(token);
            return next();
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return next(ApiError.unAuthorized("Token expired"));
            }
            return next(ApiError.unAuthorized("Invalid token"));
        }
    } catch {
        return next(ApiError.unAuthorized("Unauthorized"));
    }
};

export const optionalAuth = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                req.user = verifyToken(token);
            } catch {
                // treat as anonymous
            }
        }
    } catch {
        // ignore
    }
    return next();
};
