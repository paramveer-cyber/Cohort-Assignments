'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { swapPartySlots } from '@/actions/party';
import { Pokemon, fetchPokemon } from '@/lib/api';
import PokemonSVG from '@/components/PokemonSVG';
import TypeBadge from '@/components/TypeBadge';
import { InfoTab, StatsTab, MovesTab, EvoTab } from '@/components/shared/PokemonTabs';
import TabBar, { TabId } from '@/components/shared/TabBar';
import Spinner from '@/components/shared/Spinner';
import { capitalize, padId, typeColor } from '@/lib/utils';
import useSearch from '@/hooks/useSearch';
import { SearchResult } from '@/hooks/useSearch';
import { useAuth } from '@/context/auth/AuthContext';
import Link from 'next/link';
import ShareButton from '@/components/shared/ShareButton';

const MAX_PARTY = 6;

type DbPartySlot = { id: string; pokeId: number; orderId: string };

function EmptySlot({ slotNumber, onAddClick }: { slotNumber: number; onAddClick: () => void }) {
    return (
        <div
            onClick={onAddClick}
            style={{
                background: 'white',
                borderRadius: 20,
                border: '2px dashed #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 24,
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                minHeight: 160,
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#c0392b';
                (e.currentTarget as HTMLElement).style.background = '#fef9f9';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
                (e.currentTarget as HTMLElement).style.background = 'white';
            }}
        >
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
            </div>
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Slot {slotNumber}</span>
        </div>
    );
}

function PartySlot({
    pokemon,
    isSelected,
    onSelect,
    onRemove,
    onDragStart,
    onDragOver,
    onDrop,
    isDragOver,
}: {
    pokemon: Pokemon;
    isSelected: boolean;
    onSelect: () => void;
    onRemove: () => void;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    isDragOver: boolean;
}) {
    const primaryTypeColor = typeColor(pokemon.types[0]);

    return (
        <div
            draggable
            onClick={onSelect}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            onDragEnter={(e) => e.preventDefault()}
            style={{
                background: isDragOver
                    ? `linear-gradient(135deg, ${primaryTypeColor.bg}33, white)`
                    : isSelected
                    ? `linear-gradient(135deg, ${primaryTypeColor.bg}, white)`
                    : 'white',
                borderRadius: 20,
                border: isDragOver
                    ? `2px dashed ${primaryTypeColor.bg}`
                    : `2px solid ${isSelected ? primaryTypeColor.bg : '#e5e7eb'}`,
                padding: '16px 16px 12px',
                cursor: 'grab',
                transition: 'all 0.15s',
                position: 'relative',
                boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
                transform: isDragOver ? 'scale(1.03)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
            }}
        >
            <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                title="Remove from team"
                style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', fontSize: 16, lineHeight: 1, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#c0392b')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#9ca3af')}
            >
                ×
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 72, height: 72 }}>
                    {pokemon.sprite ? (
                        <img src={pokemon.sprite} alt={pokemon.name} width={72} height={72} style={{ objectFit: 'contain' }} />
                    ) : (
                        <PokemonSVG id={pokemon.id} types={pokemon.types} size={72} />
                    )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1a202c', textAlign: 'center' }}>{capitalize(pokemon.name)}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{padId(pokemon.id)}</div>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {pokemon.types.map((type) => <TypeBadge key={type} type={type} />)}
                </div>
            </div>
        </div>
    );
}

