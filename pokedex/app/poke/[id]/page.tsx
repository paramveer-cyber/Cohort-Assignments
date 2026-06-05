import { notFound } from 'next/navigation';
import { fetchPokemon, fetchPokemonList } from '@/lib/api';
import PokemonDetailClient from './PokemonDetailClient';
import type { Metadata } from 'next';
import { capitalize, padId } from '@/lib/utils';

// ISR: revalidate every hour (just so that if poke is updated from that db i can update it here also)
export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

// SSG: pre-build the first 151 Pokémon at build time (i mostly know 1st gen so i did SSG of 151 for start)
export async function generateStaticParams() {
    const list = await fetchPokemonList(151, 0);
    return list.map((entry) => {
        const id = entry.url.split('/').filter(Boolean).pop()!;
        return { id };
    });
}

function parseId(raw: string): number | null {
    if (!/^\d+$/.test(raw)) return null;
    const n = parseInt(raw, 10);
    return n >= 1 ? n : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id: raw } = await params;
    const id = parseId(raw);
    if (!id) return { title: 'Not Found' };

    try {
        const pokemon = await fetchPokemon(id);
        const name = capitalize(pokemon.name);
        const types = pokemon.types.map(capitalize).join(' / ');
        const description = pokemon.flavorText
            ? pokemon.flavorText
            : `${name} is a ${types} type Pokémon. ${padId(pokemon.id)}`;

        return {
            title: `${name} ${padId(pokemon.id)} | Pokédex`,
            description,
            openGraph: {
                title: `${name} — Pokédex`,
                description,
                images: pokemon.sprite ? [{ url: pokemon.sprite, width: 475, height: 475, alt: name }] : [],
            },
        };
    } catch {
        return { title: 'Pokémon Not Found' };
    }
}

export default async function PokemonDetailPage({ params }: Props) {
    const { id: raw } = await params;
    const id = parseId(raw);

    if (!id) notFound();

    try {
        const pokemon = await fetchPokemon(id);
        return <PokemonDetailClient pokemon={pokemon} />;
    } catch {
        notFound();
    }
}