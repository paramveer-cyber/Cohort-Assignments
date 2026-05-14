import jwt from "jsonwebtoken";

export const generateToken = (id, email) => {
    return jwt.sign({ userId: id, email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY || "15m",
        issuer: "pollApp",
    });
}

export const generateRefreshToken = (id) =>
    jwt.sign({ userId: id }, process.env.REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_EXPIRY || "7d",
        issuer: "pollApp",
    });

export const verifyToken = (token) =>
    jwt.verify(token, process.env.JWT_SECRET, { issuer: "pollApp" });

export const verifyRefreshToken = (token) =>
    jwt.verify(token, process.env.REFRESH_SECRET, { issuer: "pollApp" });