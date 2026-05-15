import {
    registerLocalUser, loginLocalUser,
    verifyGoogleToken, findOrCreateGoogleUser,
} from "./auth.services.js";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../../common/utils/tokenLogic.js";
import {
    findUserById, findUserByRefreshToken, setUserRefreshToken, deleteUserById, rotateRefreshToken,
} from "./auth.queries.js";
import ApiError from "../../common/utils/api-error.js";
import { ok, created } from "../../common/utils/response.js";
import jwt from "jsonwebtoken";

const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const ANON_COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
};

const formatUser = (u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
    provider: u.provider,
    createdAt: u.createdAt,
});

export const register = async (req, res, next) => {
    try {
        const { user, accessToken, refreshToken } = await registerLocalUser(req.body);
        res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
        return created(res, "Account created", { token: accessToken, user: formatUser(user) });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { user, accessToken, refreshToken } = await loginLocalUser(req.body);
        res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
        return ok(res, "Login successful", { token: accessToken, user: formatUser(user) });
    } catch (err) {
        next(err);
    }
};

export const googleAuth = async (req, res, next) => {
    try {
        const payload = await verifyGoogleToken(req.body.idToken);
        const { user, accessToken, refreshToken } = await findOrCreateGoogleUser(payload);
        res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
        return ok(res, "Login successful", { token: accessToken, user: formatUser(user) });
    } catch (err) {
        next(err);
    }
};

export const refresh = async (req, res, next) => {
    try {
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
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const user = await findUserById(req.user.userId);
        if (!user) throw ApiError.notFound("User not found");
        return ok(res, "User fetched", { user: formatUser(user) });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        if (token) {
            const user = await findUserByRefreshToken(token);
            if (user) await setUserRefreshToken(user.id, null);
        }
        res.clearCookie("refreshToken");
        return ok(res, "Logged out");
    } catch (err) {
        next(err);
    }
};

export const deleteAccount = async (req, res, next) => {
    try {
        const user = await findUserById(req.user.userId);
        if (!user) throw ApiError.notFound("User not found");
        await deleteUserById(req.user.userId);
        res.clearCookie("refreshToken");
        return ok(res, "Account deleted");
    } catch (err) {
        next(err);
    }
};

export const issueAnonToken = async (req, res, next) => {
    try {
        const existingCookie = req.cookies?.anonToken;
        let anonId;

        if (existingCookie) {
            try {
                const decoded = jwt.verify(existingCookie, process.env.JWT_SECRET, { issuer: "pollApp" });
                anonId = decoded.anonId;
            } catch {
                anonId = crypto.randomUUID();
            }
        } else {
            anonId = crypto.randomUUID();
        }

        const anonToken = jwt.sign({ anonId }, process.env.JWT_SECRET, {
            expiresIn: "30d",
            issuer: "pollApp",
        });

        res.cookie("anonToken", anonToken, ANON_COOKIE_OPTS);
        return ok(res, "Anon token issued", { issued: true });
    } catch (err) {
        next(err);
    }
};
