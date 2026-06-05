import { Pokemon } from './api';

const RECENT_KEY = 'pdex_recent';
const PARTY_KEY = 'pdex_party';
const MAX_RECENT = 9;
const MAX_PARTY = 6;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type Stamped<T> = { data: T; savedAt: number };

function makeStore<T>(key: string, ttlMs: number | null) {
    function read(): Stamped<T>[] {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function write(entries: Stamped<T>[]) {
        try {
            localStorage.setItem(key, JSON.stringify(entries));
        } catch {}
    }

    function fresh(entries: Stamped<T>[]): Stamped<T>[] {
        if (!ttlMs) return entries;
        const now = Date.now();
        return entries.filter((e) => now - e.savedAt < ttlMs);
    }

    function getAll(): T[] {
        const entries = fresh(read());
        return entries.map((e) => e.data);
    }

    function upsertFront(
        item: T,
        dedupBy: (a: T) => unknown,
        max: number
    ): boolean {
        const entries = fresh(read());
        const withoutDuplicate = entries.filter(
            (e) => dedupBy(e.data) !== dedupBy(item)
        );
        write(
            [{ data: item, savedAt: Date.now() }, ...withoutDuplicate].slice(
                0,
                max
            )
        );
        return true;
    }

    function append(item: T, dedupBy: (a: T) => unknown, max: number): boolean {
        const entries = fresh(read());
        if (entries.some((e) => dedupBy(e.data) === dedupBy(item)))
            return false;
        if (entries.length >= max) return false;
        write([...entries, { data: item, savedAt: Date.now() }]);
        return true;
    }

    function remove(predicate: (a: T) => boolean) {
        write(fresh(read()).filter((e) => !predicate(e.data)));
    }

    function has(predicate: (a: T) => boolean): boolean {
        return fresh(read()).some((e) => predicate(e.data));
    }

    return { getAll, upsertFront, append, remove, has };
}

function makeRecentStore() {
    const store = makeStore<Pokemon>(RECENT_KEY, SEVEN_DAYS_MS);
    const byId = (p: Pokemon) => p.id;
    return {
        get: () => store.getAll(),
        add: (p: Pokemon) => store.upsertFront(p, byId, MAX_RECENT),
    };
}

function makePartyStore() {
    const store = makeStore<Pokemon>(PARTY_KEY, null);
    const byId = (p: Pokemon) => p.id;
    return {
        get: () => store.getAll(),
        add: (p: Pokemon) => store.append(p, byId, MAX_PARTY),
        remove: (id: number) => store.remove((p) => p.id === id),
        has: (id: number) => store.has((p) => p.id === id),
    };
}

const recentStore = makeRecentStore();
const partyStore = makePartyStore();

export const getRecent = recentStore.get;
export const addRecent = recentStore.add;

export const getParty = partyStore.get;
export const addToParty = partyStore.add;
export const removeFromParty = partyStore.remove;
export const isInParty = partyStore.has;
