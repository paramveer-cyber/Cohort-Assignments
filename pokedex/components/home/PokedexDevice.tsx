'use client';
import { useState } from 'react';
import { Pokemon } from '@/lib/api';
import PokemonHeader from '@/components/shared/PokemonHeader';
import TabBar, { TabId } from '@/components/shared/TabBar';
import { InfoTab, StatsTab, MovesTab, EvoTab } from '@/components/shared/PokemonTabs';
import Spinner from '@/components/shared/Spinner';
import Link from 'next/link';

const DPAD_BUTTONS = [
    { top: 0, left: '50%', transform: 'translateX(-50%)', width: 14, height: 14 },
    { bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 14, height: 14 },
    { left: 0, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14 },
    { right: 0, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14 },
    { top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14 },
];

export default function PokedexDevice({ pokemon, loading }: { pokemon: Pokemon | null; loading?: boolean }) {
    const [activeTab, setActiveTab] = useState<TabId>('info');

    return (
        <div style={{ background: '#c0392b', borderRadius: 20, padding: '20px 18px 24px', boxShadow: '0 8px 32px rgba(192,57,43,0.3), inset 0 1px 1px rgba(255,255,255,0.15)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: '#a93226', borderRadius: '20px 20px 0 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#1abc9c', boxShadow: '0 0 0 3px rgba(26,188,156,0.3)' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e74c3c', opacity: 0.8 }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f39c12', opacity: 0.8 }} />
            </div>

            <div style={{ background: '#f5f5f0', borderRadius: 10, minHeight: 480, border: '3px solid #444', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15)', fontFamily: "'Courier New', monospace", overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {pokemon ? (
                    <>
                        <PokemonHeader pokemon={pokemon} spriteSize={62} nameFontSize={16} />
                        <TabBar activeTab={activeTab} onTabChange={setActiveTab} compact />
                        <div style={{ flex: 1, padding: '12px 14px', overflowY: 'auto' }}>
                            {activeTab === 'info' && <InfoTab pokemon={pokemon} compact />}
                            {activeTab === 'stats' && <StatsTab pokemon={pokemon} compact />}
                            {activeTab === 'moves' && <MovesTab pokemon={pokemon} compact />}
                            {activeTab === 'evo' && <EvoTab pokemon={pokemon} nodeSize={44} />}
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {loading ? (
                            <>
                                <Spinner size={48} />
                                <div style={{ marginTop: 12, fontWeight: 700, fontSize: 13, letterSpacing: 2, color: '#9ca3af', textTransform: 'uppercase' }}>Analyzing...</div>
                            </>
                        ) : (
                            <>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                                    <rect x="2" y="3" width="20" height="14" rx="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                                <div style={{ marginTop: 12, fontWeight: 700, fontSize: 13, letterSpacing: 2, color: '#9ca3af', textTransform: 'uppercase' }}>Awaiting Selection...</div>
                                <div style={{ marginTop: 8, fontSize: 11, color: '#b0b8c4', textAlign: 'center', lineHeight: 1.5, width: 300 }}>
                                    Select a Pokémon from the lists or use search to begin analysis.
                                </div>
                            </>
                        )}
                    </div>
                )}
                {pokemon && <div
                        style={{
                            borderTop: '1px solid #f3f4f6',
                            padding: '10px 16px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Link
                            href={`/poke/${pokemon?.id}`}
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
                    </div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: '0 8px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a1a2e', border: '3px solid #444', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 36, height: 12, borderRadius: 6, background: '#1abc9c' }} />
                    <div style={{ width: 36, height: 12, borderRadius: 6, background: '#f39c12' }} />
                </div>
                <div style={{ position: 'relative', width: 44, height: 44 }}>
                    {DPAD_BUTTONS.map((buttonStyle, index) => (
                        <div key={index} style={{ position: 'absolute', ...buttonStyle, background: '#1a1a2e', borderRadius: index === 4 ? '50%' : 3 }} />
                    ))}
                </div>
            </div>
            
        </div>
    );
}
