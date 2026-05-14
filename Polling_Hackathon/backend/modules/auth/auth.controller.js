import {
    registerLocalUser, loginLocalUser,
    verifyGoogleToken, findOrCreateGoogleUser,
} from "./auth.services.js";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../../common/utils/tokenLogic.js";
import {
    findUserById, findUserByRefreshToken, setUserRefreshToken, deleteUserById, rotateRefreshToken,
} from "./auth.queries.js";
import ApiError from "../../common/utils/api-error.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { ok, created } from "../../common/utils/response.js";

const COOKIE_OPTS = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000,
};

const formatUser = (u) => ({
    id:        u.id,
    name:      u.name,
    email:     u.email,
    avatarUrl: u.avatarUrl,
    provider:  u.provider,
    createdAt: u.createdAt,
});

export const register = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await registerLocalUser(req.body);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
    return created(res, "Account created", { token: accessToken, user: formatUser(user) });
});

export const login = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await loginLocalUser(req.body);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
    return ok(res, "Login successful", { token: accessToken, user: formatUser(user) });
});

export const googleAuth = asyncHandler(async (req, res) => {
    const payload = await verifyGoogleToken(req.body.idToken);
    const { user, accessToken, refreshToken } = await findOrCreateGoogleUser(payload);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
    return ok(res, "Login successful", { token: accessToken, user: formatUser(user) });
});

export const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) throw ApiError.unAuthorized("No refresh token");

    let decoded;
    try {
        decoded = verifyRefreshToken(token);
    } catch {
        throw ApiError.unAuthorized("Invalid or expired refresh token");
    }

    const newRefreshToken = generateRefreshToken(decoded.userId);

    const rotated = await rotateRefreshToken(token, newRefreshToken);
    if (!rotated) {
        res.clearCookie("refreshToken");
        throw ApiError.unAuthorized("Refresh token reuse detected");
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
        res.clearCookie("refreshToken");
        throw ApiError.unAuthorized("User not found");
    }

    const newAccessToken = generateToken(user.id, user.email);
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTS);
    return ok(res, "Token refreshed", { token: newAccessToken });
});

export const getMe = asyncHandler(async (req, res) => {
    const user = await findUserById(req.user.userId);
    if (!user) throw ApiError.notFound("User not found");
    return ok(res, "User fetched", { user: formatUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token) {
        const user = await findUserByRefreshToken(token);
        if (user) await setUserRefreshToken(user.id, null);
    }
    res.clearCookie("refreshToken");
    return ok(res, "Logged out");
});

export const deleteAccount = asyncHandler(async (req, res) => {
    const user = await findUserById(req.user.userId);
    if (!user) throw ApiError.notFound("User not found");

    await deleteUserById(req.user.userId);
    res.clearCookie("refreshToken");
    return ok(res, "Account deleted");
});