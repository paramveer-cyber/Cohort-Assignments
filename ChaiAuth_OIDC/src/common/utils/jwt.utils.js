import jwt from "jsonwebtoken";
import { getPrivateKey, getPublicKey, getKid } from "../../cert/keys.js";

const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";
const ISSUER = process.env.ISSUER || "http://localhost:8080";


export function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
}

export function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

export function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export function signOidcToken(payload, expiresIn) {
    const finalPayload = payload.iss ? payload : { ...payload, iss: ISSUER };

    return jwt.sign(finalPayload, getPrivateKey(), {
        algorithm: "RS256",
        keyid: getKid(),
        ...(expiresIn ? { expiresIn } : {}),
    });
}

