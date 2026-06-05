'use client';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchPokemon, Pokemon } from '@/lib/api';
import PokemonGrid from '@/components/explore/PokemonGrid';
import PokemonModal from '@/components/explore/PokemonModal';
import TypeFilterBar from '@/components/explore/TypeFilterBar';
import Pagination from '@/components/explore/Pagination';
import useSearch from '@/hooks/useSearch';
import useTypeFilter from '@/hooks/useTypeFilter';
import { capitalize, padId } from '@/lib/utils';
import { SearchResult } from '@/hooks/useSearch';

function idFromUrl(url: string) {
    return parseInt(url.split('/').filter(Boolean).pop()!);
}

export default function ExploreClient({
    pokemon,
    allNames,
    page,
    totalPages,
    total,
}: {
    pokemon: { name: string; url: string }[];
    allNames: string[];
    page: number;
    totalPages: number;
    total: number;
}) {
    const router = useRouter();
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(
        null
    );
    const [modalLoading, setModalLoading] = useState(false);
    const { query, results, isSearching, search, clearSearch } =
        useSearch(allNames);
    const { activeType, setActiveType, allPokemonTypes, setAllPokemonTypes } =
        useTypeFilter(allNames);

    const handleTypeDataLoaded = useCallback(
        (id: number, types: string[]) => {
            if (activeType)
                setAllPokemonTypes((previous) =>
                    new Map(previous).set(id, types)
                );
        },
        [activeType, setAllPokemonTypes]
    );

    const filteredPokemonList = useMemo(() => {
        if (!activeType) return pokemon;
        return pokemon.filter((entry) => {
            const types = allPokemonTypes.get(idFromUrl(entry.url));
            if (!types) return true;
            return types.includes(activeType);
        });
    }, [activeType, pokemon, allPokemonTypes]);

    async function openModal(id: number) {
        setModalLoading(true);
        setSelectedPokemon(null);
        try {
            setSelectedPokemon(await fetchPokemon(id));
        } catch {}
        setModalLoading(false);
    }

    function openModalFromSearch(result: SearchResult) {
        clearSearch();
        openModal(result.id);
    }

    return (
        <div className="explore-container">
            <div
                style={{
                    display: 'flex',
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            background: 'white',
                            borderRadius: 40,
                            padding: '10px 18px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            border: '1px solid #e5e7eb',
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            value={query}
                            onChange={(event) => search(event.target.value)}
                            placeholder="Search all Pokémon by name or number..."
                            style={{
                                flex: 1,
                                border: 'none',
                                outline: 'none',
                                fontSize: 15,
                                background: 'transparent',
                                color: '#374151',
                            }}
                        />
                        {query && (
                            <button
                                onClick={clearSearch}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    color: '#9ca3af',
                                    fontSize: 18,
                                    lineHeight: 1,
                                }}
                            >
                                X
                            </button>
                        )}
                        {isSearching && (
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 48 48"
                                fill="none"
                            >
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="18"
                                    stroke="#e5e7eb"
                                    strokeWidth="4"
                                />
                                <path
                                    d="M24 6 a18 18 0 0 1 18 18"
                                    stroke="#c0392b"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                >
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from="0 24 24"
                                        to="360 24 24"
                                        dur="0.8s"
                                        repeatCount="indefinite"
                                    />
                                </path>
                            </svg>
                        )}
                    </div>
                    {results.length > 0 && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '110%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                borderRadius: 12,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                border: '1px solid #e5e7eb',
                                zIndex: 50,
                                overflow: 'hidden',
                            }}
                        >
                            {results.map((result) => (
                                <div
                                    key={result.id}
                                    onClick={() => openModalFromSearch(result)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '9px 14px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f3f4f6',
                                    }}
                                    onMouseEnter={(event) =>
                                        ((
                                            event.currentTarget as HTMLElement
                                        ).style.background = '#f9fafb')
                                    }
                                    onMouseLeave={(event) =>
                                        ((
                                            event.currentTarget as HTMLElement
                                        ).style.background = 'white')
                                    }
                                >
                                    {result.sprite ? (
                                        <img
                                            src={result.sprite}
                                            width={32}
                                            height={32}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: '#f3f4f6',
                                            }}
                                        />
                                    )}
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: '#374151',
                                        }}
                                    >
                                        {capitalize(result.name)}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: '#9ca3af',
                                            marginLeft: 'auto',
                                        }}
                                    >
                                        {padId(result.id)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <TypeFilterBar
                    activeType={activeType}
                    onTypeChange={setActiveType}
                />
            </div>

            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
                Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of{' '}
                {total} Pokémon
            </div>

            <PokemonGrid
                key={page}
                pokemonList={filteredPokemonList}
                onPokemonClick={openModal}
                onTypeDataLoaded={handleTypeDataLoaded}
            />

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => router.push(`/explore?page=${p}`)}
            />

            <PokemonModal
                pokemon={selectedPokemon}
                loading={modalLoading}
                onClose={() => {
                    setSelectedPokemon(null);
                    setModalLoading(false);
                }}
            />
        </div>
    );
}