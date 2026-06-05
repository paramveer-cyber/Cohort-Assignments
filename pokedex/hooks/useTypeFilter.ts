'use client';
import { useState, useEffect } from 'react';
import { fetchSlimPokemon, getCachedSlim } from '@/lib/api';

const BATCH_SIZE = 50;

export default function useTypeFilter(allNames: string[]) {
    const [activeType, setActiveType] = useState<string | null>(null);
    const [allPokemonTypes, setAllPokemonTypes] = useState<Map<number, string[]>>(new Map());

    useEffect(() => {
        if (!activeType) return;

        const allEntries = allNames.map((name, index) => ({ name, id: index + 1 }));

        async function loadBatch(entries: { name: string; id: number }[]) {
            await Promise.all(
                entries.map(async ({ name, id }) => {
                    const cached = getCachedSlim(id);
                    if (cached) {
                        setAllPokemonTypes((previous) => new Map(previous).set(id, cached.types));
                        return;
                    }
                    try {
                        const slim = await fetchSlimPokemon(name, id);
                        setAllPokemonTypes((previous) => new Map(previous).set(id, slim.types));
                    } catch {}
                })
            );
        }

        for (let batchStart = 0; batchStart < allEntries.length; batchStart += BATCH_SIZE) {
            loadBatch(allEntries.slice(batchStart, batchStart + BATCH_SIZE));
        }
    }, [activeType, allNames]);

    return { activeType, setActiveType, allPokemonTypes, setAllPokemonTypes };
}
