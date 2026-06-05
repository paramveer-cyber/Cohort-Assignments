import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/poke/party.helpers';
import { getParty } from '@/lib/poke/party.services';

export async function GET(req: NextRequest) {
    const userIdOrError = getAuthenticatedUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;

    const { slots, xp } = await getParty(userIdOrError);
    return NextResponse.json({ success: true, slots, xp }, { status: 200 });
}
