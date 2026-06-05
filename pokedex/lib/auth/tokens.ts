import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET!;

export function generateAccessToken(userId: string, email: string) {
    return jwt.sign({ userId, email }, ACCESS_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string) {
    return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, ACCESS_SECRET) as { userId: string; email: string };
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string };
}
