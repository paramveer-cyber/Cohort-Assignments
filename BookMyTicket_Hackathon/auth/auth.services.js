import { checkIfUserExists, getUser, insertUser, updateRefreshToken } from "../common/db/db.js";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../common/utils/jwt.utils.js"
import ApiError from "../common/utils/apiError.js"
import bcrypt from "bcrypt"

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
    console.log("createdUser:", createdUser);
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
    const user = await findUser(username, password);
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
    const decoded = verifyRefreshToken(refreshToken);
    await updateRefreshToken(decoded.name, null);
}

async function updateTokens(refreshToken) {
    let decodedRefreshToken;
    try {
        decodedRefreshToken = verifyRefreshToken(refreshToken);
    }
    catch {
        throw ApiError.unauthorized("Invalid or expired refresh token!")
    }
    const user = await findUser(decodedRefreshToken.name);
    if (user.refresh_token !== refreshToken) {
        throw ApiError.unauthorized("Invalid refresh token!")
    }
    const newAccessToken = generateAccessToken({ id: user.user_id, name: user.username });
    const newRefreshToken = generateRefreshToken({ id: user.user_id, name: user.username });
    
    await updateRefreshToken(user.username, newRefreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export { createUser, loginUser, logoutUser, updateTokens };