import { z } from "zod";
import ApiError from "../../common/utils/apiError.js";
import { SignUpSchema, LoginSchema,  User} from "./auth.models.js"

export function validateSignUp(req, res, next) {
    const result = SignUpSchema.safeParse(req.body);
    if (!result.success) return next(ApiError.badRequest(result.error.issues[0].message));
    const data = result.data;
    if (!data.email) delete data.email;
    if (!data.avatar_url) delete data.avatar_url;
    if (!data.display_name) delete data.display_name;
    if (!data.bio) delete data.bio;
    if (!data.organization) delete data.organization;
    req.body = data;
    next();
}

export function validateLogin(req, res, next) {
    const result = LoginSchema.safeParse(req.body);
    if (!result.success) return next(ApiError.badRequest(result.error.issues[0].message));
    req.body = result.data;
    next();
}

export const validateUserData = validateLogin;

export function requireRefreshCookie(req, res, next) {
    if (!req.cookies?.refreshToken) return next(ApiError.badRequest("Refresh token cookie required"));
    next();
}
