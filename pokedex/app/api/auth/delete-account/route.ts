import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/tokens';
import { findUserById, deleteUserById } from '@/lib/auth/queries';
import { REFRESH_COOKIE_NAME, ok, errorResponse } from '@/lib/auth/helpers';

export async function DELETE(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return errorResponse('Missing Bearer token', 401);

    const token = authHeader.split(' ')[1];

    let decoded: { userId: string };
    try {
        decoded = verifyAccessToken(token);
    } catch (err: any) {
        if (err?.name === 'TokenExpiredError') return errorResponse('Token expired', 401);
        return errorResponse('Invalid token', 401);
    }

    const user = await findUserById(decoded.userId);
    if (!user) return errorResponse('User not found', 404);

    await deleteUserById(decoded.userId);

    const res = ok({ message: 'Account deleted' });
    res.cookies.delete(REFRESH_COOKIE_NAME);
    return res;
}
