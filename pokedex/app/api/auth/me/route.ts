import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/tokens';
import { findUserById } from '@/lib/auth/queries';
import { formatUser, ok, errorResponse } from '@/lib/auth/helpers';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return errorResponse('Missing Bearer token', 401);

    const token = authHeader.split(' ')[1];

    let decoded: { userId: string; email: string };
    try {
        decoded = verifyAccessToken(token);
    } catch (err: any) {
        if (err?.name === 'TokenExpiredError') return errorResponse('Token expired', 401);
        return errorResponse('Invalid token', 401);
    }

    const user = await findUserById(decoded.userId);
    if (!user) return errorResponse('User not found', 404);

    return ok({ user: formatUser(user) });
}
