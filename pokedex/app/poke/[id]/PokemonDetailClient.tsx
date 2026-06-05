'use client';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pokemon } from '@/lib/api';
import PokemonSVG from '@/components/PokemonSVG';
import TypeBadge from '@/components/TypeBadge';
import EvoTree from '@/components/shared/EvoTree';
import GenderBar from '@/components/shared/GenderBar';
import { capitalize, padId } from '@/lib/utils';
import { statColor, statLabels } from '@/lib/statUtils';

// ─── Responsive helper ────────────────────────────────────────────────────────
// Injects a <style> tag once so we can write real media queries without a CSS
// module dependency. All class names are scoped to this component.

const RESPONSIVE_CSS = `
.pdc-page { padding: 20px 16px 64px; max-width: 700px; margin: 0 auto; }
.pdc-hero { border-radius: 20px; padding: 24px 20px 20px;
  background: linear-gradient(135deg,#c0392b 0%,#7b241c 100%);
  box-shadow: 0 8px 32px rgba(192,57,43,.22); }
.pdc-hero-inner { display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
.pdc-sprite { width: 140px; height: 140px; flex-shrink: 0;
  background: rgba(255,255,255,.12); border-radius: 50%;
  border: 2px solid rgba(255,255,255,.25);
  display: flex; align-items: center; justify-content: center; }
.pdc-name-block { flex: 1; min-width: 160px; }
.pdc-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pdc-pill { background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.2);
  border-radius: 10px; padding: 5px 12px; text-align: center; }
.pdc-tabs-bar { display: flex; border-bottom: 1px solid #f3f4f6; }
.pdc-tab { flex: 1; padding: 13px 4px; font-size: 12px; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase; cursor: pointer;
  background: transparent; border: none; border-bottom: 2px solid transparent;
  font-family: inherit; transition: color .15s; }
.pdc-tab-content { padding: 20px 20px 24px; }
.pdc-overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px; }
.pdc-stats-box { max-width: 480px; }
.pdc-lv100-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
.pdc-moves-grid { display: grid; grid-template-columns: 44px 1fr;
  border: 1px solid #f0f0ec; border-radius: 10px; overflow: hidden; }

@media (max-width: 520px) {
  .pdc-page { padding: 14px 12px 64px; }
  .pdc-hero { border-radius: 16px; padding: 18px 16px 16px; }
  .pdc-hero-inner { gap: 14px; }
  .pdc-sprite { width: 110px; height: 110px; }
  .pdc-name-block { min-width: 0; }
  .pdc-pill { padding: 4px 9px; }
  .pdc-tab { padding: 11px 2px; font-size: 11px; letter-spacing: .03em; }
  .pdc-tab-content { padding: 16px 14px 20px; }
  .pdc-overview-grid { grid-template-columns: 1fr; gap: 0; }
  .pdc-stats-box { max-width: 100%; }
  .pdc-lv100-grid { grid-template-columns: repeat(2,1fr); }
}
`;

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div style={{ marginBottom: 28 }}>
            <div
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9ca3af',
                    borderBottom: '1px solid #f0f0ec',
                    paddingBottom: 6,
                    marginBottom: 12,
                }}
            >
                {title}
            </div>
            {children}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: '1px solid #f3f4f6',
            }}
        >
            <span
                style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: 13,
                    color: '#374151',
                    fontWeight: 500,
                    textAlign: 'right',
                    maxWidth: '65%',
                }}
            >
                {value}
            </span>
        </div>
    );
}

type Tab = 'overview' | 'stats' | 'moves' | 'evo';

