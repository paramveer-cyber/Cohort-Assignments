'use client';
import React from 'react';

export default function Row({
    label,
    value,
    fontSize = 10,
}: {
    label: string;
    value: React.ReactNode;
    fontSize?: number;
}) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid #e8e8e3',
            }}
        >
            <span
                style={{
                    fontSize,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontWeight: 600,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: fontSize + 1,
                    color: '#374151',
                    fontWeight: 500,
                    textAlign: 'right',
                    maxWidth: '60%',
                }}
            >
                {value}
            </span>
        </div>
    );
}
