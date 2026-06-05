import { generateAccessToken, generateRefreshToken } from '@/lib/auth/tokens';
import { generateSalt, hashPassword, verifyPassword } from '@/lib/auth/password';
import {
    findUserByEmail, findUserByRefreshToken, insertUser, setUserRefreshToken,
} from '@/lib/auth/queries';

async function generateTokensForUser(user: { id: string; email: string }) {
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);
    await setUserRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
}

export async function registerLocalUser(data: { username: string; email: string; password: string }) {
    const existing = await findUserByEmail(data.email);
    if (existing) throw new Error('EMAIL_TAKEN');

    const salt = generateSalt();
    const passwordHash = hashPassword(data.password, salt);

    const user = await insertUser({
        username: data.username,
        email: data.email,
        salt,
        password: passwordHash,
        provider: 'local',
    });

    const { accessToken, refreshToken } = await generateTokensForUser(user);
    return { user, accessToken, refreshToken };
}

export async function loginLocalUser(data: { email: string; password: string }) {
    const user = await findUserByEmail(data.email);
    if (!user || user.provider !== 'local' || !user.password || !user.salt) {
        throw new Error('INVALID_CREDENTIALS');
    }

    const valid = verifyPassword(data.password, user.salt, user.password);
    if (!valid) throw new Error('INVALID_CREDENTIALS');

    const { accessToken, refreshToken } = await generateTokensForUser(user);
    return { user, accessToken, refreshToken };
}

export async function findOrCreateGoogleUser(userInfo: { sub: string; email: string; name?: string }) {
    const { email, name } = userInfo;

    const byEmail = await findUserByEmail(email);

    if (byEmail) {
        if (byEmail.provider !== 'google') throw new Error('EMAIL_CONFLICT');
        const { accessToken, refreshToken } = await generateTokensForUser(byEmail);
        return { user: byEmail, accessToken, refreshToken };
    }

    const newUser = await insertUser({
        username: name ?? email.split('@')[0],
        email,
        provider: 'google',
    });

    const { accessToken, refreshToken } = await generateTokensForUser(newUser);
    return { user: newUser, accessToken, refreshToken };
}

export async function logoutUser(refreshToken: string) {
    const user = await findUserByRefreshToken(refreshToken);
    if (user) await setUserRefreshToken(user.id, null);
}
