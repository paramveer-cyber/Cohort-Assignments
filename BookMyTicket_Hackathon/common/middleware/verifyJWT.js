import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } from "../utils/jwt.utils.js";
import { getUser, updateRefreshToken } from "../db/db.js";
import ApiError from "../utils/apiError.js";

async function verifyJWT(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(ApiError.unauthorized("Access token required"));
    }

    const token = authHeader.split(" ")[1];

    // access
    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        return next();
    } catch {
        // expired
    }

    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return next(ApiError.unauthorized("Access token expired and no refresh token provided"));
    }

    // refresh
    try {
        const decoded = verifyRefreshToken(refreshToken);

        const user = await getUser(decoded.name);
        if (!user) {
            return next(ApiError.unauthorized("User not found"));
        }

        // validate
        if (user.refresh_token !== refreshToken) {
            await updateRefreshToken(user.username, null);
            return next(ApiError.unauthorized("Refresh token reuse detected"));
        }

        const newAccessToken = generateAccessToken({ id: user.user_id, name: user.username });
        const newRefreshToken = generateRefreshToken({ id: user.user_id, name: user.username });

        // rotate
        await updateRefreshToken(user.username, newRefreshToken);

        res.setHeader("X-New-Access-Token", newAccessToken);
        res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true, sameSite: "strict" });

        req.user = { id: user.user_id, name: user.username };
        return next();
    } catch {
        return next(ApiError.unauthorized("Invalid or expired refresh token"));
    }
}

export default verifyJWT;
