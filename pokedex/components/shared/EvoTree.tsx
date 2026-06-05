'use client';
import { EvoNode } from '@/lib/api';
import { capitalize } from '@/lib/utils';

export default function EvoTree({
    node,
    depth = 0,
    nodeSize = 44,
}: {
    node: EvoNode;
    depth?: number;
    nodeSize?: number;
}) {
    const imageSize = Math.round(nodeSize * 0.77);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: depth > 0 ? 4 : 0 }}>
                {depth > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 2 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        {node.minLevel && (
                            <span style={{ fontSize: 8, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                                Lv.{node.minLevel}
                            </span>
                        )}
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                        style={{
                            width: nodeSize,
                            height: nodeSize,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(220,230,245,0.7))',
                            border: '1px solid rgba(255,255,255,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        }}
                    >
                        {node.sprite ? (
                            <img src={node.sprite} width={imageSize} height={imageSize} style={{ objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontSize: 9, color: '#9ca3af' }}>?</span>
                        )}
                    </div>
                    <span style={{ fontSize: 9, color: '#374151', fontWeight: 500, marginTop: 2, textAlign: 'center' }}>
                        {capitalize(node.name)}
                    </span>
                </div>
            </div>
            {node.next.length > 0 && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    {node.next.map((child) => (
                        <EvoTree key={child.name} node={child} depth={depth + 1} nodeSize={nodeSize} />
                    ))}
                </div>
            )}
        </div>
    );
}
