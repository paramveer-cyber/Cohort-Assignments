'use client';

export default function GenderBar({ rate, fontSize = 10 }: { rate: number; fontSize?: number }) {
    if (rate === -1)
        return <span style={{ fontSize, color: '#9ca3af' }}>Genderless</span>;

    const femalePercent = (rate / 8) * 100;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize, color: '#ec4899' }}>♀</span>
            <div style={{ flex: 1, height: 5, background: '#f9a8d4', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${femalePercent}%`, height: '100%', background: '#ec4899', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize, color: '#60a5fa' }}>♂</span>
        </div>
    );
}
