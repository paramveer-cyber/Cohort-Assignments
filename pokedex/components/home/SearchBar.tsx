'use client';
import PokemonSVG from '@/components/PokemonSVG';
import { capitalize, padId } from '@/lib/utils';
import { SearchResult } from '@/hooks/useSearch';

export default function SearchBar({
    query,
    results,
    isSearching,
    onSearch,
    onSelect,
}: {
    query: string;
    results: SearchResult[];
    isSearching: boolean;
    onSearch: (query: string) => void;
    onSelect: (result: SearchResult) => void;
}) {
    return (
        <div style={{ position: 'relative', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 40, padding: '10px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <svg width="18" height="18" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                    value={query}
                    onChange={(event) => onSearch(event.target.value)}
                    placeholder="Search Pokémon by name or number..."
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: '#374151' }}
                />
                {isSearching && (
                    <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="18" stroke="#e5e7eb" strokeWidth="4" />
                        <path d="M24 6 a18 18 0 0 1 18 18" stroke="#c0392b" strokeWidth="4" strokeLinecap="round">
                            <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="0.8s" repeatCount="indefinite" />
                        </path>
                    </svg>
                )}
            </div>

            {results.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb', marginTop: 4, overflow: 'hidden' }}>
                    {results.map((result) => (
                        <div
                            key={result.id}
                            onClick={() => onSelect(result)}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                            onMouseEnter={(event) => ((event.currentTarget as HTMLElement).style.background = '#f9fafb')}
                            onMouseLeave={(event) => ((event.currentTarget as HTMLElement).style.background = 'white')}
                        >
                            {result.sprite ? (
                                <img src={result.sprite} width={36} height={36} style={{ objectFit: 'contain' }} />
                            ) : (
                                <PokemonSVG id={result.id} types={[]} size={36} />
                            )}
                            <span style={{ fontWeight: 500 }}>{capitalize(result.name)}</span>
                            <span style={{ color: '#9ca3af', fontSize: 13, marginLeft: 'auto' }}>{padId(result.id)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
