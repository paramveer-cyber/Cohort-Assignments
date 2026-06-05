import { NextRequest } from 'next/server';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth/tokens';
import { findUserById, rotateRefreshToken } from '@/lib/auth/queries';
import { REFRESH_COOKIE_NAME, refreshCookieOptions, ok, errorResponse } from '@/lib/auth/helpers';

export async function POST(req: NextRequest) {
    const token = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
    if (!token) return errorResponse('No refresh token', 401);

    let decoded: { userId: string };
    try {
        decoded = verifyRefreshToken(token);
    } catch {
        return errorResponse('Invalid or expired refresh token', 401);
    }

    const newRefreshToken = generateRefreshToken(decoded.userId);
    const rotated = await rotateRefreshToken(token, newRefreshToken);

    if (!rotated) {
        const res = errorResponse('Refresh token reuse detected', 401);
        res.cookies.delete(REFRESH_COOKIE_NAME);
        return res;
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
        const res = errorResponse('User not found', 401);
        res.cookies.delete(REFRESH_COOKIE_NAME);
        return res;
    }

    const newAccessToken = generateAccessToken(user.id, user.email);
    const res = ok({ token: newAccessToken });
    res.cookies.set(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions);
    return res;
}
