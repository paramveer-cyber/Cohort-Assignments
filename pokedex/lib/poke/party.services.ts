import {
    getPartySlots,
    getPartySize,
    pokemonAlreadyInParty,
    slotOccupied,
    insertPartySlot,
    deletePartySlot,
    updateSlotOrder,
    clearParty,
    getUserXP,
    deductXP,
    nextAvailableOrderId,
    PartySlot,
} from './party.queries';

const MAX_PARTY_SIZE = 6;
const XP_PER_POKEMON = 10;

export type PartyError =
    | 'PARTY_FULL'
    | 'ALREADY_IN_PARTY'
    | 'SLOT_OCCUPIED'
    | 'SLOT_NOT_FOUND'
    | 'POKEMON_NOT_IN_PARTY'
    | 'INSUFFICIENT_XP'
    | 'INVALID_ORDER_ID'
    | 'INVALID_POKEMON_ID';

export class PartyServiceError extends Error {
    statusCode: number;
    isOperational: boolean;
    xpRequired?: number;
    xpAvailable?: number;

    constructor(public code: PartyError, meta?: { xpRequired?: number; xpAvailable?: number }) {
        super(code);
        this.statusCode = 400;
        this.isOperational = true;
        if (meta?.xpRequired !== undefined) this.xpRequired = meta.xpRequired;
        if (meta?.xpAvailable !== undefined) this.xpAvailable = meta.xpAvailable;
        Error.captureStackTrace(this, this.constructor);
    }
}

function validateOrderId(orderId: string) {
    const value = parseFloat(orderId);
    if (isNaN(value) || value <= 0 || value > MAX_PARTY_SIZE) {
        throw new PartyServiceError('INVALID_ORDER_ID');
    }
}

function validatePokeId(pokeId: number) {
    if (!Number.isInteger(pokeId) || pokeId < 1 || pokeId > 99999) {
        throw new PartyServiceError('INVALID_POKEMON_ID');
    }
}

export async function addPokemonToParty(
    userId: string,
    pokeId: number,
    pokemonStats: { name: string; value: number }[]
): Promise<{ slot: PartySlot; newXP: number }> {
    validatePokeId(pokeId);

    const size = await getPartySize(userId);
    if (size >= MAX_PARTY_SIZE) throw new PartyServiceError('PARTY_FULL');

    const alreadyIn = await pokemonAlreadyInParty(userId, pokeId);
    if (alreadyIn) throw new PartyServiceError('ALREADY_IN_PARTY');

    const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    const xpCost = pokemonStats
        .filter(stat => statNames.includes(stat.name))
        .reduce((total, stat) => total + stat.value, 0);

    const currentXP = await getUserXP(userId);
    const xpResult = await deductXP(userId, xpCost);
    if (!xpResult) throw new PartyServiceError('INSUFFICIENT_XP', { xpRequired: xpCost, xpAvailable: currentXP });

    const orderId = await nextAvailableOrderId(userId);
    const slot = await insertPartySlot(userId, pokeId, orderId!);

    return { slot, newXP: xpResult.newXP };
}

export async function removePokemonFromParty(userId: string, pokeId: number): Promise<{ removed: boolean }> {
    validatePokeId(pokeId);

    const removed = await deletePartySlot(userId, pokeId);
    if (!removed) throw new PartyServiceError('POKEMON_NOT_IN_PARTY');

    return { removed: true };
}

export async function reorderPartySlot(userId: string, slotId: string, newOrderId: string): Promise<{ updated: boolean }> {
    validateOrderId(newOrderId);

    const occupied = await slotOccupied(userId, newOrderId);
    if (occupied) throw new PartyServiceError('SLOT_OCCUPIED');

    const updated = await updateSlotOrder(userId, slotId, newOrderId);
    if (!updated) throw new PartyServiceError('SLOT_NOT_FOUND');

    return { updated: true };
}

export async function emptyParty(userId: string): Promise<{ removed: number }> {
    const removed = await clearParty(userId);
    return { removed };
}

export async function getParty(userId: string): Promise<{ slots: PartySlot[]; xp: number }> {
    const [slots, xp] = await Promise.all([
        getPartySlots(userId),
        getUserXP(userId),
    ]);
    return { slots, xp };
}

export { XP_PER_POKEMON, MAX_PARTY_SIZE };