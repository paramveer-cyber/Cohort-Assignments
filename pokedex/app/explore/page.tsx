import { fetchPokemonList, fetchTotalPokemonCount } from '@/lib/api';
import ExploreClient from './ExploreClient';

const PER_PAGE = 48;

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page: pageParam } = await searchParams;
    const page = Math.max(1, parseInt(pageParam ?? '1') || 1);
    const [total, pagePokemon, allList] = await Promise.all([
        fetchTotalPokemonCount(),
        fetchPokemonList(PER_PAGE, (page - 1) * PER_PAGE),
        fetchPokemonList(10000, 0),
    ]);
    return (
        <ExploreClient
            pokemon={pagePokemon}
            allNames={allList.map((p) => p.name)}
            page={page}
            totalPages={Math.ceil(total / PER_PAGE)}
            total={total}
        />
    );
}
