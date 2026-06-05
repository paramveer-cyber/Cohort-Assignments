'use client';

export type TabId = 'info' | 'stats' | 'moves' | 'evo';

const TABS: { id: TabId; label: string }[] = [
    { id: 'info', label: 'Info' },
    { id: 'stats', label: 'Stats' },
    { id: 'moves', label: 'Moves' },
    { id: 'evo', label: 'Evo' },
];

export default function TabBar({
    activeTab,
    onTabChange,
    compact = false,
}: {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    compact?: boolean;
}) {
    return (
        <div style={{ display: 'flex', background: compact ? '#e8e8e3' : 'transparent', borderBottom: `${compact ? 2 : 1}px solid ${compact ? '#444' : '#e5e7eb'}` }}>
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={{
                        flex: 1,
                        padding: compact ? '7px 0' : '10px 0',
                        fontSize: compact ? 10 : 12,
                        fontWeight: 700,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        background: compact && activeTab === tab.id ? '#f5f5f0' : 'transparent',
                        border: 'none',
                        borderBottom: activeTab === tab.id ? `2px solid #c0392b` : '2px solid transparent',
                        color: activeTab === tab.id ? '#c0392b' : compact ? '#6b7280' : '#9ca3af',
                        fontFamily: compact ? "'Courier New', monospace" : 'inherit',
                        marginBottom: compact ? -2 : 0,
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
