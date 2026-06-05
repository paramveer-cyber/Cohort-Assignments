import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/tokens';

export function getAuthenticatedUserId(req: NextRequest): string | NextResponse {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ success: false, message: 'Missing Bearer token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyAccessToken(token);
        return decoded.userId;
    } catch (err: any) {
        const message = err?.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
        return NextResponse.json({ success: false, message }, { status: 401 });
    }
}

export function partyErrorResponse(err: unknown) {
    if (err instanceof Error) {
        const code = err.message;
        if (code === 'PARTY_FULL') return NextResponse.json({ success: false, message: 'Party is full (max 6)' }, { status: 409 });
        if (code === 'ALREADY_IN_PARTY') return NextResponse.json({ success: false, message: 'Pokemon already in party' }, { status: 409 });
        if (code === 'SLOT_OCCUPIED') return NextResponse.json({ success: false, message: 'That slot is already taken' }, { status: 409 });
        if (code === 'SLOT_NOT_FOUND') return NextResponse.json({ success: false, message: 'Slot not found' }, { status: 404 });
        if (code === 'POKEMON_NOT_IN_PARTY') return NextResponse.json({ success: false, message: 'Pokemon not in party' }, { status: 404 });
        if (code === 'INSUFFICIENT_XP') return NextResponse.json({ success: false, message: 'Not enough XP to add pokemon. Go to the Quiz page to earn more XP!', xpRequired: (err as any).xpRequired, xpAvailable: (err as any).xpAvailable }, { status: 402 });
        if (code === 'INVALID_ORDER_ID') return NextResponse.json({ success: false, message: 'Invalid order ID' }, { status: 400 });
        if (code === 'INVALID_POKEMON_ID') return NextResponse.json({ success: false, message: 'Invalid pokemon ID' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
}