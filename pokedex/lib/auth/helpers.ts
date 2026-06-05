import { NextResponse } from 'next/server';

export const REFRESH_COOKIE_NAME = 'refreshToken';

export const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
};

export function formatUser(u: {
    id: string;
    username: string;
    email: string;
    provider: string;
    createdAt: Date;
}) {
    return {
        id: u.id,
        username: u.username,
        email: u.email,
        provider: u.provider,
        createdAt: u.createdAt,
    };
}

export function ok(data: Record<string, unknown>, status = 200) {
    return NextResponse.json({ success: true, ...data }, { status });
}

export function created(data: Record<string, unknown>) {
    return NextResponse.json({ success: true, ...data }, { status: 201 });
}

export function errorResponse(message: string, status: number) {
    return NextResponse.json({ success: false, message }, { status });
}

export function mapServiceError(err: unknown) {
    const message = err instanceof Error ? err.message : 'UNKNOWN';
    if (message === 'EMAIL_TAKEN') return errorResponse('Email already registered', 409);
    if (message === 'INVALID_CREDENTIALS') return errorResponse('Invalid credentials', 401);
    if (message === 'INVALID_GOOGLE_TOKEN') return errorResponse('Invalid Google token', 400);
    if (message === 'EMAIL_CONFLICT') return errorResponse('Account exists with password. Sign in normally.', 409);
    return errorResponse('Internal server error', 500);
}
