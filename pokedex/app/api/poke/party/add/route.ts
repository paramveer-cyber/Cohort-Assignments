import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserId, partyErrorResponse } from '@/lib/poke/party.helpers';
import { addPokemonToParty } from '@/lib/poke/party.services';

const StatSchema = z.object({
    name: z.string(),
    value: z.number(),
});

const AddSchema = z.object({
    pokeId: z.number().int().min(1).max(99999),
    pokemonStats: z.array(StatSchema),
});

export async function POST(req: NextRequest) {
    const userIdOrError = getAuthenticatedUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;

    const body = await req.json().catch(() => null);
    const parsed = AddSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });

    try {
        const { slot, newXP } = await addPokemonToParty(userIdOrError, parsed.data.pokeId, parsed.data.pokemonStats);
        return NextResponse.json({ success: true, slot, newXP }, { status: 201 });
    } catch (err) {
        return partyErrorResponse(err);
    }
}