import { createUser, loginUser, logoutUser, updateTokens } from "./auth.services.js";
import ApiResponse from "../common/utils/apiResponse.js"

async function handleSignUp(req, res, next){
    try {
        const {username, password} = req.body;
        const createdUser = await createUser(username, password);
        ApiResponse.created(res, "Registration success", createdUser);
    } catch (err) {
        next(err);
    }
}

async function handleLogin(req, res, next){
    try {
        const {username, password} = req.body;
        const { user, accessToken, refreshToken } = await loginUser(username, password);
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });
        res.status(200).json({ user, accessToken });
    } catch (err) {
        next(err);
    }
}

async function handleLogout(req, res, next){
    try {
        const token = req.cookies?.refreshToken;
        await logoutUser(token);
        res.clearCookie("refreshToken");
        res.redirect(302, "/");
    } catch (err) {
        next(err);
    }
}

async function refreshTokens(req, res, next){
    try {
        const token = req.cookies?.refreshToken;
        const { accessToken, refreshToken } = await updateTokens(token);
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });
        res.status(200).json({ accessToken });
    } catch (err) {
        next(err);
    }
}

export {handleLogin, handleSignUp, handleLogout, refreshTokens};