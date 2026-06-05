'use client';
import PokemonSVG from './PokemonSVG';
import TypeBadge from './TypeBadge';
import { capitalize, padId } from '@/lib/utils';
import { Pokemon } from '@/lib/api';

export default function PokemonCard({
    pokemon,
    onClick,
}: {
    pokemon: Pokemon;
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                borderRadius: 16,
                padding: '16px 16px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                cursor: onClick ? 'pointer' : 'default',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                minWidth: 150,
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 4px 16px rgba(0,0,0,0.12)';
                (e.currentTarget as HTMLElement).style.transform =
                    'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                    '0 1px 3px rgba(0,0,0,0.08)';
                (e.currentTarget as HTMLElement).style.transform = 'none';
            }}
        >
            <div style={{ position: 'absolute', top: 10, left: 10 }}>
                <TypeBadge type={pokemon.types[0]} />
            </div>
            <div style={{ marginTop: 24 }}>
                {pokemon.sprite ? (
                    <img
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        width={90}
                        height={90}
                        style={{ objectFit: 'contain' }}
                    />
                ) : (
                    <PokemonSVG
                        id={pokemon.id}
                        types={pokemon.types}
                        size={90}
                    />
                )}
            </div>
            <div
                style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginTop: 8,
                    color: '#1a202c',
                }}
            >
                {capitalize(pokemon.name)}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                {padId(pokemon.id)}
            </div>
        </div>
    );
}
