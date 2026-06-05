'use client';
import { Pokemon } from '@/lib/api';
import PokemonSVG from '@/components/PokemonSVG';
import TypeBadge from '@/components/TypeBadge';
import { capitalize, padId } from '@/lib/utils';

export default function PokemonHeader({
    pokemon,
    spriteSize = 62,
    nameFontSize = 16,
    extraControls,
}: {
    pokemon: Pokemon;
    spriteSize?: number;
    nameFontSize?: number;
    extraControls?: React.ReactNode;
}) {
    const avatarSize = Math.round(spriteSize * 1.16);

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #c0392b 0%, #96281b 100%)',
                padding: '12px 14px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
            }}
        >
            <div
                style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: 'rgba(255,255,255,0.15)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {pokemon.sprite ? (
                    <img src={pokemon.sprite} alt={pokemon.name} width={spriteSize} height={spriteSize} style={{ objectFit: 'contain' }} />
                ) : (
                    <PokemonSVG id={pokemon.id} types={pokemon.types} size={spriteSize} />
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: nameFontSize, color: 'white', letterSpacing: 0.5 }}>
                        {capitalize(pokemon.name)}
                    </span>
                    <span style={{ fontSize: nameFontSize - 5, color: 'rgba(255,255,255,0.7)' }}>
                        {padId(pokemon.id)}
                    </span>
                    {pokemon.isLegendary && (
                        <span style={{ fontSize: 9, background: '#f59e0b', color: '#78350f', padding: '1px 5px', borderRadius: 10, fontWeight: 700 }}>
                            LEGEND
                        </span>
                    )}
                    {pokemon.isMythical && (
                        <span style={{ fontSize: 9, background: '#a855f7', color: 'white', padding: '1px 5px', borderRadius: 10, fontWeight: 700 }}>
                            MYTHIC
                        </span>
                    )}
                </div>
                {pokemon.genus && (
                    <div style={{ fontSize: nameFontSize - 6, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>
                        {pokemon.genus}
                    </div>
                )}
                <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                    {pokemon.types.map((type) => (
                        <TypeBadge key={type} type={type} />
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                {pokemon.cryUrl && (
                    <button
                        onClick={() => new Audio(pokemon.cryUrl!).play()}
                        style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '5px 7px', cursor: 'pointer' }}
                        title="Play cry"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" strokeWidth="2" fill="none" />
                        </svg>
                    </button>
                )}
                {extraControls}
            </div>
        </div>
    );
}
