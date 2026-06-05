import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId, partyErrorResponse } from '@/lib/poke/party.helpers';
import { emptyParty } from '@/lib/poke/party.services';

export async function DELETE(req: NextRequest) {
    const userIdOrError = getAuthenticatedUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;

    try {
        const { removed } = await emptyParty(userIdOrError);
        return NextResponse.json({ success: true, removed }, { status: 200 });
    } catch (err) {
        return partyErrorResponse(err);
    }
}
