'use client';
import { useRef, useState, useCallback } from 'react';
import { Pokemon } from '@/lib/api';
import ShareTeamCard from './ShareTeamCard';

interface ShareButtonProps {
    party: Pokemon[];
    username: string;
    variant?: 'default' | 'compact';
}

export default function ShareButton({ party, username, variant = 'default' }: ShareButtonProps) {
    const lightCardRef = useRef<HTMLDivElement>(null);
    const darkCardRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
    const [darkMode, setDarkMode] = useState(false);
    const [lightDataUrl, setLightDataUrl] = useState<string | null>(null);
    const [darkDataUrl, setDarkDataUrl] = useState<string | null>(null);

    async function captureCard(cardRef: React.RefObject<HTMLDivElement | null>, bgColor: string): Promise<string> {
        const html2canvas = (await import('html2canvas')).default;
        const cardElement = cardRef.current!;

        cardElement.style.position = 'fixed';
        cardElement.style.left = '-9999px';
        cardElement.style.top = '0px';
        cardElement.style.visibility = 'visible';

        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));

        const canvas = await html2canvas(cardElement, {
            backgroundColor: bgColor,
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
        });

        cardElement.style.visibility = 'hidden';
        cardElement.style.position = 'absolute';

        return canvas.toDataURL('image/png');
    }

    const handleOpenPreview = useCallback(async () => {
        if (party.length === 0) return;
        setIsCapturing(true);

        try {
            const [light, dark] = await Promise.all([
                captureCard(lightCardRef, '#eef0f4'),
                captureCard(darkCardRef, '#0f1117'),
            ]);
            setLightDataUrl(light);
            setDarkDataUrl(dark);
            setDarkMode(false);
            setPreviewDataUrl(light);
        } catch {
        } finally {
            setIsCapturing(false);
        }
    }, [party]);

    const handleToggleDarkMode = useCallback((isDark: boolean) => {
        setDarkMode(isDark);
        setPreviewDataUrl(isDark ? darkDataUrl : lightDataUrl);
    }, [lightDataUrl, darkDataUrl]);

    const handleShareToX = useCallback(() => {
        if (!previewDataUrl) return;

        const downloadLink = document.createElement('a');
        downloadLink.href = previewDataUrl;
        downloadLink.download = `${username}-pokemon-team.png`;
        downloadLink.click();

        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        const makeYoursLine = appUrl ? `\n\nMake yours: ${appUrl}` : '';
        const shareText = `Check out my Pokémon team! 🎮⚡ Gotta catch 'em all!${makeYoursLine}\n\n#Pokemon #Pokedex`;
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');

        setPreviewDataUrl(null);
        setLightDataUrl(null);
        setDarkDataUrl(null);
    }, [previewDataUrl, username]);

    const handleClosePreview = useCallback(() => {
        setPreviewDataUrl(null);
        setLightDataUrl(null);
        setDarkDataUrl(null);
    }, []);

    if (party.length === 0) return null;

    const isCompact = variant === 'compact';

    return (
        <>
            <ShareTeamCard ref={lightCardRef} party={party} username={username} darkMode={false} />
            <ShareTeamCard ref={darkCardRef} party={party} username={username} darkMode={true} />

            <button
                onClick={handleOpenPreview}
                disabled={isCapturing}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isCompact ? 6 : 8,
                    background: isCapturing ? '#1a1a2e' : '#000000',
                    color: 'white',
                    border: 'none',
                    borderRadius: isCompact ? 10 : 12,
                    padding: isCompact ? '8px 14px' : '10px 20px',
                    fontSize: isCompact ? 13 : 14,
                    fontWeight: 600,
                    cursor: isCapturing ? 'not-allowed' : 'pointer',
                    opacity: isCapturing ? 0.7 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}
                onMouseEnter={(e) => {
                    if (!isCapturing) (e.currentTarget as HTMLElement).style.background = '#1a1a2e';
                }}
                onMouseLeave={(e) => {
                    if (!isCapturing) (e.currentTarget as HTMLElement).style.background = '#000000';
                }}
                title="Preview and share team card on X"
            >
                {isCapturing ? (
                    <svg width="14" height="14" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
                        <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                        <path d="M24 6 a18 18 0 0 1 18 18" stroke="white" strokeWidth="4" strokeLinecap="round">
                            <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="0.8s" repeatCount="indefinite" />
                        </path>
                    </svg>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.194l4.264 5.635L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                    </svg>
                )}
                {isCapturing ? 'Generating...' : 'Share on X'}
            </button>

            {previewDataUrl && (
                <div
                    onClick={handleClosePreview}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: 24,
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#ffffff',
                            borderRadius: 20,
                            padding: 24,
                            maxWidth: 720,
                            width: '100%',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <div>
                                <div style={{ fontSize: 17, fontWeight: 700, color: '#1a202c' }}>
                                    Share your team
                                </div>
                                <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>
                                    Your card will be downloaded, then X will open
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    display: 'flex',
                                    background: '#f1f5f9',
                                    borderRadius: 8,
                                    padding: 3,
                                    gap: 2,
                                }}>
                                    <button
                                        onClick={() => handleToggleDarkMode(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            background: !darkMode ? '#ffffff' : 'transparent',
                                            border: 'none',
                                            borderRadius: 6,
                                            padding: '5px 10px',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: !darkMode ? '#1a202c' : '#94a3b8',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            boxShadow: !darkMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="5" />
                                            <line x1="12" y1="1" x2="12" y2="3" />
                                            <line x1="12" y1="21" x2="12" y2="23" />
                                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                            <line x1="1" y1="12" x2="3" y2="12" />
                                            <line x1="21" y1="12" x2="23" y2="12" />
                                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                        </svg>
                                        Light
                                    </button>
                                    <button
                                        onClick={() => handleToggleDarkMode(true)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            background: darkMode ? '#1e2130' : 'transparent',
                                            border: 'none',
                                            borderRadius: 6,
                                            padding: '5px 10px',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: darkMode ? '#e2e8f0' : '#94a3b8',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                                        }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                        </svg>
                                        Dark
                                    </button>
                                </div>
                                <button
                                    onClick={handleClosePreview}
                                    style={{
                                        background: '#f1f5f9',
                                        border: 'none',
                                        borderRadius: 8,
                                        width: 32,
                                        height: 32,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <img
                            src={previewDataUrl}
                            alt="Team card preview"
                            style={{
                                width: '100%',
                                borderRadius: 12,
                                border: '1.5px solid #e2e8f0',
                                display: 'block',
                            }}
                        />

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleClosePreview}
                                style={{
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '10px 20px',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={handleShareToX}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    background: '#000000',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '10px 20px',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.194l4.264 5.635L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                                </svg>
                                Share on X
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}