'use server';

import {
    updateSlotOrder,
    addUserXP,
    removeUserXP,
} from '@/lib/poke/party.queries';
import { verifyAccessToken } from '@/lib/auth/tokens';

export async function swapPartySlots(
    accessToken: string,
    slotIdA: string,
    slotIdB: string,
    orderIdA: string,
    orderIdB: string
): Promise<{ success: boolean; message?: string }> {
    let userId: string;
    try {
        const decoded = verifyAccessToken(accessToken);
        userId = decoded.userId;
    } catch {
        return { success: false, message: 'Unauthorized' };
    }

    const tempOrderId = (parseFloat(orderIdA) + 0.001).toFixed(3);

    try {
        await updateSlotOrder(userId, slotIdA, tempOrderId);
        await updateSlotOrder(userId, slotIdB, orderIdA);
        await updateSlotOrder(userId, slotIdA, orderIdB);
        return { success: true };
    } catch {
        return { success: false, message: 'Failed to reorder' };
    }
}

export async function updateXP(
    accessToken: string,
    delta: number
): Promise<{ success: boolean; newXP?: number; message?: string }> {
    if (!Number.isInteger(delta) || delta === 0) {
        return { success: false, message: 'delta must be a non-zero integer' };
    }

    let userId: string;
    try {
        const decoded = verifyAccessToken(accessToken);
        userId = decoded.userId;
    } catch {
        return { success: false, message: 'Unauthorized' };
    }

    const result =
        delta > 0
            ? await addUserXP(userId, delta)
            : await removeUserXP(userId, Math.abs(delta));

    if (!result) return { success: false, message: 'User not found' };

    return { success: true, newXP: result.newXP };
}
