'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/AuthContext';
import { fetchPokemon, Pokemon } from '@/lib/api';
import { getRecent } from '@/lib/storage';
import TypeBadge from '@/components/TypeBadge';
import PokemonSVG from '@/components/PokemonSVG';
import Spinner from '@/components/shared/Spinner';
import ShareButton from '@/components/shared/ShareButton';
import { capitalize, padId, typeColor } from '@/lib/utils';

type DbPartySlot = { id: string; pokeId: number; orderId: string };

const STAT_ABBREVS: Record<string, string> = {
    hp: 'HP', attack: 'Atk', defense: 'Def',
    'special-attack': 'SpA', 'special-defense': 'SpD', speed: 'Spd',
};
const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const XP_PER_LEVEL = 500;
const CARD_BASE_STYLE = {
    background: 'white', borderRadius: 20, border: '1px solid #e5e7eb',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
} as const;
const SECTION_LABEL_STYLE = {
    fontSize: 11, fontWeight: 700, color: '#9ca3af',
    textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 16,
} as const;

function PokemonSprite({ pokemon, size }: { pokemon: Pokemon; size: number }) {
    return pokemon.sprite
        ? <img src={pokemon.sprite} alt={pokemon.name} width={size} height={size} style={{ objectFit: 'contain' }} />
        : <PokemonSVG id={pokemon.id} types={pokemon.types} size={size} />;
}

function SectionCard({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{ ...CARD_BASE_STYLE, padding: 24, ...style }}>
            <div style={SECTION_LABEL_STYLE}>{label}</div>
            {children}
        </div>
    );
}

function EmptySection({ message, linkHref, linkLabel }: { message: string; linkHref: string; linkLabel: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>
            {message}{' '}
            <a href={linkHref} style={{ color: '#c0392b', fontWeight: 600, textDecoration: 'none' }}>{linkLabel} →</a>
        </div>
    );
}

