const colors: Record<string, { bg: string; text: string }> = {
    electric: { bg: '#fef3c7', text: '#92400e' },
    fairy: { bg: '#fce7f3', text: '#9d174d' },
    grass: { bg: '#dcfce7', text: '#166534' },
    fire: { bg: '#fee2e2', text: '#991b1b' },
    water: { bg: '#dbeafe', text: '#1e3a8a' },
    normal: { bg: '#f3f4f6', text: '#374151' },
    psychic: { bg: '#fce7f3', text: '#9d174d' },
    poison: { bg: '#f3e8ff', text: '#6b21a8' },
    rock: { bg: '#e7e5e4', text: '#44403c' },
    ground: { bg: '#fef3c7', text: '#78350f' },
    bug: { bg: '#ecfccb', text: '#365314' },
    flying: { bg: '#ede9fe', text: '#4c1d95' },
    dragon: { bg: '#ede9fe', text: '#4c1d95' },
    ice: { bg: '#cffafe', text: '#164e63' },
    fighting: { bg: '#fee2e2', text: '#991b1b' },
    ghost: { bg: '#f3e8ff', text: '#6b21a8' },
    steel: { bg: '#f1f5f9', text: '#334155' },
    dark: { bg: '#1f2937', text: '#f9fafb' },
};

export function typeColor(type: string) {
    return colors[type] ?? { bg: '#f3f4f6', text: '#374151' };
}

export function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export function padId(id: number) {
    return `#${String(id).padStart(3, '0')}`;
}
