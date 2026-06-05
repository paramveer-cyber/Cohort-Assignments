'use client';
import { useEffect, useRef } from 'react';

function silhouettePokemon(image: HTMLImageElement, ctx: CanvasRenderingContext2D, isHidden: boolean) {
    ctx.clearRect(0, 0, 500, 500);
    ctx.drawImage(image, 0, 0);
    if (!isHidden) return;
    const { width, height } = image;
    const pixelData = ctx.getImageData(0, 0, width, height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * 4) * width + x * 4;
            pixelData.data[i] = 0;
            pixelData.data[i + 1] = 0;
            pixelData.data[i + 2] = 0;
        }
    }
    ctx.putImageData(pixelData, 0, 0, 0, 0, pixelData.width, pixelData.height);
}

export default function QuizCanvas({
    spriteUrl,
    isHidden,
    isVisible,
}: {
    spriteUrl: string;
    isHidden: boolean;
    isVisible: boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!spriteUrl) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', {willReadFrequently: true});
        if (!ctx) return;
        canvas.style.opacity = '0.25';
        canvas.style.transform = 'scale(0.5)';

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            silhouettePokemon(image, ctx, isHidden);
            setTimeout(() => {
                canvas.style.opacity = '0.5';
                canvas.style.transform = 'scale(0.85)';
            }, 25);
            setTimeout(() => {
                canvas.style.opacity = '1';
                canvas.style.transform = 'scale(1)';
            }, 50);
        };
        image.src = spriteUrl;
    }, [spriteUrl, isHidden]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 260,
            height: 260,
            position: 'relative',
        }}>
            {!isVisible && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                }}>
                    Press Generate
                </div>
            )}
            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                style={{
                    width: 260,
                    height: 260,
                    opacity: isVisible ? 1 : 0,
                    transform: 'scale(1)',
                    transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                    display: 'block',
                    filter: isHidden
                        ? 'drop-shadow(0 12px 32px rgba(0,0,0,0.28))'
                        : 'drop-shadow(0 8px 24px rgba(0,0,0,0.08))',
                }}
            />
        </div>
    );
}