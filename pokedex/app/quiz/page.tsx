import { PokeImage } from './QuizClient';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const title = "Who's That Pokémon? — Poké Quiz";
    const description =
        'Test your Pokémon knowledge! Guess the silhouette across Generations I–V. Earn XP for correct answers and climb the leaderboard.';

    return {
        title,
        description,
        keywords: ['pokemon', 'quiz', 'who is that pokemon', 'silhouette', 'pokedex', 'guessing game'],
        openGraph: {
            title,
            description,
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title,
            description,
        },
    };
}

export default function QuizPage() {
    return <PokeImage />;
}