'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchSlimPokemon, getCachedSlim } from '@/lib/api';
import PokemonSVG from '@/components/PokemonSVG';
import { capitalize, padId } from '@/lib/utils';

type SlimPokemon = { id: number; name: string; types: string[]; sprite: string | null };
type LoadState = 'idle' | 'loading' | 'done' | 'error';

export default function PokemonGrid({
    pokemonList,
    onPokemonClick,
    onTypeDataLoaded,
}: {
    pokemonList: { name: string; url: string }[];
    onPokemonClick: (id: number) => void;
    onTypeDataLoaded?: (id: number, types: string[]) => void;
}) {
    const [loadedPokemon, setLoadedPokemon] = useState<Map<number, SlimPokemon>>(new Map());
    const [loadStates, setLoadStates] = useState<Map<number, LoadState>>(new Map());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const bubbleElementRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    function idFromUrl(url: string) {
        return parseInt(url.split('/').filter(Boolean).pop()!);
    }

    useEffect(() => {
        setLoadedPokemon(new Map());
        setLoadStates(new Map());
        bubbleElementRefs.current = new Map();
    }, [pokemonList]);

    const loadOnePokemon = useCallback(
        async (name: string, id: number) => {
            setLoadStates((previous) => {
                if (previous.get(id) === 'loading' || previous.get(id) === 'done') return previous;
                return new Map(previous).set(id, 'loading');
            });
            try {
                const slim = await fetchSlimPokemon(name, id);
                setLoadedPokemon((previous) => new Map(previous).set(id, slim));
                setLoadStates((previous) => new Map(previous).set(id, 'done'));
                onTypeDataLoaded?.(id, slim.types);
            } catch {
                setLoadStates((previous) => new Map(previous).set(id, 'error'));
            }
        },
        [onTypeDataLoaded]
    );

    const setBubbleRef = useCallback(
        (element: HTMLDivElement | null, id: number, name: string) => {
            if (element) {
                bubbleElementRefs.current.set(id, element);
                observerRef.current?.observe(element);
            } else {
                const existingElement = bubbleElementRefs.current.get(id);
                if (existingElement) observerRef.current?.unobserve(existingElement);
                bubbleElementRefs.current.delete(id);
            }
        },
        []
    );

    useEffect(() => {
        observerRef.current?.disconnect();
        observerRef.current = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const element = entry.target as HTMLDivElement;
                        loadOnePokemon(element.dataset.name!, parseInt(element.dataset.id!));
                    }
                }
            },
            { rootMargin: '300px' }
        );
        for (const [, element] of bubbleElementRefs.current) observerRef.current.observe(element);
        return () => observerRef.current?.disconnect();
    }, [pokemonList, loadOnePokemon]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 10, marginBottom: 32 }}>
            {pokemonList.map((entry) => {
                const id = idFromUrl(entry.url);
                const slim = loadedPokemon.get(id);
                const loadState = loadStates.get(id) ?? 'idle';

                return (
                    <div
                        key={id}
                        data-name={entry.name}
                        data-id={id}
                        ref={(element) => setBubbleRef(element, id, entry.name)}
                        onClick={() => slim && onPokemonClick(id)}
                        title={slim ? `${capitalize(entry.name)} ${padId(id)}` : entry.name}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: slim ? 'pointer' : 'default' }}
                    >
                        <div
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: '50%',
                                background: slim ? 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(220,230,245,0.7))' : 'rgba(0,0,0,0.04)',
                                border: slim ? '1px solid rgba(255,255,255,0.6)' : '2px dashed #e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: slim ? '0 2px 8px rgba(0,0,0,0.09)' : 'none',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={(event) => {
                                if (slim) {
                                    (event.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
                                    (event.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                                }
                            }}
                            onMouseLeave={(event) => {
                                (event.currentTarget as HTMLElement).style.transform = '';
                                (event.currentTarget as HTMLElement).style.boxShadow = slim ? '0 2px 8px rgba(0,0,0,0.09)' : 'none';
                            }}
                        >
                            {slim ? (
                                slim.sprite ? (
                                    <img src={slim.sprite} alt={slim.name} width={54} height={54} style={{ objectFit: 'contain' }} />
                                ) : (
                                    <PokemonSVG id={slim.id} types={slim.types} size={54} />
                                )
                            ) : loadState === 'loading' ? (
                                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                                    <circle cx="24" cy="24" r="18" stroke="#e5e7eb" strokeWidth="4" />
                                    <path d="M24 6 a18 18 0 0 1 18 18" stroke="#c0392b" strokeWidth="4" strokeLinecap="round">
                                        <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="0.8s" repeatCount="indefinite" />
                                    </path>
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                    <path d="M12 17h.01" />
                                </svg>
                            )}
                        </div>
                        {slim && (
                            <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>
                                {capitalize(slim.name)}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
