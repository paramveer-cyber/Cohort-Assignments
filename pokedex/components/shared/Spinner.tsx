'use client';

export default function Spinner({ size = 48 }: { size?: number }) {
    const radius = size * 0.42;
    const center = size / 2;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
            <circle cx={center} cy={center} r={radius} stroke="#e5e7eb" strokeWidth={size * 0.083} />
            <path
                d={`M${center} ${center - radius} a${radius} ${radius} 0 0 1 ${radius} ${radius}`}
                stroke="#c0392b"
                strokeWidth={size * 0.083}
                strokeLinecap="round"
            >
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`0 ${center} ${center}`}
                    to={`360 ${center} ${center}`}
                    dur="0.8s"
                    repeatCount="indefinite"
                />
            </path>
        </svg>
    );
}
