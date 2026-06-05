'use client';

const typeHues: Record<string, string> = {
    fire: '10',
    water: '210',
    grass: '140',
    electric: '55',
    psychic: '320',
    ice: '190',
    dragon: '260',
    dark: '0',
    fairy: '330',
    normal: '40',
    fighting: '20',
    flying: '200',
    poison: '280',
    ground: '30',
    rock: '35',
    bug: '90',
    ghost: '270',
    steel: '220',
};

export default function PokemonSVG({
    id,
    types,
    size = 80,
}: {
    id: number;
    types: string[];
    size?: number;
}) {
    const hue = typeHues[types[0]] ?? '200';
    const rand = (n: number) =>
        Number(BigInt(((id * 31 + n) * 1664525 + 1013904223) & 0xffffffff)) /
        0xffffffff;

    const bodyX = size * 0.5;
    const bodyY = size * 0.52;
    const bodyR = size * 0.22;
    const headR = size * 0.18;
    const eyeOff = size * 0.065;

    const spots = Array.from({ length: 3 }, (_, i) => ({
        cx: bodyX + (rand(i * 3) - 0.5) * bodyR * 1.2,
        cy: bodyY + (rand(i * 3 + 1) - 0.5) * bodyR * 0.8,
        r: bodyR * (0.1 + rand(i * 3 + 2) * 0.12),
    }));

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <radialGradient id={`bg${id}`} cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor={`hsl(${hue},60%,92%)`} />
                    <stop offset="100%" stopColor={`hsl(${hue},40%,82%)`} />
                </radialGradient>
                <radialGradient id={`body${id}`} cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor={`hsl(${hue},55%,72%)`} />
                    <stop offset="100%" stopColor={`hsl(${hue},50%,48%)`} />
                </radialGradient>
                <radialGradient id={`head${id}`} cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor={`hsl(${hue},55%,75%)`} />
                    <stop offset="100%" stopColor={`hsl(${hue},50%,52%)`} />
                </radialGradient>
                <filter
                    id={`shadow${id}`}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                >
                    <feDropShadow
                        dx="0"
                        dy={size * 0.02}
                        stdDeviation={size * 0.03}
                        floodColor={`hsl(${hue},40%,30%)`}
                        floodOpacity="0.25"
                    />
                </filter>
            </defs>

            <circle
                cx={size * 0.5}
                cy={size * 0.5}
                r={size * 0.45}
                fill={`url(#bg${id})`}
            />

            <ellipse
                cx={size * 0.5}
                cy={size * 0.92}
                rx={size * 0.25}
                ry={size * 0.05}
                fill={`hsl(${hue},30%,60%)`}
                opacity="0.3"
            />

            <circle
                cx={bodyX}
                cy={bodyY}
                r={bodyR}
                fill={`url(#body${id})`}
                filter={`url(#shadow${id})`}
            />

            {spots.map((s, i) => (
                <circle
                    key={i}
                    cx={s.cx}
                    cy={s.cy}
                    r={s.r}
                    fill={`hsl(${hue},60%,35%)`}
                    opacity="0.18"
                />
            ))}

            <circle
                cx={bodyX}
                cy={bodyY - bodyR * 0.9}
                r={headR}
                fill={`url(#head${id})`}
                filter={`url(#shadow${id})`}
            />

            <circle
                cx={bodyX - eyeOff}
                cy={bodyY - bodyR * 0.9 - headR * 0.1}
                r={size * 0.028}
                fill="white"
            />
            <circle
                cx={bodyX + eyeOff}
                cy={bodyY - bodyR * 0.9 - headR * 0.1}
                r={size * 0.028}
                fill="white"
            />
            <circle
                cx={bodyX - eyeOff + size * 0.008}
                cy={bodyY - bodyR * 0.9 - headR * 0.1 + size * 0.005}
                r={size * 0.016}
                fill="#1a1a2e"
            />
            <circle
                cx={bodyX + eyeOff + size * 0.008}
                cy={bodyY - bodyR * 0.9 - headR * 0.1 + size * 0.005}
                r={size * 0.016}
                fill="#1a1a2e"
            />

            <path
                d={`M ${bodyX - size * 0.04} ${bodyY - bodyR * 0.9 + headR * 0.4} q ${size * 0.04} ${size * 0.03} ${size * 0.08} 0`}
                stroke={`hsl(${hue},60%,30%)`}
                strokeWidth={size * 0.018}
                fill="none"
                strokeLinecap="round"
            />

            <line
                x1={bodyX - bodyR}
                y1={bodyY - bodyR * 0.2}
                x2={bodyX - bodyR * 1.5}
                y2={bodyY + bodyR * 0.4}
                stroke={`url(#body${id})`}
                strokeWidth={size * 0.1}
                strokeLinecap="round"
            />
            <line
                x1={bodyX + bodyR}
                y1={bodyY - bodyR * 0.2}
                x2={bodyX + bodyR * 1.5}
                y2={bodyY + bodyR * 0.4}
                stroke={`url(#body${id})`}
                strokeWidth={size * 0.1}
                strokeLinecap="round"
            />
            <line
                x1={bodyX - bodyR * 0.35}
                y1={bodyY + bodyR * 0.9}
                x2={bodyX - bodyR * 0.35}
                y2={bodyY + bodyR * 1.5}
                stroke={`url(#body${id})`}
                strokeWidth={size * 0.12}
                strokeLinecap="round"
            />
            <line
                x1={bodyX + bodyR * 0.35}
                y1={bodyY + bodyR * 0.9}
                x2={bodyX + bodyR * 0.35}
                y2={bodyY + bodyR * 1.5}
                stroke={`url(#body${id})`}
                strokeWidth={size * 0.12}
                strokeLinecap="round"
            />
        </svg>
    );
}