function AddPokemonPanel({
    allNames,
    currentParty,
    onAdd,
    onClose,
    accessToken,
}: {
    allNames: string[];
    currentParty: Pokemon[];
    onAdd: (pokemon: Pokemon) => void;
    onClose: () => void;
    accessToken: string;
}) {
    const { query, results, isSearching, search, clearSearch } = useSearch(allNames);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleSelect(result: SearchResult) {
        if (currentParty.some((p) => p.id === result.id)) {
            setErrorMessage(`${capitalize(result.name)} is already in your team`);
            setTimeout(() => setErrorMessage(null), 2000);
            return;
        }
        setLoadingId(result.id);
        try {
            const fullPokemon = await fetchPokemon(result.id);

            const addResponse = await fetch('/api/poke/party/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ pokeId: fullPokemon.id, pokemonStats: fullPokemon.stats }),
            });

            if (!addResponse.ok) {
                const errorData = await addResponse.json();
                setErrorMessage(errorData.message ?? 'Failed to add Pokémon');
                setTimeout(() => setErrorMessage(null), 3000);
                setLoadingId(null);
                return;
            }

            onAdd(fullPokemon);
            clearSearch();
        } catch {
            setErrorMessage('Something went wrong');
            setTimeout(() => setErrorMessage(null), 2000);
        }
        setLoadingId(null);
    }

    return (
        <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a202c', margin: 0 }}>Add to Team</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {errorMessage && (
                <div style={{ marginBottom: 12, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
                    {errorMessage}
                </div>
            )}

            <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', borderRadius: 40, padding: '10px 16px', border: '1px solid #e5e7eb' }}>
                    <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        value={query}
                        onChange={(e) => search(e.target.value)}
                        placeholder="Search Pokémon to add..."
                        autoFocus
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: '#374151' }}
                    />
                    {isSearching && (
                        <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                            <circle cx="24" cy="24" r="18" stroke="#e5e7eb" strokeWidth="4" />
                            <path d="M24 6 a18 18 0 0 1 18 18" stroke="#c0392b" strokeWidth="4" strokeLinecap="round">
                                <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="0.8s" repeatCount="indefinite" />
                            </path>
                        </svg>
                    )}
                </div>

                {results.length > 0 && (
                    <div style={{ marginTop: 8, borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                        {results.map((result) => {
                            const alreadyInParty = currentParty.some((p) => p.id === result.id);
                            const isLoading = loadingId === result.id;
                            return (
                                <div
                                    key={result.id}
                                    onClick={() => !alreadyInParty && !isLoading && handleSelect(result)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '10px 14px',
                                        cursor: alreadyInParty ? 'not-allowed' : 'pointer',
                                        borderBottom: '1px solid #f3f4f6',
                                        opacity: alreadyInParty ? 0.5 : 1,
                                        background: 'white',
                                    }}
                                    onMouseEnter={(e) => { if (!alreadyInParty) (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
                                >
                                    {isLoading ? (
                                        <Spinner size={32} />
                                    ) : result.sprite ? (
                                        <img src={result.sprite} width={32} height={32} style={{ objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6' }} />
                                    )}
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{capitalize(result.name)}</span>
                                    <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{padId(result.id)}</span>
                                    {alreadyInParty && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>In team</span>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function PokemonDetailPanel({ pokemon }: { pokemon: Pokemon }) {
    const [activeTab, setActiveTab] = useState<TabId>('info');
    const primaryTypeColor = typeColor(pokemon.types[0]);

    return (
        <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
            <div style={{ background: `linear-gradient(135deg, #c0392b 0%, #96281b 100%)`, padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {pokemon.sprite ? (
                        <img src={pokemon.sprite} alt={pokemon.name} width={74} height={74} style={{ objectFit: 'contain' }} />
                    ) : (
                        <PokemonSVG id={pokemon.id} types={pokemon.types} size={74} />
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 22, color: 'white' }}>{capitalize(pokemon.name)}</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{padId(pokemon.id)}</span>
                        {pokemon.isLegendary && <span style={{ fontSize: 9, background: '#f59e0b', color: '#78350f', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>LEGEND</span>}
                        {pokemon.isMythical && <span style={{ fontSize: 9, background: '#a855f7', color: 'white', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>MYTHIC</span>}
                    </div>
                    {pokemon.genus && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{pokemon.genus}</div>}
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                        {pokemon.types.map((type) => <TypeBadge key={type} type={type} />)}
                    </div>
                </div>
                {pokemon.cryUrl && (
                    <button
                        onClick={() => new Audio(pokemon.cryUrl!).play()}
                        style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '7px 9px', cursor: 'pointer', flexShrink: 0 }}
                        title="Play cry"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" strokeWidth="2" fill="none" />
                        </svg>
                    </button>
                )}
            </div>
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
            <div style={{ padding: '16px 20px', overflowY: 'auto', maxHeight: 420 }}>
                {activeTab === 'info' && <InfoTab pokemon={pokemon} />}
                {activeTab === 'stats' && <StatsTab pokemon={pokemon} />}
                {activeTab === 'moves' && <MovesTab pokemon={pokemon} />}
                {activeTab === 'evo' && <EvoTab pokemon={pokemon} nodeSize={52} />}
            </div>
        </div>
    );
}

function UnauthenticatedWall() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center' }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a202c', margin: '0 0 10px' }}>Sign in to form your team</h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 32px', maxWidth: 340 }}>
                Create an account or sign in to build and save your Pokémon team.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/signin" style={{ background: '#c0392b', color: 'white', padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    Sign In
                </Link>
                <Link href="/signup" style={{ background: 'white', color: '#374151', padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', border: '2px solid #e5e7eb' }}>
                    Sign Up
                </Link>
            </div>
        </div>
    );
}

export default function MyTeamClient({ allNames }: { allNames: string[] }) {
    const { user, isLoading: authLoading, store } = useAuth();
    const [party, setParty] = useState<Pokemon[]>([]);
    const [partySlots, setPartySlots] = useState<DbPartySlot[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isLoadingParty, setIsLoadingParty] = useState(false);
    const dragSourceIndex = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    function showToast(message: string) {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 2500);
    }

    const fetchPartyFromDb = useCallback(async () => {
        const accessToken = store.getAccessToken();
        if (!accessToken) return;

        setIsLoadingParty(true);
        try {
            const response = await fetch('/api/poke/party', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!response.ok) return;

            const data = await response.json();
            const slots: DbPartySlot[] = data.slots;
            setPartySlots(slots);

            const pokemonList = await Promise.all(slots.map((slot) => fetchPokemon(slot.pokeId)));
            const sortedByOrder = pokemonList.sort((a, b) => {
                const aOrder = parseFloat(slots.find(s => s.pokeId === a.id)?.orderId ?? '0');
                const bOrder = parseFloat(slots.find(s => s.pokeId === b.id)?.orderId ?? '0');
                return aOrder - bOrder;
            });
            setParty(sortedByOrder);
        } catch {
        } finally {
            setIsLoadingParty(false);
        }
    }, [store]);

    useEffect(() => {
        if (user) fetchPartyFromDb();
    }, [user, fetchPartyFromDb]);

    const handleAdd = useCallback((pokemon: Pokemon) => {
        setParty((prev) => {
            if (prev.some((p) => p.id === pokemon.id)) return prev;
            if (prev.length >= MAX_PARTY) return prev;
            return [...prev, pokemon];
        });
        setSelectedPokemon(pokemon);
        showToast(`${capitalize(pokemon.name)} joined the team!`);
        if (party.length + 1 >= MAX_PARTY) setShowAddPanel(false);
    }, [party.length]);

    const handleRemove = useCallback(async (pokemonId: number) => {
        const accessToken = store.getAccessToken();
        if (!accessToken) return;

        try {
            const response = await fetch('/api/poke/party/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ pokeId: pokemonId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                showToast(errorData.message ?? 'Failed to remove Pokémon');
                return;
            }

            setParty((prev) => {
                const updated = prev.filter((p) => p.id !== pokemonId);
                if (selectedPokemon?.id === pokemonId) setSelectedPokemon(updated[0] ?? null);
                return updated;
            });
            showToast('Removed from team');
        } catch {
            showToast('Something went wrong');
        }
    }, [store, selectedPokemon]);

    const handleSwap = useCallback(async (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        const accessToken = store.getAccessToken();
        if (!accessToken) return;

        const fromPokemon = party[fromIndex];
        const toPokemon = party[toIndex];
        const fromSlot = partySlots.find(s => s.pokeId === fromPokemon.id);
        const toSlot = partySlots.find(s => s.pokeId === toPokemon.id);
        if (!fromSlot || !toSlot) return;

        const reorderedParty = [...party];
        reorderedParty[fromIndex] = toPokemon;
        reorderedParty[toIndex] = fromPokemon;
        setParty(reorderedParty);

        const result = await swapPartySlots(accessToken, fromSlot.id, toSlot.id, fromSlot.orderId, toSlot.orderId);
        if (!result.success) {
            showToast(result.message ?? 'Reorder failed');
            setParty(party);
        } else {
            setPartySlots(prev => prev.map(slot => {
                if (slot.id === fromSlot.id) return { ...slot, orderId: toSlot.orderId };
                if (slot.id === toSlot.id) return { ...slot, orderId: fromSlot.orderId };
                return slot;
            }));
        }
    }, [party, partySlots, store]);

    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px 20px' }}>
                <Spinner size={40} />
            </div>
        );
    }

    if (!user) {
        return <UnauthenticatedWall />;
    }

    const slots = Array.from({ length: MAX_PARTY }, (_, index) => party[index] ?? null);
    const isEmpty = party.length === 0;
    const isFull = party.length >= MAX_PARTY;

    return (
        <div className="page-container">
            {toastMessage && (
                <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', color: 'white', padding: '10px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>
                    {toastMessage}
                </div>
            )}

            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a202c', margin: 0, letterSpacing: '-0.5px' }}>My Team</h1>
                        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, margin: 0 }}>
                            {party.length} / {MAX_PARTY} Pokémon
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ShareButton party={party} username={user.username} />
                        {!isFull && (
                            <button
                                onClick={() => setShowAddPanel((prev) => !prev)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#c0392b', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(192,57,43,0.3)', transition: 'background 0.2s' }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#a93226')}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#c0392b')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Pokémon
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showAddPanel && (
                <div style={{ marginBottom: 24 }}>
                    <AddPokemonPanel
                        allNames={allNames}
                        currentParty={party}
                        onAdd={handleAdd}
                        onClose={() => setShowAddPanel(false)}
                        accessToken={store.getAccessToken() ?? ''}
                    />
                </div>
            )}

            {isLoadingParty ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 20px' }}>
                    <Spinner size={40} />
                </div>
            ) : isEmpty ? (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12h8M12 8v8" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Your team is empty</h2>
                    <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>Add up to 6 Pokémon to build your team</p>
                    <button
                        onClick={() => setShowAddPanel(true)}
                        style={{ background: '#c0392b', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                    >
                        Add your first Pokémon
                    </button>
                </div>
            ) : (
                <div className={`my-team-detail-grid${selectedPokemon ? '' : ' single-col'}`}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, letterSpacing: 0.3, marginBottom: -4 }}>
                            Drag to reorder
                        </div>
                        <div className="party-slots-grid">
                            {slots.map((pokemon, index) =>
                                pokemon ? (
                                    <PartySlot
                                        key={pokemon.id}
                                        pokemon={pokemon}
                                        isSelected={selectedPokemon?.id === pokemon.id}
                                        isDragOver={dragOverIndex === index}
                                        onSelect={() => setSelectedPokemon(pokemon)}
                                        onRemove={() => handleRemove(pokemon.id)}
                                        onDragStart={() => { dragSourceIndex.current = index; }}
                                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
                                        onDrop={() => {
                                            if (dragSourceIndex.current !== null) handleSwap(dragSourceIndex.current, index);
                                            dragSourceIndex.current = null;
                                            setDragOverIndex(null);
                                        }}
                                    />
                                ) : (
                                    <EmptySlot
                                        key={`empty-${index}`}
                                        slotNumber={index + 1}
                                        onAddClick={() => setShowAddPanel(true)}
                                    />
                                )
                            )}
                        </div>

                        <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Team Types</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {Array.from(new Set(party.flatMap((p) => p.types))).map((type) => (
                                    <TypeBadge key={type} type={type} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {selectedPokemon && (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setSelectedPokemon(null)}
                                style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'white', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                            >
                                ×
                            </button>
                            <PokemonDetailPanel pokemon={selectedPokemon} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}