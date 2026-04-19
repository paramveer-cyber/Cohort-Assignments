import {z} from "zod";
import ApiError from "../../common/utils/apiError.js";

const User = z.object({
    username:  z.string()
            .min(2, "Kindly enter atleast 2 characters!")
            .max(100, "Name Too Long"),
    password: z.string()
            .min(8, "Kindly enter atleast 8 characters!")
            .max(255, "Password too long!")
            .regex(/[A-Z]/, "Must include at least one uppercase letter")
            .regex(/[a-z]/, "Must include at least one lowercase letter")
            .regex(/[0-9]/, "Must include at least one number")
});

function validateUserData(req, res, next){
    const unvalidatedData = req.body;
    const validatedData = User.safeParse(unvalidatedData);
    if (validatedData.success){
        req.body = validatedData.data;
        next();
    }
    else{
        next(ApiError.badRequest(validatedData.error.issues[0].message));
    }
}

function requireRefreshCookie(req, res, next) {
    if (!req.cookies?.refreshToken) {
        return next(ApiError.badRequest("Refresh token cookie is required"));
    }
    next();
}

export { validateUserData, requireRefreshCookie};