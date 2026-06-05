import { fetchPokemonList, fetchPokemonBatch } from '@/lib/api';
import HomeClient from './HomeClient';

export default async function Home() {
    const allList = await fetchPokemonList(10000, 0);
    const suggested = await fetchPokemonBatch(['pikachu', 'jigglypuff']);
    return (
        <HomeClient
            suggested={suggested}
            allNames={allList.map((p) => p.name)}
        />
    );
}
