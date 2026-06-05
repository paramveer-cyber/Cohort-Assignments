export function statColor(value: number): string {
    if (value >= 100) return '#22c55e';
    if (value >= 70) return '#84cc16';
    if (value >= 50) return '#f59e0b';
    return '#ef4444';
}

export const statLabels: Record<string, string> = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SpA',
    'special-defense': 'SpD',
    speed: 'SPD',
};
