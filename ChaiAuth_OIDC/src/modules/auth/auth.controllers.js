import bcrypt from "bcrypt";
import {
    createUser, loginUser, rotateTokens, revokeSession, COOKIE_OPTS,
} from "./auth.services.js";
import { getUserById, db } from "../../common/db/db.js";
import { users } from "../../common/db/schema.js";
import { eq } from "drizzle-orm";
import ApiResponse from "../../common/utils/apiResponse.js";
import ApiError from "../../common/utils/apiError.js";

export async function handleSignUp(req, res, next) {
    try {
        const { username, password, display_name, email, avatar_url, bio, organization } = req.body;
        const profile = { display_name, email, avatar_url, bio, organization };
        const user = await createUser(username, password, profile);
        ApiResponse.created(res, "Registration successful", user);
    } catch (err) { next(err); }
}

export async function handleLogin(req, res, next) {
    try {
        const { username, password } = req.body;
        const { user, accessToken, refreshToken } = await loginUser(username, password);
        res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
        res.status(200).json({ success: true, data: { user, accessToken } });
    } catch (err) { next(err); }
}

export async function handleRefresh(req, res, next) {
    try {
        const { accessToken, refreshToken } = await rotateTokens(req.cookies?.refreshToken);
        res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
        res.status(200).json({ success: true, data: { accessToken } });
    } catch (err) { next(err); }
}

export async function handleLogout(req, res, next) {
    try {
        await revokeSession(req.cookies?.refreshToken);
        res.clearCookie("refreshToken", { path: "/auth/refresh" });
        res.status(200).json({ success: true, message: "Logged out" });
    } catch (err) { next(err); }
}

export async function handleGetMe(req, res, next) {
    try {
        const user = await getUserById(req.user.id);
        if (!user) return next(ApiError.notfound("User not found"));
        const { password, refresh_token, ...safe } = user;
        res.json({ success: true, data: safe });
    } catch (err) { next(err); }
}

export async function handleUpdateMe(req, res, next) {
    try {
        const ALLOWED = ["display_name", "email", "avatar_url", "bio", "organization"];
        const updates = {};
        for (const key of ALLOWED) {
            if (req.body[key] !== undefined) updates[key] = req.body[key] || null;
        }
        if (!Object.keys(updates).length) {
            return next(ApiError.badRequest("No valid fields to update"));
        }
        const updated = await db
            .update(users)
            .set(updates)
            .where(eq(users.user_id, req.user.id))
            .returning();
        if (!updated.length) return next(ApiError.notfound("User not found"));
        const { password, refresh_token, ...safe } = updated[0];
        res.json({ success: true, data: safe });
    } catch (err) {
        if (err.code === "23505" && err.constraint?.includes("email")) {
            return next(ApiError.conflict("Email already in use"));
        }
        next(err);
    }
}

export async function handleChangePassword(req, res, next) {
    try {
        const { current_password, new_password } = req.body;
        if (!current_password || !new_password)
            return next(ApiError.badRequest("current_password and new_password are required"));
        if (new_password.length < 8)
            return next(ApiError.badRequest("New password must be at least 8 characters"));

        const user = await getUserById(req.user.id);
        if (!user) return next(ApiError.notfound("User not found"));

        const valid = await bcrypt.compare(current_password, user.password);
        if (!valid) return next(ApiError.unauthorized("Current password is incorrect"));

        const hashed = await bcrypt.hash(new_password, 12);
        await db.update(users).set({ password: hashed }).where(eq(users.user_id, req.user.id));

        res.json({ success: true, message: "Password changed successfully" });
    } catch (err) { next(err); }
}