'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { loginLocalUser, registerLocalUser } from '@/lib/auth/services';
import {
    formatUser,
    REFRESH_COOKIE_NAME,
    refreshCookieOptions,
} from '@/lib/auth/helpers';

const SignInSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

const SignUpSchema = z.object({
    username: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
});

type AuthActionResult =
    | { success: true; token: string; user: ReturnType<typeof formatUser> }
    | { success: false; message: string };

function mapError(err: unknown): string {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'EMAIL_TAKEN') return 'Email already registered';
    if (msg === 'INVALID_CREDENTIALS') return 'Invalid email or password';
    return 'Something went wrong. Please try again.';
}

export async function signIn(data: {
    email: string;
    password: string;
}): Promise<AuthActionResult> {
    const parsed = SignInSchema.safeParse(data);
    if (!parsed.success) return { success: false, message: 'Invalid input' };

    try {
        const { user, accessToken, refreshToken } = await loginLocalUser(
            parsed.data
        );

        const cookieStore = await cookies();
        cookieStore.set(
            REFRESH_COOKIE_NAME,
            refreshToken,
            refreshCookieOptions
        );

        const u = formatUser(user);
        return {
            success: true,
            token: accessToken,
            user: { ...u, createdAt: u.createdAt },
        };
    } catch (err) {
        return { success: false, message: mapError(err) };
    }
}

export async function signUp(data: {
    username: string;
    email: string;
    password: string;
}): Promise<AuthActionResult> {
    const parsed = SignUpSchema.safeParse(data);
    if (!parsed.success) return { success: false, message: 'Invalid input' };

    try {
        const { user, accessToken, refreshToken } = await registerLocalUser(
            parsed.data
        );

        const cookieStore = await cookies();
        cookieStore.set(
            REFRESH_COOKIE_NAME,
            refreshToken,
            refreshCookieOptions
        );

        const u = formatUser(user);
        return {
            success: true,
            token: accessToken,
            user: { ...u, createdAt: u.createdAt },
        };
    } catch (err) {
        return { success: false, message: mapError(err) };
    }
}
