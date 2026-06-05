import { NextRequest } from 'next/server';
import { z } from 'zod';
import { registerLocalUser } from '@/lib/auth/services';
import { REFRESH_COOKIE_NAME, refreshCookieOptions, formatUser, created, errorResponse, mapServiceError } from '@/lib/auth/helpers';

const RegisterSchema = z.object({
    username: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) return errorResponse('Invalid input', 400);

    try {
        const { user, accessToken, refreshToken } = await registerLocalUser(parsed.data);
        const res = created({ token: accessToken, user: formatUser(user) });
        res.cookies.set(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
        return res;
    } catch (err) {
        return mapServiceError(err);
    }
}
