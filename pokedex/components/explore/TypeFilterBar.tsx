'use client';
import { capitalize, typeColor } from '@/lib/utils';

const ALL_TYPES = [
    'fire',
    'water',
    'grass',
    'electric',
    'psychic',
    'ice',
    'dragon',
    'dark',
    'fairy',
    'normal',
    'fighting',
    'flying',
    'poison',
    'ground',
    'rock',
    'bug',
    'ghost',
    'steel',
];

export default function TypeFilterBar({
    activeType,
    onTypeChange,
}: {
    activeType: string | null;
    onTypeChange: (type: string | null) => void;
}) {
    return (
        <div
            style={{
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                alignItems: 'center',
            }}
        >
            <button
                onClick={() => onTypeChange(null)}
                style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '1px solid #e5e7eb',
                    background: activeType === null ? '#c0392b' : 'white',
                    color: activeType === null ? 'white' : '#374151',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                }}
            >
                All
            </button>
            {ALL_TYPES.map((type) => {
                const { bg, text } = typeColor(type);
                const isActive = activeType === type;
                return (
                    <button
                        key={type}
                        onClick={() => onTypeChange(isActive ? null : type)}
                        style={{
                            padding: '5px 12px',
                            borderRadius: 20,
                            border: `1px solid ${isActive ? 'transparent' : '#e5e7eb'}`,
                            background: isActive ? bg : 'white',
                            color: isActive ? text : '#6b7280',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        {capitalize(type)}
                    </button>
                );
            })}
        </div>
    );
}
