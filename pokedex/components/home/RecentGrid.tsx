'use client';
import { useMemo } from 'react';
import { Pokemon } from '@/lib/api';
import PokemonBubble from '@/components/PokemonBubble';

export default function RecentGrid({
    recent,
    onSelect,
}: {
    recent: Pokemon[];
    onSelect: (pokemon: Pokemon) => void;
}) {
    const gridSlots = useMemo<(Pokemon | null)[]>(
        () => [...recent, ...Array(Math.max(0, 9 - recent.length)).fill(null)],
        [recent]
    );

    return (
        <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#374151' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 8 12 12 14 14" />
                </svg>
                Recent
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {gridSlots.map((pokemon, index) => (
                    <PokemonBubble
                        key={index}
                        pokemon={pokemon}
                        size={76}
                        onClick={() => pokemon && onSelect(pokemon)}
                    />
                ))}
            </div>
        </div>
    );
}
