import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserId, partyErrorResponse } from '@/lib/poke/party.helpers';
import { reorderPartySlot } from '@/lib/poke/party.services';

const ReorderSchema = z.object({
    slotId: z.string().uuid(),
    newOrderId: z.string().regex(/^\d+\.\d{3}$/),
});

export async function PATCH(req: NextRequest) {
    const userIdOrError = getAuthenticatedUserId(req);
    if (userIdOrError instanceof NextResponse) return userIdOrError;

    const body = await req.json().catch(() => null);
    const parsed = ReorderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });

    try {
        await reorderPartySlot(userIdOrError, parsed.data.slotId, parsed.data.newOrderId);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        return partyErrorResponse(err);
    }
}
