'use client';
import PokemonSVG from './PokemonSVG';
import { Pokemon } from '@/lib/api';

export default function PokemonBubble({
    pokemon,
    size = 96,
    onClick,
}: {
    pokemon: Pokemon | null;
    size?: number;
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: pokemon
                    ? 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(220,230,245,0.7))'
                    : 'rgba(0,0,0,0.05)',
                border: pokemon
                    ? '1px solid rgba(255,255,255,0.6)'
                    : '2px dashed #d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: pokemon ? 'pointer' : 'default',
                boxShadow: pokemon
                    ? '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)'
                    : 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
                flexShrink: 0,
            }}
            onMouseEnter={(e) => {
                if (pokemon) {
                    (e.currentTarget as HTMLElement).style.transform =
                        'scale(1.08)';
                    (e.currentTarget as HTMLElement).style.boxShadow =
                        '0 4px 16px rgba(0,0,0,0.15)';
                }
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'none';
                (e.currentTarget as HTMLElement).style.boxShadow = pokemon
                    ? '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)'
                    : 'none';
            }}
        >
            {pokemon ? (
                pokemon.sprite ? (
                    <img
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        width={size * 0.7}
                        height={size * 0.7}
                        style={{ objectFit: 'contain' }}
                    />
                ) : (
                    <PokemonSVG
                        id={pokemon.id}
                        types={pokemon.types}
                        size={size * 0.72}
                    />
                )
            ) : (
                <svg
                    width={22}
                    height={22}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#cbd5e0"
                    strokeWidth="2"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                </svg>
            )}
        </div>
    );
}
