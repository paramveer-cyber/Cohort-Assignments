import { db } from '@/db/db';
import { user_party, users } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

const MAX_PARTY_SIZE = 6;

export type PartySlot = {
    id: string;
    pokeId: number;
    orderId: string;
};

export const getPartySlots = (userId: string): Promise<PartySlot[]> =>
    db
        .select({
            id: user_party.id,
            pokeId: user_party.pokeId,
            orderId: user_party.orderId,
        })
        .from(user_party)
        .where(eq(user_party.userId, userId))
        .orderBy(user_party.orderId);

export const getPartySize = async (userId: string): Promise<number> => {
    const rows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(user_party)
        .where(eq(user_party.userId, userId));
    return rows[0]?.count ?? 0;
};

export const slotOccupied = async (
    userId: string,
    orderId: string
): Promise<boolean> => {
    const rows = await db
        .select({ id: user_party.id })
        .from(user_party)
        .where(
            and(eq(user_party.userId, userId), eq(user_party.orderId, orderId))
        );
    return rows.length > 0;
};

export const pokemonAlreadyInParty = async (
    userId: string,
    pokeId: number
): Promise<boolean> => {
    const rows = await db
        .select({ id: user_party.id })
        .from(user_party)
        .where(
            and(eq(user_party.userId, userId), eq(user_party.pokeId, pokeId))
        );
    return rows.length > 0;
};

export const insertPartySlot = async (
    userId: string,
    pokeId: number,
    orderId: string
): Promise<PartySlot> => {
    const [slot] = await db
        .insert(user_party)
        .values({ userId, pokeId, orderId })
        .returning({
            id: user_party.id,
            pokeId: user_party.pokeId,
            orderId: user_party.orderId,
        });
    return slot;
};

export const deletePartySlot = async (
    userId: string,
    pokeId: number
): Promise<boolean> => {
    const result = await db
        .delete(user_party)
        .where(
            and(eq(user_party.userId, userId), eq(user_party.pokeId, pokeId))
        )
        .returning({ id: user_party.id });
    return result.length > 0;
};

export const updateSlotOrder = async (
    userId: string,
    slotId: string,
    newOrderId: string
): Promise<boolean> => {
    const result = await db
        .update(user_party)
        .set({ orderId: newOrderId })
        .where(and(eq(user_party.id, slotId), eq(user_party.userId, userId)))
        .returning({ id: user_party.id });
    return result.length > 0;
};

export const clearParty = async (userId: string): Promise<number> => {
    const result = await db
        .delete(user_party)
        .where(eq(user_party.userId, userId))
        .returning({ id: user_party.id });
    return result.length;
};

export const getUserXP = async (userId: string): Promise<number> => {
    const rows = await db
        .select({ userXP: users.userXP })
        .from(users)
        .where(eq(users.id, userId));
    return rows[0]?.userXP ?? 0;
};

export const deductXP = async (
    userId: string,
    xpCost: number
): Promise<{ newXP: number } | null> => {
    const result = await db
        .update(users)
        .set({ userXP: sql`${users.userXP} - ${xpCost}` })
        .where(and(eq(users.id, userId), sql`${users.userXP} >= ${xpCost}`))
        .returning({ newXP: sql<number>`COALESCE(${users.userXP}, 0)` });
    return result[0] ?? null;
};

export const addUserXP = async (
    userId: string,
    xpAmount: number
): Promise<{ newXP: number } | null> => {
    const rows = await db
        .update(users)
        .set({ userXP: sql`${users.userXP} + ${xpAmount}` })
        .where(eq(users.id, userId))
        .returning({ newXP: sql<number>`COALESCE(${users.userXP}, 0)` });
    return rows[0] ?? null;
};

export const removeUserXP = async (
    userId: string,
    xpAmount: number
): Promise<{ newXP: number } | null> => {
    const rows = await db
        .update(users)
        .set({ userXP: sql`GREATEST(${users.userXP} - ${xpAmount}, 0)` })
        .where(eq(users.id, userId))
        .returning({ newXP: sql<number>`COALESCE(${users.userXP}, 0)` });
    return rows[0] ?? null;
};

export const nextAvailableOrderId = async (
    userId: string
): Promise<string | null> => {
    const slots = await getPartySlots(userId);
    const taken = new Set(slots.map((s) => s.orderId));
    for (let i = 1; i <= MAX_PARTY_SIZE; i++) {
        const candidate = i.toFixed(3);
        if (!taken.has(candidate)) return candidate;
    }
    return null;
};
