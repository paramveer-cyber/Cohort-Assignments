import { NextRequest } from 'next/server';
import { logoutUser } from '@/lib/auth/services';
import { REFRESH_COOKIE_NAME, ok } from '@/lib/auth/helpers';

export async function POST(req: NextRequest) {
    const token = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
    if (token) await logoutUser(token);

    const res = ok({ message: 'Logged out' });
    res.cookies.delete(REFRESH_COOKIE_NAME);
    return res;
}
