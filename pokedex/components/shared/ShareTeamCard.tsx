'use client';
import { forwardRef } from 'react';
import { Pokemon } from '@/lib/api';
import { capitalize, padId } from '@/lib/utils';

const TYPE_SOLID_COLORS: Record<string, { bg: string; text: string }> = {
    electric: { bg: '#f59e0b', text: '#fff' },
    fairy:    { bg: '#ec4899', text: '#fff' },
    grass:    { bg: '#16a34a', text: '#fff' },
    fire:     { bg: '#ef4444', text: '#fff' },
    water:    { bg: '#3b82f6', text: '#fff' },
    normal:   { bg: '#9ca3af', text: '#fff' },
    psychic:  { bg: '#e879f9', text: '#fff' },
    poison:   { bg: '#a855f7', text: '#fff' },
    rock:     { bg: '#a8a29e', text: '#fff' },
    ground:   { bg: '#d97706', text: '#fff' },
    bug:      { bg: '#84cc16', text: '#fff' },
    flying:   { bg: '#818cf8', text: '#fff' },
    dragon:   { bg: '#6366f1', text: '#fff' },
    ice:      { bg: '#06b6d4', text: '#fff' },
    fighting: { bg: '#f97316', text: '#fff' },
    ghost:    { bg: '#7c3aed', text: '#fff' },
    steel:    { bg: '#64748b', text: '#fff' },
    dark:     { bg: '#374151', text: '#fff' },
};

function solidTypeColor(type: string) {
    return TYPE_SOLID_COLORS[type] ?? { bg: '#9ca3af', text: '#fff' };
}

const lightTheme = {
    pageBg:      '#eef0f4',
    cardBg:      '#ffffff',
    border:      '#e2e8f0',
    borderDashed: '#e2e8f0',
    badgeBg:     '#ffffff',
    badgeBorder: '#e2e8f0',
    labelBg:     '#1a202c',
    titleText:   '#1a202c',
    mutedText:   '#718096',
    labelText:   '#ffffff',
    emptyIcon:   '#cbd5e0',
    quoteText:   '#718096',
};

const darkTheme = {
    pageBg:      '#0f1117',
    cardBg:      '#1e2130',
    border:      '#2d3348',
    borderDashed: '#2d3348',
    badgeBg:     '#1e2130',
    badgeBorder: '#2d3348',
    labelBg:     '#e2e8f0',
    titleText:   '#e2e8f0',
    mutedText:   '#718096',
    labelText:   '#1a202c',
    emptyIcon:   '#2d3348',
    quoteText:   '#4a5568',
};

interface ShareTeamCardProps {
    party: Pokemon[];
    username: string;
    darkMode?: boolean;
}

