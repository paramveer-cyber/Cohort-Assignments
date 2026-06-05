import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserId, partyErrorResponse } from '@/lib/poke/party.helpers';
import { removePokemonFromParty } from '@/lib/poke/party.services';

const RemoveSchema = z.object({
    pokeId: z.number().int().min(1).max(99999),
});

export async function DELETE(req: NextRequest) {
    const userIdOrError = getAuthenticatedUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;

    const body = await req.json().catch(() => null);
    const parsed = RemoveSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });

    try {
        await removePokemonFromParty(userIdOrError, parsed.data.pokeId);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        return partyErrorResponse(err);
    }
}