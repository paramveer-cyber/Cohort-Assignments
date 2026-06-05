import { NextRequest } from 'next/server';
import { z } from 'zod';
import { loginLocalUser } from '@/lib/auth/services';
import { REFRESH_COOKIE_NAME, refreshCookieOptions, formatUser, ok, errorResponse, mapServiceError } from '@/lib/auth/helpers';

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) return errorResponse('Invalid input', 400);

    try {
        const { user, accessToken, refreshToken } = await loginLocalUser(parsed.data);
        const res = ok({ token: accessToken, user: formatUser(user) });
        res.cookies.set(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
        return res;
    } catch (err) {
        return mapServiceError(err);
    }
}
