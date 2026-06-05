'use client';
import { useState, useEffect, useCallback } from 'react';
import { Pokemon } from '@/lib/api';
import {
    getParty,
    addToParty,
    removeFromParty,
    isInParty,
} from '@/lib/storage';
import { capitalize } from '@/lib/utils';

export default function useParty() {
    const [party, setParty] = useState<Pokemon[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        setParty(getParty());
    }, []);

    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 2500);
    }, []);

    const addPokemonToParty = useCallback(
        (pokemon: Pokemon) => {
            const added = addToParty(pokemon);
            if (added) {
                setParty(getParty());
                showToast(`${capitalize(pokemon.name)} added to party!`);
            } else {
                showToast(
                    isInParty(pokemon.id)
                        ? `${capitalize(pokemon.name)} is already in your party`
                        : 'Party is full (max 6)'
                );
            }
        },
        [showToast]
    );

    const removePokemonFromParty = useCallback((pokemonId: number) => {
        removeFromParty(pokemonId);
        setParty(getParty());
    }, []);

    return { party, toastMessage, addPokemonToParty, removePokemonFromParty };
}
