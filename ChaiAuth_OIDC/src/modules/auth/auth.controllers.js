import { createUser, loginUser, rotateTokens, revokeSession, COOKIE_OPTS } from "./auth.services.js";
import ApiResponse from "../../common/utils/apiResponse.js";

export async function handleSignUp(req, res, next) {
    try {
        const { username, password, display_name, email, avatar_url, bio, organization } = req.body;
        const profile = { display_name, email, avatar_url, bio, organization };
        const user = await createUser(username, password, profile);
        ApiResponse.created(res, "Registration successful", user);
    } catch (err) {
        next(err);
    }
}

export async function handleLogin(req, res, next) {
    try {
        const { username, password } = req.body;
        const { user, accessToken, refreshToken } = await loginUser(username, password);
        res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
        res.status(200).json({ success: true, data: { user, accessToken } });
    } catch (err) {
        next(err);
    }
}

export async function handleRefresh(req, res, next) {
    try {
        const { accessToken, refreshToken } = await rotateTokens(req.cookies?.refreshToken);
        res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
        res.status(200).json({ success: true, data: { accessToken } });
    } catch (err) {
        next(err);
    }
}

export async function handleLogout(req, res, next) {
    try {
        await revokeSession(req.cookies?.refreshToken);
        res.clearCookie("refreshToken");
        res.status(200).json({ success: true, message: "Logged out" });
    } catch (err) {
        next(err);
    }
}
