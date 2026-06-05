'use client';
import { useState, useRef, useCallback } from 'react';
import { getCachedSlim } from '@/lib/api';

export type SearchResult = { id: number; name: string; sprite: string | null };

export default function useSearch(allNames: string[]) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const search = useCallback(
        (inputQuery: string) => {
            setQuery(inputQuery);
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            if (!inputQuery.trim()) {
                setResults([]);
                return;
            }
            debounceTimer.current = setTimeout(async () => {
                setIsSearching(true);
                const normalizedQuery = inputQuery.toLowerCase();
                const matchingNames = allNames
                    .filter((name) => name.includes(normalizedQuery) || name.replace(/-/g, ' ').includes(normalizedQuery))
                    .slice(0, 10);

                const fetchedResults = await Promise.all(
                    matchingNames.map((name) => {
                        const pokemonId = allNames.indexOf(name) + 1;
                        const cached = getCachedSlim(pokemonId);
                        if (cached) return Promise.resolve({ id: cached.id, name: cached.name, sprite: cached.sprite } as SearchResult);
                        return fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
                            .then((response) => response.json())
                            .then((data) => ({
                                id: data.id,
                                name: data.name,
                                sprite: data.sprites?.other?.['official-artwork']?.front_default ?? data.sprites?.front_default ?? null,
                            }) as SearchResult)
                            .catch(() => null);
                    })
                );

                setResults(fetchedResults.filter(Boolean) as SearchResult[]);
                setIsSearching(false);
            }, 280);
        },
        [allNames]
    );

    const clearSearch = useCallback(() => {
        setQuery('');
        setResults([]);
    }, []);

    return { query, results, isSearching, search, clearSearch };
}