export default function PokemonDetailClient({ pokemon }: { pokemon: Pokemon }) {
    const [tab, setTab] = useState<Tab>('overview');
    const router = useRouter();

    const totalStats = pokemon.stats.reduce((s, x) => s + x.value, 0);
    const heightM = (pokemon.height / 10).toFixed(1);
    const weightKg = (pokemon.weight / 10).toFixed(1);
    const captureChance = ((pokemon.captureRate / 255) * 100).toFixed(1);

    const TABS: { id: Tab; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'stats', label: 'Stats' },
        { id: 'moves', label: 'Moves' },
        { id: 'evo', label: 'Evolution' },
    ];

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: RESPONSIVE_CSS }} />

            <div className="pdc-page">
                <button
                    onClick={() => router.back()}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 16,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#4b5563',
                        fontFamily: 'inherit',
                        padding: 0,
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back
                </button>

                <div className="pdc-hero">
                    <div className="pdc-hero-inner">
                        <div className="pdc-sprite">
                            {pokemon.sprite ? (
                                <img
                                    src={pokemon.sprite}
                                    alt={pokemon.name}
                                    width={120}
                                    height={120}
                                    style={{
                                        objectFit: 'contain',
                                        maxWidth: '85%',
                                        maxHeight: '85%',
                                    }}
                                />
                            ) : (
                                <PokemonSVG
                                    id={pokemon.id}
                                    types={pokemon.types}
                                    size={120}
                                />
                            )}
                        </div>

                        <div className="pdc-name-block">
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    flexWrap: 'wrap',
                                    marginBottom: 4,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 800,
                                        color: 'white',
                                        letterSpacing: -0.5,
                                        lineHeight: 1,
                                    }}
                                >
                                    {capitalize(pokemon.name)}
                                </span>
                                <span
                                    style={{
                                        fontSize: 15,
                                        color: 'rgba(255,255,255,.65)',
                                        fontWeight: 500,
                                    }}
                                >
                                    {padId(pokemon.id)}
                                </span>
                            </div>

                            {pokemon.genus && (
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: 'rgba(255,255,255,.7)',
                                        marginBottom: 10,
                                    }}
                                >
                                    {pokemon.genus}
                                </div>
                            )}

                            <div
                                style={{
                                    display: 'flex',
                                    gap: 6,
                                    flexWrap: 'wrap',
                                    marginBottom: 14,
                                }}
                            >
                                {pokemon.types.map((t) => (
                                    <TypeBadge key={t} type={t} />
                                ))}
                                {pokemon.isLegendary && (
                                    <span
                                        style={{
                                            fontSize: 10,
                                            background: '#f59e0b',
                                            color: '#78350f',
                                            padding: '2px 8px',
                                            borderRadius: 10,
                                            fontWeight: 700,
                                        }}
                                    >
                                        LEGENDARY
                                    </span>
                                )}
                                {pokemon.isMythical && (
                                    <span
                                        style={{
                                            fontSize: 10,
                                            background: '#a855f7',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: 10,
                                            fontWeight: 700,
                                        }}
                                    >
                                        MYTHICAL
                                    </span>
                                )}
                            </div>

                            <div className="pdc-pills">
                                {[
                                    { label: 'Height', value: `${heightM} m` },
                                    {
                                        label: 'Weight',
                                        value: `${weightKg} kg`,
                                    },
                                    {
                                        label: 'Base EXP',
                                        value: pokemon.baseExp || '—',
                                    },
                                    { label: 'Total', value: totalStats },
                                ].map(({ label, value }) => (
                                    <div key={label} className="pdc-pill">
                                        <div
                                            style={{
                                                fontSize: 9,
                                                color: 'rgba(255,255,255,.6)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {label}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 14,
                                                fontWeight: 800,
                                                color: 'white',
                                            }}
                                        >
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {pokemon.cryUrl && (
                            <button
                                onClick={() =>
                                    new Audio(pokemon.cryUrl!).play()
                                }
                                title="Play cry"
                                style={{
                                    background: 'rgba(255,255,255,.18)',
                                    border: '1px solid rgba(255,255,255,.3)',
                                    borderRadius: 10,
                                    padding: '8px 10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    color: 'white',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    fontFamily: 'inherit',
                                }}
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="white"
                                >
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <path
                                        d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
                                        stroke="white"
                                        strokeWidth="2"
                                        fill="none"
                                    />
                                </svg>
                                Cry
                            </button>
                        )}
                    </div>

                    {pokemon.flavorText && (
                        <div
                            style={{
                                marginTop: 18,
                                padding: '10px 14px',
                                background: 'rgba(0,0,0,.25)',
                                borderRadius: 10,
                                fontSize: 13,
                                color: 'rgba(255,255,255,.85)',
                                lineHeight: 1.6,
                                fontStyle: 'italic',
                                borderLeft: '3px solid rgba(255,255,255,.4)',
                            }}
                        >
                            {pokemon.flavorText}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        background: 'white',
                        borderRadius: '0 0 16px 16px',
                        boxShadow: '0 4px 16px rgba(0,0,0,.07)',
                        marginBottom: 4,
                    }}
                >
                    <div className="pdc-tabs-bar">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className="pdc-tab"
                                style={{
                                    borderBottom:
                                        tab === t.id
                                            ? '2px solid #c0392b'
                                            : '2px solid transparent',
                                    color: tab === t.id ? '#c0392b' : '#9ca3af',
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="pdc-tab-content">
                        {tab === 'overview' && (
                            <div className="pdc-overview-grid">
                                <div>
                                    <Section title="Pokédex Data">
                                        <InfoRow
                                            label="Height"
                                            value={`${heightM} m`}
                                        />
                                        <InfoRow
                                            label="Weight"
                                            value={`${weightKg} kg`}
                                        />
                                        <InfoRow
                                            label="Base EXP"
                                            value={pokemon.baseExp || '—'}
                                        />
                                        <InfoRow
                                            label="Capture Rate"
                                            value={`${pokemon.captureRate}/255 (${captureChance}%)`}
                                        />
                                        <InfoRow
                                            label="Habitat"
                                            value={
                                                pokemon.habitat
                                                    ? capitalize(
                                                          pokemon.habitat
                                                      )
                                                    : '—'
                                            }
                                        />
                                        <InfoRow
                                            label="Egg Groups"
                                            value={
                                                pokemon.eggGroups
                                                    .map(capitalize)
                                                    .join(', ') || '—'
                                            }
                                        />
                                        <InfoRow
                                            label="Gender"
                                            value={
                                                <GenderBar
                                                    rate={pokemon.genderRate}
                                                    fontSize={12}
                                                />
                                            }
                                        />
                                    </Section>

                                    {pokemon.weaknesses.length > 0 && (
                                        <Section title="Weak To">
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 5,
                                                }}
                                            >
                                                {pokemon.weaknesses.map((w) => (
                                                    <TypeBadge
                                                        key={w}
                                                        type={w}
                                                    />
                                                ))}
                                            </div>
                                        </Section>
                                    )}
                                </div>

                                <div>
                                    <Section title="Abilities">
                                        {pokemon.abilityDetails.map((a) => (
                                            <div
                                                key={a.name}
                                                style={{
                                                    marginBottom: 10,
                                                    padding: '10px 12px',
                                                    background: '#f9fafb',
                                                    borderRadius: 8,
                                                    border: '1px solid #f0f0ec',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        marginBottom:
                                                            a.description
                                                                ? 4
                                                                : 0,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            color: '#374151',
                                                        }}
                                                    >
                                                        {capitalize(
                                                            a.name.replace(
                                                                /-/g,
                                                                ' '
                                                            )
                                                        )}
                                                    </span>
                                                    {a.isHidden && (
                                                        <span
                                                            style={{
                                                                fontSize: 9,
                                                                background:
                                                                    '#f3e8ff',
                                                                color: '#7c3aed',
                                                                padding:
                                                                    '1px 6px',
                                                                borderRadius: 8,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            HIDDEN
                                                        </span>
                                                    )}
                                                </div>
                                                {a.description && (
                                                    <p
                                                        style={{
                                                            fontSize: 12,
                                                            color: '#6b7280',
                                                            lineHeight: 1.55,
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {a.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </Section>

                                    <Section title="Base Stats">
                                        {pokemon.stats.map((s) => (
                                            <div
                                                key={s.name}
                                                style={{ marginBottom: 8 }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        marginBottom: 3,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            color: '#9ca3af',
                                                            fontWeight: 600,
                                                            textTransform:
                                                                'uppercase',
                                                            letterSpacing: 0.4,
                                                        }}
                                                    >
                                                        {statLabels[s.name] ??
                                                            s.name
                                                                .slice(0, 3)
                                                                .toUpperCase()}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            color: statColor(
                                                                s.value
                                                            ),
                                                        }}
                                                    >
                                                        {s.value}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        height: 5,
                                                        background: '#f3f4f6',
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            height: '100%',
                                                            width: `${Math.min(100, (s.value / 255) * 100)}%`,
                                                            background:
                                                                statColor(
                                                                    s.value
                                                                ),
                                                            borderRadius: 3,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div
                                            style={{
                                                borderTop: '1px solid #e5e7eb',
                                                paddingTop: 8,
                                                marginTop: 4,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    color: '#9ca3af',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                Total
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 800,
                                                    color: statColor(
                                                        totalStats / 6
                                                    ),
                                                }}
                                            >
                                                {totalStats}
                                            </span>
                                        </div>
                                    </Section>
                                </div>
                            </div>
                        )}

                        {tab === 'stats' && (
                            <div className="pdc-stats-box">
                                {pokemon.stats.map((s) => {
                                    const pct = Math.min(
                                        100,
                                        (s.value / 255) * 100
                                    );
                                    const color = statColor(s.value);
                                    return (
                                        <div
                                            key={s.name}
                                            style={{ marginBottom: 18 }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: '#9ca3af',
                                                        fontWeight: 700,
                                                        textTransform:
                                                            'uppercase',
                                                        letterSpacing: 0.5,
                                                        width: 36,
                                                    }}
                                                >
                                                    {statLabels[s.name] ??
                                                        s.name
                                                            .slice(0, 3)
                                                            .toUpperCase()}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 800,
                                                        color,
                                                        minWidth: 32,
                                                        textAlign: 'right',
                                                    }}
                                                >
                                                    {s.value}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    position: 'relative',
                                                    height: 10,
                                                    background: '#f3f4f6',
                                                    borderRadius: 5,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        width: `${pct}%`,
                                                        background: `linear-gradient(90deg,${color}cc,${color})`,
                                                        borderRadius: 5,
                                                    }}
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    marginTop: 3,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 10,
                                                        color: '#d1d5db',
                                                    }}
                                                >
                                                    0
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 10,
                                                        color: '#d1d5db',
                                                    }}
                                                >
                                                    255
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div
                                    style={{
                                        borderTop: '2px solid #e5e7eb',
                                        paddingTop: 14,
                                        marginTop: 4,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            color: '#6b7280',
                                        }}
                                    >
                                        Total
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 800,
                                            color: statColor(totalStats / 6),
                                        }}
                                    >
                                        {totalStats}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        marginTop: 20,
                                        padding: '12px 14px',
                                        background: '#f9fafb',
                                        borderRadius: 10,
                                        border: '1px solid #f0f0ec',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: '#9ca3af',
                                            marginBottom: 8,
                                            fontWeight: 600,
                                        }}
                                    >
                                        STAT RANGE AT LV 100 (no nature)
                                    </div>
                                    <div className="pdc-lv100-grid">
                                        {pokemon.stats.map((s) => {
                                            const isHp = s.name === 'hp';
                                            const min = isHp
                                                ? 2 * s.value + 110
                                                : Math.floor(
                                                      (2 * s.value + 5) * 0.9
                                                  );
                                            const max = isHp
                                                ? 2 * s.value + 204
                                                : Math.floor(
                                                      (2 * s.value + 5) * 1.1
                                                  );
                                            return (
                                                <div
                                                    key={s.name}
                                                    style={{
                                                        textAlign: 'center',
                                                        padding: '6px 0',
                                                        background: 'white',
                                                        borderRadius: 6,
                                                        border: '1px solid #e5e7eb',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 9,
                                                            color: '#9ca3af',
                                                            fontWeight: 700,
                                                            textTransform:
                                                                'uppercase',
                                                            marginBottom: 2,
                                                        }}
                                                    >
                                                        {statLabels[s.name] ??
                                                            s.name
                                                                .slice(0, 3)
                                                                .toUpperCase()}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: '#374151',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {min}–{max}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === 'moves' && (
                            <div>
                                {pokemon.moves.length === 0 ? (
                                    <p
                                        style={{
                                            color: '#9ca3af',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            padding: 24,
                                        }}
                                    >
                                        No move data available
                                    </p>
                                ) : (
                                    <>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: '#9ca3af',
                                                marginBottom: 12,
                                            }}
                                        >
                                            {pokemon.moves.length} level-up
                                            moves
                                        </div>
                                        <div className="pdc-moves-grid">
                                            <div
                                                style={{
                                                    background: '#f9fafb',
                                                    padding: '7px 12px',
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    color: '#9ca3af',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                }}
                                            >
                                                LV
                                            </div>
                                            <div
                                                style={{
                                                    background: '#f9fafb',
                                                    padding: '7px 12px',
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    color: '#9ca3af',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.08em',
                                                    borderLeft:
                                                        '1px solid #f0f0ec',
                                                }}
                                            >
                                                Move
                                            </div>
                                            {pokemon.moves.map((move, i) => {
                                                const bg =
                                                    i % 2 === 0
                                                        ? 'white'
                                                        : '#fafafa';
                                                return (
                                                    <React.Fragment
                                                        key={move.name}
                                                    >
                                                        <div
                                                            style={{
                                                                background: bg,
                                                                padding:
                                                                    '8px 12px',
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: '#c0392b',
                                                                borderTop:
                                                                    '1px solid #f3f4f6',
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                            }}
                                                        >
                                                            {move.level === 0
                                                                ? '—'
                                                                : move.level}
                                                        </div>
                                                        <div
                                                            style={{
                                                                background: bg,
                                                                padding:
                                                                    '8px 12px',
                                                                fontSize: 13,
                                                                color: '#374151',
                                                                fontWeight: 500,
                                                                borderTop:
                                                                    '1px solid #f3f4f6',
                                                                borderLeft:
                                                                    '1px solid #f0f0ec',
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                            }}
                                                        >
                                                            {capitalize(
                                                                move.name.replace(
                                                                    /-/g,
                                                                    ' '
                                                                )
                                                            )}
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {tab === 'evo' && (
                            <div>
                                {!pokemon.evolutionChain ? (
                                    <p
                                        style={{
                                            color: '#9ca3af',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            padding: 24,
                                        }}
                                    >
                                        No evolution data
                                    </p>
                                ) : (
                                    <>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                padding: '16px 0 24px',
                                                overflowX: 'auto',
                                            }}
                                        >
                                            <EvoTree
                                                node={pokemon.evolutionChain}
                                                nodeSize={80}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                padding: '12px 14px',
                                                background: '#f9fafb',
                                                borderRadius: 10,
                                                border: '1px solid #f0f0ec',
                                                fontSize: 12,
                                                color: '#6b7280',
                                                lineHeight: 1.6,
                                                textAlign: 'center',
                                            }}
                                        >
                                            Arrows show evolution direction.
                                            Level numbers indicate minimum level
                                            required.
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        textAlign: 'right',
                        marginTop: 10,
                        fontSize: 11,
                        color: '#d1d5db',
                        fontStyle: 'italic',
                    }}
                >
                    /poke/{pokemon.id}
                </div>
            </div>
        </>
    );
}
