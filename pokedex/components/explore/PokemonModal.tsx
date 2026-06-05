'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Pokemon } from '@/lib/api';
import PokemonHeader from '@/components/shared/PokemonHeader';
import TabBar, { TabId } from '@/components/shared/TabBar';
import {
    InfoTab,
    StatsTab,
    MovesTab,
    EvoTab,
} from '@/components/shared/PokemonTabs';
import Spinner from '@/components/shared/Spinner';

export default function PokemonModal({
    pokemon,
    loading,
    onClose,
}: {
    pokemon: Pokemon | null;
    loading: boolean;
    onClose: () => void;
}) {
    const [activeTab, setActiveTab] = useState<TabId>('info');

    function handleBackdropClick(event: React.MouseEvent) {
        if (event.target === event.currentTarget) onClose();
    }

    if (!loading && !pokemon) return null;

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
            }}
        >
            {loading ? (
                <div
                    style={{
                        background: 'white',
                        borderRadius: 20,
                        padding: 48,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 16,
                    }}
                >
                    <Spinner size={48} />
                    <span
                        style={{
                            color: '#9ca3af',
                            fontWeight: 700,
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                            fontSize: 12,
                        }}
                    >
                        Analyzing...
                    </span>
                </div>
            ) : pokemon ? (
                <div
                    style={{
                        background: 'white',
                        borderRadius: 20,
                        width: '100%',
                        maxWidth: 480,
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
                    }}
                >
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                zIndex: 10,
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                width: 28,
                                height: 28,
                                cursor: 'pointer',
                                color: 'white',
                                fontSize: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            ×
                        </button>
                        <PokemonHeader
                            pokemon={pokemon}
                            spriteSize={74}
                            nameFontSize={20}
                        />
                    </div>
                    <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px 20px',
                        }}
                    >
                        {activeTab === 'info' && <InfoTab pokemon={pokemon} />}
                        {activeTab === 'stats' && (
                            <StatsTab pokemon={pokemon} />
                        )}
                        {activeTab === 'moves' && (
                            <MovesTab pokemon={pokemon} />
                        )}
                        {activeTab === 'evo' && (
                            <EvoTab pokemon={pokemon} nodeSize={52} />
                        )}
                    </div>

                    <div
                        style={{
                            borderTop: '1px solid #f3f4f6',
                            padding: '10px 16px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Link
                            href={`/poke/${pokemon.id}`}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#c0392b',
                                textDecoration: 'none',
                                padding: '6px 14px',
                                borderRadius: 8,
                                border: '1.5px solid #c0392b',
                                transition: 'background 0.15s, color 0.15s',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.background = '#c0392b';
                                (e.currentTarget as HTMLAnchorElement).style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                                (e.currentTarget as HTMLAnchorElement).style.color = '#c0392b';
                            }}
                        >
                            See full details
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            ) : null}
        </div>
    );
}