const ShareTeamCard = forwardRef<HTMLDivElement, ShareTeamCardProps>(
    ({ party, username, darkMode = false }, ref) => {
        const theme = darkMode ? darkTheme : lightTheme;

        const timestamp = new Date().toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
        });

        const allTypes = Array.from(new Set(party.flatMap(p => p.types)));
        const emptySlots = Array.from({ length: Math.max(0, 6 - party.length) });

        return (
            <div
                ref={ref}
                style={{
                    width: 680,
                    background: theme.pageBg,
                    borderRadius: 20,
                    overflow: 'hidden',
                    fontFamily: 'Geist, "Segoe UI", system-ui, sans-serif',
                    position: 'absolute',
                    left: -9999,
                    top: 0,
                    zIndex: -1,
                    padding: 28,
                    boxSizing: 'border-box',
                    visibility: 'hidden',
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: '#c0392b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            fontWeight: 800,
                            color: '#ffffff',
                            flexShrink: 0,
                        }}>
                            <div className="-mt-3">
                                {username.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: 17,
                                fontWeight: 700,
                                color: theme.titleText,
                                lineHeight: 1.2,
                                letterSpacing: '-0.3px',
                            }}>
                                {username}
                            </div>
                            <div style={{
                                fontSize: 12,
                                color: theme.mutedText,
                                marginTop: 2,
                                lineHeight: 1,
                            }}>
                                {timestamp}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            background: theme.badgeBg,
                            border: `1.5px solid ${theme.badgeBorder}`,
                            borderRadius: 10,
                            padding: '7px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                        }}>
                            <div style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#c0392b',
                                flexShrink: 0,
                            }} />
                            <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: theme.titleText,
                                letterSpacing: '0.8px',
                                textTransform: 'uppercase',
                                lineHeight: 1,
                                padding: 5
                            }}>
                                <div className="-mt-1">
                                    {party.length} / 6 Pokémon
                                </div>
                            </span>
                        </div>

                        <div style={{
                            background: theme.labelBg,
                            borderRadius: 10,
                            padding: '7px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: theme.labelText,
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                lineHeight: 1,
                                padding: 5
                            }}>
                                <div className="-mt-1">
                                    Pokédex
                                </div>
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 10,
                    marginBottom: 16,
                }}>
                    {party.map(pokemon => {
                        const { bg: typeBg } = solidTypeColor(pokemon.types[0]);
                        return (
                            <div key={pokemon.id} style={{
                                background: theme.cardBg,
                                border: `1.5px solid ${theme.border}`,
                                borderRadius: 14,
                                padding: '18px 12px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxSizing: 'border-box',
                            }}>
                                <div style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '50%',
                                    background: `${typeBg}18`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    marginBottom: 10,
                                    flexShrink: 0,
                                }}>
                                    {pokemon.sprite && (
                                        <img
                                            src={pokemon.sprite}
                                            alt={pokemon.name}
                                            width={62}
                                            height={62}
                                            crossOrigin="anonymous"
                                            style={{ objectFit: 'contain', display: 'block' }}
                                        />
                                    )}
                                </div>

                                <div style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: theme.titleText,
                                    textAlign: 'center',
                                    lineHeight: 1.3,
                                    marginBottom: 3,
                                }}>
                                    {capitalize(pokemon.name)}
                                </div>

                                <div style={{
                                    fontSize: 11,
                                    color: theme.mutedText,
                                    marginBottom: 10,
                                    lineHeight: 1,
                                    fontWeight: 500,
                                }}>
                                    {padId(pokemon.id)}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: 4,
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                }}>
                                    {pokemon.types.map(type => {
                                        const { bg, text } = solidTypeColor(type);
                                        return (
                                            <span key={type} style={{
                                                background: bg,
                                                color: text,
                                                fontSize: 10,
                                                fontWeight: 700,
                                                padding: '8px 12px',
                                                borderRadius: 20,
                                                textTransform: 'capitalize',
                                                lineHeight: 1,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <div className="-mt-3">
                                                    {capitalize(type)}
                                                </div>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {emptySlots.map((_, i) => (
                        <div key={`empty-${i}`} style={{
                            background: theme.cardBg,
                            border: `1.5px dashed ${theme.borderDashed}`,
                            borderRadius: 14,
                            padding: '18px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            minHeight: 160,
                            boxSizing: 'border-box',
                        }}>
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                border: `1.5px dashed ${theme.emptyIcon}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.emptyIcon} strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </div>
                            <div style={{
                                fontSize: 11,
                                color: theme.emptyIcon,
                                fontWeight: 600,
                                lineHeight: 1,
                            }}>
                                Empty
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    background: theme.cardBg,
                    border: `1.5px solid ${theme.border}`,
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    {allTypes.length > 0 && (
                        <div style={{
                            display: 'flex',
                            gap: 5,
                            flexWrap: 'wrap',
                            alignItems: 'center',
                        }}>
                            {allTypes.map(type => {
                                const { bg } = solidTypeColor(type);
                                return (
                                    <span key={type} style={{
                                        background: `${bg}18`,
                                        color: bg,
                                        border: `1.5px solid ${bg}40`,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: '8px 12px',
                                        marginTop: 4,
                                        borderRadius: 20,
                                        textTransform: 'capitalize',
                                        lineHeight: 0.25,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <div style={{ marginTop: -12.5 }}>
                                            {capitalize(type)}
                                        </div>
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    <div style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontStyle: 'italic',
                        color: theme.quoteText,
                        letterSpacing: '0.1px',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        marginLeft: 12,
                        whiteSpace: 'nowrap',
                    }}>
                        {`"Gotta catch 'em all!"`}
                    </div>
                </div>
            </div>
        );
    }
);

ShareTeamCard.displayName = 'ShareTeamCard';
export default ShareTeamCard;