'use client';
import { useState, useEffect, useCallback } from 'react';
import { Pokemon, fetchPokemon } from '@/lib/api';
import { addRecent, getRecent } from '@/lib/storage';
import PokemonCard from '@/components/PokemonCard';
import SearchBar from '@/components/home/SearchBar';
import RecentGrid from '@/components/home/RecentGrid';
import PokedexDevice from '@/components/home/PokedexDevice';
import useSearch from '@/hooks/useSearch';
import { SearchResult } from '@/hooks/useSearch';

export default function HomeClient({
    suggested,
    allNames,
}: {
    suggested: Pokemon[];
    allNames: string[];
}) {
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(
        null
    );
    const [loadingSelected, setLoadingSelected] = useState(false);
    const [recent, setRecent] = useState<Pokemon[]>([]);
    const { query, results, isSearching, search, clearSearch } =
        useSearch(allNames);

    useEffect(() => {
        setRecent(getRecent());
    }, []);

    const selectPokemon = useCallback(
        async (pokemon: Pokemon | SearchResult) => {
            clearSearch();
            setLoadingSelected(true);
            try {
                const full = await fetchPokemon(pokemon.id);
                setSelectedPokemon(full);
                addRecent(full);
                setRecent(getRecent());
            } catch {
                if ('types' in pokemon && 'stats' in pokemon)
                    setSelectedPokemon(pokemon as Pokemon);
            } finally {
                setLoadingSelected(false);
            }
        },
        [clearSearch]
    );

    return (
        <div className="page-container">
            <SearchBar
                query={query}
                results={results}
                isSearching={isSearching}
                onSearch={search}
                onSelect={selectPokemon}
            />

            <div className="home-grid">
                <RecentGrid recent={recent} onSelect={selectPokemon} />

                <PokedexDevice
                    pokemon={selectedPokemon}
                    loading={loadingSelected}
                />

                <div>
                    <h3
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 15,
                            fontWeight: 600,
                            marginBottom: 16,
                            color: '#374151',
                        }}
                    >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="#f59e0b"
                            stroke="none"
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Suggested
                    </h3>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                        }}
                    >
                        {suggested.map((pokemon) => (
                            <PokemonCard
                                key={pokemon.id}
                                pokemon={pokemon}
                                onClick={() => selectPokemon(pokemon)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}