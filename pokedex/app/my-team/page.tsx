import { fetchPokemonList } from '@/lib/api';
import MyTeamClient from './MyTeamClient';

export const metadata = { title: 'My Team | Pokédex' };

export default async function MyTeamPage() {
    const allList = await fetchPokemonList(10000, 0);
    return <MyTeamClient allNames={allList.map((p) => p.name)} />;
}
