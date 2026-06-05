import { NextRequest } from 'next/server';
import { z } from 'zod';
import { findOrCreateGoogleUser } from '@/lib/auth/services';
import { REFRESH_COOKIE_NAME, refreshCookieOptions, formatUser, ok, errorResponse, mapServiceError } from '@/lib/auth/helpers';

const GoogleAuthSchema = z.object({
    accessToken: z.string().min(1),
    userInfo: z.object({
        sub: z.string(),
        email: z.string().email(),
        name: z.string().optional(),
        email_verified: z.boolean().optional(),
    }),
});

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const parsed = GoogleAuthSchema.safeParse(body);
    if (!parsed.success) return errorResponse('Invalid input', 400);

    const { userInfo } = parsed.data;
    if (!userInfo.email_verified) return errorResponse('Google email not verified', 400);

    try {
        const { user, accessToken, refreshToken } = await findOrCreateGoogleUser(userInfo);
        const res = ok({ token: accessToken, user: formatUser(user) });
        res.cookies.set(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
        return res;
    } catch (err) {
        return mapServiceError(err);
    }
}
