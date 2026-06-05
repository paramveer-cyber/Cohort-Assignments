import { typeColor, capitalize } from '@/lib/utils';

export default function TypeBadge({ type }: { type: string }) {
    const { bg, text } = typeColor(type);
    return (
        <span
            style={{
                background: bg,
                color: text,
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 20,
                display: 'inline-block',
            }}
        >
            {capitalize(type)}
        </span>
    );
}
