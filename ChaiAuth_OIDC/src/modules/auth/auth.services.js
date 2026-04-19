import { checkIfUserExists, getUser, insertUser, updateRefreshToken } from "../../common/db/db.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../common/utils/jwt.utils.js"
import ApiError from "../../common/utils/apiError.js"
import bcrypt from "bcrypt"

// hash
const hash = async (pass) => {
    return await bcrypt.hash(pass, 12);
};

async function createUser(username, password) {
    const userExists = await checkIfUserExists(username);
    if (userExists) {
        throw ApiError.conflict("Username already exists!")
    }
    const hashedPass = await hash(password);
    const createdUser = await insertUser(username, hashedPass);
    delete createdUser.password;
    delete createdUser.refresh_token;
    return createdUser;
}

async function findUser(username) {
    const userExists = await checkIfUserExists(username);
    if (!userExists) {
        throw ApiError.notfound("User Not Found!")
    }
    const user = await getUser(username);
    return user;
}

async function loginUser(username, password) {
    const user = await findUser(username);
    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword) {
        throw ApiError.unauthorized("Invalid username/password!");
    }

    const accessToken = generateAccessToken({ id: user.user_id, name: user.username });
    const refreshToken = generateRefreshToken({ id: user.user_id, name: user.username });
    delete user.password;
    delete user.refresh_token;

    await updateRefreshToken(username, refreshToken);
    return { user, accessToken, refreshToken };
}

async function logoutUser(refreshToken) {
    // decode
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch {
        // expired
        throw ApiError.unauthorized("Invalid or expired refresh token!");
    }
    await updateRefreshToken(decoded.name, null);
}

async function updateTokens(refreshToken) {
    // verify
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch {
        throw ApiError.unauthorized("Invalid or expired refresh token!");
    }

    const user = await findUser(decoded.name);

    // validate
    if (user.refresh_token !== refreshToken) {
        await updateRefreshToken(user.username, null);
        throw ApiError.unauthorized("Refresh token reuse detected!");
    }

    const newAccessToken = generateAccessToken({ id: user.user_id, name: user.username });
    const newRefreshToken = generateRefreshToken({ id: user.user_id, name: user.username });

    // rotate
    await updateRefreshToken(user.username, newRefreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export { createUser, loginUser, logoutUser, updateTokens };
