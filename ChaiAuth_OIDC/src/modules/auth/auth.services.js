import bcrypt from "bcrypt";
import { checkIfUserExists, checkIfEmailExists, getUser, insertUser, updateRefreshToken } from "../../common/db/db.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../common/utils/jwt.utils.js";
import ApiError from "../../common/utils/apiError.js";
import { Role } from "../../common/constants/roles.js";

const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function tokenPayload(user) {
    return {
        id: user.user_id,
        name: user.username,
        display_name: user.display_name || user.username,
        email: user.email || null,
        role: user.role,
    };
}

function sanitizeUser(user) {
    const { password, refresh_token, ...safe } = user;
    return safe;
}

export async function createUser(username, password, profile = {}) {
    const exists = await checkIfUserExists(username);
    if (exists) throw ApiError.conflict("Username already exists!");

    if (profile.email) {
        const emailTaken = await checkIfEmailExists(profile.email);
        if (emailTaken) throw ApiError.conflict("Email already in use!");
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await insertUser(username, hashed, Role.USER, profile);
    return sanitizeUser(user);
}

export async function loginUser(username, password) {
    const user = await getUser(username);
    if (!user) throw ApiError.unauthorized("Invalid username or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw ApiError.unauthorized("Invalid username or password");

    const payload = tokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await updateRefreshToken(username, refreshToken);

    return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function rotateTokens(incomingRefreshToken) {
    if (!incomingRefreshToken) throw ApiError.unauthorized("Refresh token required");

    let decoded;
    try {
        decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
        throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const user = await getUser(decoded.name);
    if (!user) throw ApiError.unauthorized("User not found");

    if (user.refresh_token !== incomingRefreshToken) {
        await updateRefreshToken(user.username, null);
        throw ApiError.unauthorized("Refresh token reuse detected — session revoked");
    }

    const payload = tokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await updateRefreshToken(user.username, refreshToken);

    return { accessToken, refreshToken };
}

export async function revokeSession(incomingRefreshToken) {
    if (!incomingRefreshToken) return;

    let decoded;
    try {
        decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
        return; 
    }

    await updateRefreshToken(decoded.name, null);
}

export { COOKIE_OPTS };
