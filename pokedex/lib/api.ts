const BASE = 'https://pokeapi.co/api/v2';

const pokemonCache = new Map<string | number, Pokemon>();
const slimCache = new Map<number, SlimPokemon>();

export interface EvoNode {
    name: string;
    id: number;
    sprite: string | null;
    minLevel: number | null;
    trigger: string | null;
    next: EvoNode[];
}

export interface AbilityDetail {
    name: string;
    isHidden: boolean;
    slot: number;
    description: string;
}

export interface Pokemon {
    id: number;
    name: string;
    types: string[];
    sprite: string | null;
    stats: { name: string; value: number }[];
    height: number;
    weight: number;
    abilityDetails: AbilityDetail[];
    flavorText: string;
    genus: string;
    isLegendary: boolean;
    isMythical: boolean;
    habitat: string | null;
    eggGroups: string[];
    genderRate: number;
    captureRate: number;
    baseExp: number;
    evolutionChain: EvoNode | null;
    weaknesses: string[];
    cryUrl: string | null;
    moves: { name: string; level: number; method: string }[];
}

type SlimPokemon = {
    id: number;
    name: string;
    types: string[];
    sprite: string | null;
};

async function fetchJson(url: string) {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Failed: ${url}`);
    return res.json();
}

function extractEvoChain(link: any): EvoNode {
    const urlParts = link.species.url.split('/');
    const speciesId = parseInt(urlParts[urlParts.length - 2]);
    const details = link.evolution_details?.[0];
    return {
        name: link.species.name,
        id: speciesId,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`,
        minLevel: details?.min_level ?? null,
        trigger: details?.trigger?.name ?? null,
        next: (link.evolves_to ?? []).map(extractEvoChain),
    };
}

async function getTypeWeaknesses(types: string[]): Promise<string[]> {
    const results = await Promise.all(
        types.map((t) => fetchJson(`${BASE}/type/${t}`))
    );
    const dmgFrom = new Map<string, number>();
    for (const typeData of results) {
        const rel = typeData.damage_relations;
        for (const t of rel.double_damage_from)
            dmgFrom.set(t.name, (dmgFrom.get(t.name) ?? 1) * 2);
        for (const t of rel.half_damage_from)
            dmgFrom.set(t.name, (dmgFrom.get(t.name) ?? 1) * 0.5);
        for (const t of rel.no_damage_from) dmgFrom.set(t.name, 0);
    }
    return Array.from(dmgFrom.entries())
        .filter(([, mult]) => mult >= 2)
        .map(([name]) => name);
}

async function getAbilityDescriptions(
    rawAbilities: any[]
): Promise<AbilityDetail[]> {
    return Promise.all(
        rawAbilities.map(async (a) => {
            try {
                const data = await fetchJson(
                    `${BASE}/ability/${a.ability.name}`
                );
                const enEntry = data.effect_entries?.find(
                    (e: any) => e.language.name === 'en'
                );
                return {
                    name: a.ability.name,
                    isHidden: a.is_hidden,
                    slot: a.slot,
                    description: enEntry?.short_effect ?? enEntry?.effect ?? '',
                } as AbilityDetail;
            } catch {
                return {
                    name: a.ability.name,
                    isHidden: a.is_hidden,
                    slot: a.slot,
                    description: '',
                };
            }
        })
    );
}

export async function fetchPokemonList(limit = 20, offset = 0) {
    const data = await fetchJson(
        `${BASE}/pokemon?limit=${limit}&offset=${offset}`
    );
    return data.results as { name: string; url: string }[];
}

export async function fetchTotalPokemonCount(): Promise<number> {
    const data = await fetchJson(`${BASE}/pokemon?limit=1&offset=0`);
    return data.count as number;
}

export async function fetchPokemon(
    nameOrId: string | number
): Promise<Pokemon> {
    const cacheKey = typeof nameOrId === 'number' ? nameOrId : nameOrId.toLowerCase();
    if (pokemonCache.has(cacheKey)) return pokemonCache.get(cacheKey)!;

    const d = await fetchJson(`${BASE}/pokemon/${nameOrId}`);
    const types: string[] = d.types.map((t: any) => t.type.name);
    const sprite =
        d.sprites?.other?.['official-artwork']?.front_default ??
        d.sprites?.front_default ??
        null;
    const cryUrl = d.cries?.latest ?? d.cries?.legacy ?? null;

    const levelUpMoves = (d.moves ?? [])
        .map((m: any) => {
            const vgd = m.version_group_details?.[0];
            return {
                name: m.move.name,
                level: vgd?.level_learned_at ?? 0,
                method: vgd?.move_learn_method?.name ?? '',
            };
        })
        .filter((mv: any) => mv.method === 'level-up')
        .sort((a: any, b: any) => a.level - b.level)
        .slice(0, 20);

    const [speciesData, weaknesses, abilityDetails] = await Promise.all([
        fetchJson(d.species.url),
        getTypeWeaknesses(types),
        getAbilityDescriptions(d.abilities),
    ]);

    const flavorText =
        speciesData.flavor_text_entries
            ?.filter((e: any) => e.language.name === 'en')
            ?.reverse()
            ?.find((e: any) => e.flavor_text)
            ?.flavor_text.replace(/\f|\n/g, ' ') ?? '';

    const genus =
        speciesData.genera?.find((g: any) => g.language.name === 'en')?.genus ??
        '';

    let evolutionChain: EvoNode | null = null;
    if (speciesData.evolution_chain?.url) {
        try {
            const evoData = await fetchJson(speciesData.evolution_chain.url);
            evolutionChain = extractEvoChain(evoData.chain);
        } catch {}
    }

    const pokemon: Pokemon = {
        id: d.id,
        name: d.name,
        types,
        sprite,
        stats: d.stats.map((s: any) => ({
            name: s.stat.name,
            value: s.base_stat,
        })),
        height: d.height,
        weight: d.weight,
        abilityDetails,
        flavorText,
        genus,
        isLegendary: speciesData.is_legendary ?? false,
        isMythical: speciesData.is_mythical ?? false,
        habitat: speciesData.habitat?.name ?? null,
        eggGroups: (speciesData.egg_groups ?? []).map((g: any) => g.name),
        genderRate: speciesData.gender_rate ?? -1,
        captureRate: speciesData.capture_rate ?? 0,
        baseExp: d.base_experience ?? 0,
        evolutionChain,
        weaknesses,
        cryUrl,
        moves: levelUpMoves,
    };

    pokemonCache.set(d.id, pokemon);
    pokemonCache.set(d.name, pokemon);
    return pokemon;
}

export async function fetchPokemonBatch(names: string[]): Promise<Pokemon[]> {
    return Promise.all(names.map(fetchPokemon));
}

export function getCachedSlim(id: number) {
    return slimCache.get(id) ?? null;
}

export async function fetchSlimPokemon(
    name: string,
    id: number
): Promise<SlimPokemon> {
    if (slimCache.has(id)) return slimCache.get(id)!;
    if (pokemonCache.has(id)) {
        const full = pokemonCache.get(id)!;
        const slim = {
            id: full.id,
            name: full.name,
            types: full.types,
            sprite: full.sprite,
        };
        slimCache.set(id, slim);
        return slim;
    }
    const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const d = await r.json();
    const slim: SlimPokemon = {
        id: d.id,
        name: d.name,
        types: d.types.map((t: any) => t.type.name),
        sprite:
            d.sprites?.other?.['official-artwork']?.front_default ??
            d.sprites?.front_default ??
            null,
    };
    slimCache.set(id, slim);
    return slim;
}
