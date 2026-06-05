'use client';
import React from 'react';
import { Pokemon } from '@/lib/api';
import TypeBadge from '@/components/TypeBadge';
import GenderBar from './GenderBar';
import Row from './Row';
import EvoTree from './EvoTree';
import { capitalize } from '@/lib/utils';
import { statColor, statLabels } from '@/lib/statUtils';

export function InfoTab({
    pokemon,
    compact = false,
}: {
    pokemon: Pokemon;
    compact?: boolean;
}) {
    const heightMeters = (pokemon.height / 10).toFixed(1);
    const weightKg = (pokemon.weight / 10).toFixed(1);
    const labelFontSize = compact ? 10 : 11;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {pokemon.flavorText && (
                <div
                    style={{
                        fontSize: compact ? 10 : 12,
                        color: '#4b5563',
                        lineHeight: 1.6,
                        marginBottom: compact ? 10 : 14,
                        padding: compact ? '8px 10px' : '10px 12px',
                        background: 'rgba(192,57,43,0.06)',
                        borderLeft: '3px solid #c0392b',
                        borderRadius: '0 6px 6px 0',
                        fontStyle: 'italic',
                    }}
                >
                    {pokemon.flavorText}
                </div>
            )}
            <Row
                label="Height"
                value={`${heightMeters} m`}
                fontSize={labelFontSize}
            />
            <Row
                label="Weight"
                value={`${weightKg} kg`}
                fontSize={labelFontSize}
            />
            <Row
                label="Base EXP"
                value={pokemon.baseExp || '—'}
                fontSize={labelFontSize}
            />
            <Row
                label="Capture Rate"
                value={`${pokemon.captureRate}/255`}
                fontSize={labelFontSize}
            />
            <Row
                label="Habitat"
                value={pokemon.habitat ? capitalize(pokemon.habitat) : '—'}
                fontSize={labelFontSize}
            />
            <Row
                label="Egg Groups"
                value={pokemon.eggGroups.map(capitalize).join(', ') || '—'}
                fontSize={labelFontSize}
            />
            <Row
                label="Gender"
                value={
                    <GenderBar
                        rate={pokemon.genderRate}
                        fontSize={labelFontSize}
                    />
                }
                fontSize={labelFontSize}
            />

            <div style={{ marginTop: 10 }}>
                <div
                    style={{
                        fontSize: labelFontSize,
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontWeight: 600,
                        marginBottom: 6,
                    }}
                >
                    Abilities
                </div>
                {pokemon.abilityDetails.map((ability) => (
                    <div
                        key={ability.name}
                        style={{
                            marginBottom: 6,
                            padding: compact ? '6px 8px' : '8px 10px',
                            background: compact
                                ? 'rgba(0,0,0,0.03)'
                                : '#f9fafb',
                            borderRadius: 6,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                marginBottom: 2,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: compact ? 10 : 12,
                                    fontWeight: 700,
                                    color: '#374151',
                                }}
                            >
                                {capitalize(ability.name.replace(/-/g, ' '))}
                            </span>
                            {ability.isHidden && (
                                <span
                                    style={{
                                        fontSize: 8,
                                        background: '#f3e8ff',
                                        color: '#7c3aed',
                                        padding: '1px 5px',
                                        borderRadius: 8,
                                        fontWeight: 600,
                                    }}
                                >
                                    HIDDEN
                                </span>
                            )}
                        </div>
                        {ability.description && (
                            <div
                                style={{
                                    fontSize: compact ? 9 : 11,
                                    color: '#6b7280',
                                    lineHeight: 1.5,
                                }}
                            >
                                {ability.description}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {pokemon.weaknesses.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    <div
                        style={{
                            fontSize: labelFontSize,
                            color: '#9ca3af',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            fontWeight: 600,
                            marginBottom: 6,
                        }}
                    >
                        Weak To
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {pokemon.weaknesses.map((weakness) => (
                            <TypeBadge key={weakness} type={weakness} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function StatsTab({
    pokemon,
    compact = false,
}: {
    pokemon: Pokemon;
    compact?: boolean;
}) {
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);
    const barHeight = compact ? 6 : 7;
    const labelFontSize = compact ? 10 : 11;
    const valueFontSize = compact ? 11 : 13;

    return (
        <div>
            {pokemon.stats.map((stat) => (
                <div key={stat.name} style={{ marginBottom: compact ? 9 : 12 }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: compact ? 3 : 4,
                        }}
                    >
                        <span
                            style={{
                                fontSize: labelFontSize,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                color: '#9ca3af',
                                fontWeight: 600,
                                width: 32,
                            }}
                        >
                            {statLabels[stat.name] ??
                                stat.name.slice(0, 3).toUpperCase()}
                        </span>
                        <span
                            style={{
                                fontSize: valueFontSize,
                                fontWeight: 700,
                                color: statColor(stat.value),
                                minWidth: 28,
                                textAlign: 'right',
                            }}
                        >
                            {stat.value}
                        </span>
                    </div>
                    <div
                        style={{
                            height: barHeight,
                            background: compact ? '#e5e7eb' : '#f3f4f6',
                            borderRadius: barHeight / 2,
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${Math.min(100, (stat.value / 255) * 100)}%`,
                                background: statColor(stat.value),
                                borderRadius: barHeight / 2,
                                transition: 'width 0.4s ease',
                            }}
                        />
                    </div>
                </div>
            ))}
            <div
                style={{
                    borderTop: '2px solid #e5e7eb',
                    paddingTop: compact ? 8 : 10,
                    marginTop: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <span
                    style={{
                        fontSize: labelFontSize,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: '#9ca3af',
                        fontWeight: 600,
                    }}
                >
                    Total
                </span>
                <span
                    style={{
                        fontSize: compact ? 12 : 14,
                        fontWeight: 700,
                        color: statColor(totalStats / 6),
                    }}
                >
                    {totalStats}
                </span>
            </div>
        </div>
    );
}

export function MovesTab({
    pokemon,
    compact = false,
}: {
    pokemon: Pokemon;
    compact?: boolean;
}) {
    const valueFontSize = compact ? 10 : 12;

    if (!pokemon.moves.length)
        return (
            <div
                style={{
                    fontSize: compact ? 11 : 13,
                    color: '#9ca3af',
                    textAlign: 'center',
                    padding: compact ? 20 : 24,
                }}
            >
                No move data available
            </div>
        );

    return (
        <div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `${compact ? 28 : 36}px 1fr`,
                    gap: `0 ${compact ? 8 : 10}px`,
                }}
            >
                <span
                    style={{
                        fontSize: 9,
                        color: '#9ca3af',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginBottom: compact ? 4 : 6,
                    }}
                >
                    Lv
                </span>
                <span
                    style={{
                        fontSize: 9,
                        color: '#9ca3af',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginBottom: compact ? 4 : 6,
                    }}
                >
                    Move
                </span>
                {pokemon.moves.map((move, index) => (
                    <React.Fragment key={`${move.name}-${index}`}>
                        <span
                            style={{
                                fontSize: valueFontSize,
                                color: '#c0392b',
                                fontWeight: 700,
                                padding: `${compact ? 3 : 4}px 0`,
                                borderBottom: '1px solid #f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {move.level === 0 ? '—' : move.level}
                        </span>
                        <span
                            style={{
                                fontSize: valueFontSize,
                                color: '#374151',
                                fontWeight: 500,
                                padding: `${compact ? 3 : 4}px 0`,
                                borderBottom: '1px solid #f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {capitalize(move.name.replace(/-/g, ' '))}
                        </span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export function EvoTab({
    pokemon,
    nodeSize = 44,
}: {
    pokemon: Pokemon;
    nodeSize?: number;
}) {
    if (!pokemon.evolutionChain)
        return (
            <div
                style={{
                    fontSize: 11,
                    color: '#9ca3af',
                    textAlign: 'center',
                    padding: 20,
                }}
            >
                No evolution data
            </div>
        );

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '8px 0',
            }}
        >
            <EvoTree node={pokemon.evolutionChain} nodeSize={nodeSize} />
        </div>
    );
}
