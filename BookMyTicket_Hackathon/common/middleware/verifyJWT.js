import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } from "../utils/jwt.utils.js";
import ApiError from "../utils/apiError.js";
import pool from "../db/db.js";

async function verifyJWT(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(ApiError.unauthorized("Access token required"));
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        return next();
    } catch (err) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return next(ApiError.unauthorized("Access token expired and no refresh token provided"));
        }
        try {
            const decoded = verifyRefreshToken(refreshToken);
            const result = await pool.query(
                "SELECT * FROM users WHERE user_id = $1 LIMIT 1",
                [decoded.id]
            );
            const user = result.rows[0];
            if (!user || user.refresh_token !== refreshToken) {
                return next(ApiError.unauthorized("Invalid refresh token"));
            }
            const newAccessToken = generateAccessToken({ id: user.user_id, name: user.username });
            const newRefreshToken = generateRefreshToken({ id: user.user_id, name: user.username });
            await pool.query(
                "UPDATE users SET refresh_token = $1 WHERE user_id = $2",
                [newRefreshToken, user.user_id]
            );
            res.setHeader("X-New-Access-Token", newAccessToken);
            res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true, sameSite: "strict" });
            req.user = { id: user.user_id, name: user.username };
            return next();
        } catch {
            return next(ApiError.unauthorized("Invalid or expired refresh token"));
        }
    }
}

export default verifyJWT;