function StatBar({ label, value }: { label: string; value: number }) {
    const fillPercent = Math.min((value / 255) * 100, 100);
    const barColor = value >= 100 ? '#16a34a' : value >= 60 ? '#f59e0b' : '#c0392b';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#6b7280', width: 28, textAlign: 'right', flexShrink: 0, fontWeight: 500 }}>{label}</span>
            <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${fillPercent}%`, height: '100%', background: barColor, borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ fontSize: 11, color: '#374151', width: 28, fontWeight: 600, flexShrink: 0 }}>{value}</span>
        </div>
    );
}

function XPBar({ xp }: { xp: number }) {
    const currentLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
    const xpIntoLevel = xp % XP_PER_LEVEL;
    const progressPercent = (xpIntoLevel / XP_PER_LEVEL) * 100;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: '#c0392b', lineHeight: 1 }}>{xp.toLocaleString()}</span>
                    <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>XP total</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Lv. {currentLevel}</span>
            </div>
            <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #c0392b, #e74c3c)', borderRadius: 99, transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>
                {xpIntoLevel} / {XP_PER_LEVEL} XP to Lv. {currentLevel + 1}
            </div>
        </div>
    );
}

function PartyPokemonCard({ pokemon, isSelected, onSelect }: { pokemon: Pokemon; isSelected: boolean; onSelect: () => void }) {
    const { bg } = typeColor(pokemon.types[0]);
    return (
        <div
            onClick={onSelect}
            style={{
                background: isSelected ? `linear-gradient(135deg, ${bg}, white)` : 'white',
                borderRadius: 16, border: `2px solid ${isSelected ? bg : '#e5e7eb'}`,
                padding: '14px 12px 10px', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.09)'; }}
            onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
        >
            <PokemonSprite pokemon={pokemon} size={60} />
            <div style={{ fontWeight: 700, fontSize: 12, color: '#1a202c', textAlign: 'center' }}>{capitalize(pokemon.name)}</div>
            <div style={{ fontSize: 10, color: '#9ca3af' }}>{padId(pokemon.id)}</div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                {pokemon.types.map(type => <TypeBadge key={type} type={type} />)}
            </div>
        </div>
    );
}

function SelectedPokemonStats({ pokemon }: { pokemon: Pokemon }) {
    return (
        <div style={{ background: '#fafafa', borderRadius: 16, padding: 20, border: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <PokemonSprite pokemon={pokemon} size={56} />
                <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: '#1a202c' }}>{capitalize(pokemon.name)}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{padId(pokemon.id)}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {pokemon.types.map(type => <TypeBadge key={type} type={type} />)}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {STAT_ORDER.map(statName => {
                    const stat = pokemon.stats.find(s => s.name === statName);
                    return stat ? <StatBar key={statName} label={STAT_ABBREVS[statName] ?? statName} value={stat.value} /> : null;
                })}
            </div>
        </div>
    );
}

function RecentPokemonCard({ pokemon }: { pokemon: Pokemon }) {
    return (
        <div
            style={{
                background: 'white', borderRadius: 14, padding: '12px 10px 10px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                (e.currentTarget as HTMLElement).style.transform = 'none';
            }}
        >
            <PokemonSprite pokemon={pokemon} size={52} />
            <div style={{ fontWeight: 600, fontSize: 11, color: '#1a202c', textAlign: 'center' }}>{capitalize(pokemon.name)}</div>
            <div style={{ fontSize: 10, color: '#9ca3af' }}>{padId(pokemon.id)}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{value}</span>
        </div>
    );
}

export default function ProfileClient() {
    const router = useRouter();
    const { user, isLoading: authLoading, logout, store } = useAuth();

    const [partyPokemon, setPartyPokemon] = useState<Pokemon[]>([]);
    const [recentPokemon, setRecentPokemon] = useState<Pokemon[]>([]);
    const [userXP, setUserXP] = useState(0);
    const [selectedPartyPokemon, setSelectedPartyPokemon] = useState<Pokemon | null>(null);
    const [isLoadingParty, setIsLoadingParty] = useState(true);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);

    const loadPartyAndXP = useCallback(async () => {
        const accessToken = store.getAccessToken();
        if (!accessToken) return;
        setIsLoadingParty(true);
        try {
            const response = await fetch('/api/poke/party', { headers: { Authorization: `Bearer ${accessToken}` } });
            if (!response.ok) return;
            const data = await response.json();
            const slots: DbPartySlot[] = data.slots;
            setUserXP(data.xp ?? 0);
            const pokemonList = await Promise.all(slots.map(slot => fetchPokemon(slot.pokeId)));
            const sortedByOrder = pokemonList.sort((a, b) => {
                const aOrder = parseFloat(slots.find(s => s.pokeId === a.id)?.orderId ?? '0');
                const bOrder = parseFloat(slots.find(s => s.pokeId === b.id)?.orderId ?? '0');
                return aOrder - bOrder;
            });
            setPartyPokemon(sortedByOrder);
            setSelectedPartyPokemon(sortedByOrder[0] ?? null);
        } finally {
            setIsLoadingParty(false);
        }
    }, [store]);

    const loadRecent = useCallback(() => {
        setRecentPokemon(getRecent());
        setIsLoadingRecent(false);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) router.push('/signin');
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) { loadPartyAndXP(); loadRecent(); }
    }, [user, loadPartyAndXP, loadRecent]);

    if (authLoading || !user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Spinner size={40} />
            </div>
        );
    }

    const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="page-container" style={{ maxWidth: 960 }}>

            <div className="profile-top-grid">
                <div style={{ ...CARD_BASE_STYLE, padding: '28px 28px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #c0392b, #96281b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a202c', letterSpacing: '-0.5px' }}>{user.username}</div>
                            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{user.email}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
                        <InfoRow label="Provider" value={<span style={{ background: '#f3f4f6', padding: '2px 10px', borderRadius: 20, textTransform: 'capitalize' }}>{user.provider}</span>} />
                        <InfoRow label="Member since" value={joinedDate} />
                        <InfoRow label="Team size" value={`${partyPokemon.length} / 6`} />
                    </div>
                    <button
                        onClick={async () => { await logout(); router.push('/'); }}
                        style={{ marginTop: 24, width: '100%', padding: 10, background: 'white', color: '#c0392b', border: '1.5px solid #fecaca', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                    >
                        Sign out
                    </button>
                </div>

                <div style={{ ...CARD_BASE_STYLE, padding: 28 }}>
                    <div style={SECTION_LABEL_STYLE}>Experience Points</div>
                    <XPBar xp={userXP} />
                </div>
            </div>

            <div style={{ ...CARD_BASE_STYLE, padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={SECTION_LABEL_STYLE}>My Team</div>
                    <ShareButton party={partyPokemon} username={user.username} variant="compact" />
                </div>
                {isLoadingParty ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><Spinner size={32} /></div>
                ) : partyPokemon.length === 0 ? (
                    <EmptySection message="No Pokémon in your team yet." linkHref="/my-team" linkLabel="Build your team" />
                ) : (
                    <div className="profile-party-inner">
                        <div className="profile-party-pokemon-grid">
                            {partyPokemon.map(pokemon => (
                                <PartyPokemonCard
                                    key={pokemon.id}
                                    pokemon={pokemon}
                                    isSelected={selectedPartyPokemon?.id === pokemon.id}
                                    onSelect={() => setSelectedPartyPokemon(pokemon)}
                                />
                            ))}
                        </div>
                        {selectedPartyPokemon && <SelectedPokemonStats pokemon={selectedPartyPokemon} />}
                    </div>
                )}
            </div>

            <SectionCard label="Recently Viewed">
                {isLoadingRecent ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><Spinner size={32} /></div>
                ) : recentPokemon.length === 0 ? (
                    <EmptySection message="Nothing viewed yet." linkHref="/explore" linkLabel="Explore Pokémon" />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }}>
                        {recentPokemon.map(pokemon => <RecentPokemonCard key={pokemon.id} pokemon={pokemon} />)}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}