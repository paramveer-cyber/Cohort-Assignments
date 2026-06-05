'use client';
import { fetchPokemon, Pokemon } from '@/lib/api';
import { capitalize } from '@/lib/utils';
import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import QuizCanvas from '@/components/quiz/QuizCanvas';
import { useAuth } from '@/context/auth/AuthContext';
import { dispatchXpToast } from '@/components/Navbar';
import { updateXP } from '@/actions/party';
import Link from 'next/link';

const GEN_RANGES: Record<string, [number, number]> = {
    'I':   [1,   151],
    'II':  [152, 251],
    'III': [252, 386],
    'IV':  [387, 493],
    'V':   [494, 649],
};

const ALL_GENS = Object.keys(GEN_RANGES) as (keyof typeof GEN_RANGES)[];
const OPTION_COUNT = 4;
const FALLBACK_COOLDOWN_MS = 6000;

function pickRandomIdFromGens(selectedGens: string[]): number {
    const gens = selectedGens.length > 0 ? selectedGens : ALL_GENS;
    const randomGen = gens[Math.floor(Math.random() * gens.length)];
    const [min, max] = GEN_RANGES[randomGen];
    return min + Math.floor(Math.random() * (max - min + 1));
}

function generateWrongIds(correctId: number, selectedGens: string[]): number[] {
    const wrongIds = new Set<number>();
    while (wrongIds.size < OPTION_COUNT - 1) {
        const candidate = pickRandomIdFromGens(selectedGens);
        if (candidate !== correctId) wrongIds.add(candidate);
    }
    return Array.from(wrongIds);
}

function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
}

function computeXpGain(pokemon: Pokemon): number {
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);
    return Math.floor(totalStats / 20);
}

function computeXpLoss(pokemon: Pokemon): number {
    const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);
    return Math.floor(totalStats / 30);
}

type OptionState = 'idle' | 'correct' | 'wrong';

function OptionButton({ name, state, isSelected, hasAnswered, onSelect }: {
    name: string;
    state: OptionState;
    isSelected: boolean;
    hasAnswered: boolean;
    onSelect: () => void;
}) {
    const bgMap = { idle: 'white', correct: '#dcfce7', wrong: isSelected ? '#fee2e2' : 'white' };
    const borderMap = { idle: '1.5px solid #e2e8f0', correct: '1.5px solid #16a34a', wrong: isSelected ? '1.5px solid #dc2626' : '1.5px solid #e2e8f0' };
    const colorMap = { idle: '#1a202c', correct: '#15803d', wrong: isSelected ? '#dc2626' : '#1a202c' };

    return (
        <button
            onClick={() => !hasAnswered && onSelect()}
            disabled={hasAnswered}
            style={{
                background: bgMap[state],
                border: borderMap[state],
                borderRadius: 12,
                padding: '13px 16px',
                cursor: hasAnswered ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                transition: 'all 0.18s ease',
                fontFamily: 'inherit',
                width: '100%',
            }}
        >
            <span style={{ fontSize: 14, fontWeight: 600, color: colorMap[state], textAlign: 'left' }}>
                {capitalize(name)}
            </span>
            {state === 'correct' && <span style={{ fontSize: 16, color: '#16a34a' }}>✓</span>}
            {state === 'wrong' && isSelected && <span style={{ fontSize: 16, color: '#dc2626' }}>✗</span>}
        </button>
    );
}

export const PokeImage = () => {
    const [spriteUrl, setSpriteUrl] = useState('');
    const [correctPokemonName, setCorrectPokemonName] = useState('');
    const [correctPokemon, setCorrectPokemon] = useState<Pokemon | null>(null);
    const [isHidden, setIsHidden] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [answerOptions, setAnswerOptions] = useState<string[]>([]);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [nextAvailableAt, setNextAvailableAt] = useState<number>(0);
    const [isCoolingDown, setIsCoolingDown] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [selectedGens, setSelectedGens] = useState<string[]>(['I', 'II']);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { user, store } = useAuth();

    useEffect(() => {
        const remaining = nextAvailableAt - Date.now();
        if (remaining <= 0) { setIsCoolingDown(false); return; }
        setIsCoolingDown(true);
        const timer = setTimeout(() => setIsCoolingDown(false), remaining);
        return () => clearTimeout(timer);
    }, [nextAvailableAt]);

    // Server Action — the quiz just fires a delta after a correct/wrong answer.
    // No API route is needed: there's no HTTP status or response body the client
    // cares about beyond a best-effort persist, making this a clean SA use case.
    const postXpDelta = useCallback(async (delta: number) => {
        const accessToken = store.getAccessToken();
        if (!accessToken) return;
        try {
            await updateXP(accessToken, delta);
            dispatchXpToast(delta);
        } catch {}
    }, [store]);

    const toggleGen = useCallback((gen: string) => {
        setSelectedGens(prev => {
            if (prev.includes(gen)) {
                if (prev.length === 1) return prev;
                return prev.filter(g => g !== gen);
            }
            return [...prev, gen];
        });
    }, []);

    const generateRandomPokemon = useCallback(async () => {
        setIsLoading(true);
        setIsHidden(true);
        setSelectedOption(null);
        setHasAnswered(false);
        setAnswerOptions([]);
        setSpriteUrl('');
        setCorrectPokemon(null);

        const correctId = pickRandomIdFromGens(selectedGens);
        const wrongIds = generateWrongIds(correctId, selectedGens);

        const [fetchedCorrect, ...wrongPokemon] = await Promise.all([
            fetchPokemon(correctId),
            ...wrongIds.map(fetchPokemon),
        ]);

        const shuffledOptions = shuffleArray([fetchedCorrect.name, ...wrongPokemon.map(p => p.name)]);

        setSpriteUrl(fetchedCorrect.sprite ?? '');
        setCorrectPokemonName(fetchedCorrect.name);
        setCorrectPokemon(fetchedCorrect);
        setAnswerOptions(shuffledOptions);
        setIsLoading(false);

        const audio = audioRef.current;
        if (audio && audioEnabled) {
            audio.play().catch(() => {});
            const audioDurationMs = (audio.duration || 5) * 1000;
            setNextAvailableAt(Date.now() + audioDurationMs + 1000);
        } else {
            setNextAvailableAt(Date.now() + FALLBACK_COOLDOWN_MS);
        }
    }, [selectedGens, audioEnabled]);

    const handleOptionSelect = useCallback((selectedName: string) => {
        if (!correctPokemon) return;
        setSelectedOption(selectedName);
        setHasAnswered(true);
        setIsHidden(false);
        const isCorrect = selectedName === correctPokemonName;
        setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
        if (user) {
            postXpDelta(isCorrect ? computeXpGain(correctPokemon) : -computeXpLoss(correctPokemon));
        }
    }, [correctPokemon, correctPokemonName, user, postXpDelta]);

    const isIdle = !spriteUrl && !isLoading;
    const isButtonDisabled = isLoading || isCoolingDown;

    const genLabel = selectedGens.length === ALL_GENS.length
        ? 'All gens'
        : selectedGens.length === 1
            ? `Gen ${selectedGens[0]}`
            : `Gen ${[...selectedGens].sort().join(', ')}`;

    return (
        <div style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
            <div className="quiz-grid">

                <div className="quiz-image-wrapper">
                    <Image src="/gtp-quiz.jpeg" width={600} height={1200} alt="backdrop" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isLoading ? (
                            <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                                <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                                <path d="M24 6 a18 18 0 0 1 18 18" stroke="white" strokeWidth="4" strokeLinecap="round">
                                    <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="0.7s" repeatCount="indefinite" />
                                </path>
                            </svg>
                        ) : isIdle ? (
                            <></>
                        ) : (
                            <div className='relative -ml-42.5 mb-20 scale-95'>
                                <QuizCanvas spriteUrl={spriteUrl} isHidden={isHidden} isVisible={!!spriteUrl} />
                            </div>
                        )}
                    </div>
                    {hasAnswered && correctPokemonName && (
                        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '6px 20px', borderRadius: 24, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
                            {capitalize(correctPokemonName)}
                        </div>
                    )}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: selectedOption === correctPokemonName ? 'linear-gradient(90deg, #16a34a, #22c55e)' : hasAnswered ? 'linear-gradient(90deg, #dc2626, #ef4444)' : 'transparent', transition: 'background 0.4s ease', borderRadius: '20px 20px 0 0' }} />
                </div>

                <div className="quiz-mobile-silhouette">
                    {isLoading ? (
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <circle cx="24" cy="24" r="18" stroke="#e5e7eb" strokeWidth="4" />
                            <path d="M24 6 a18 18 0 0 1 18 18" stroke="#c0392b" strokeWidth="4" strokeLinecap="round">
                                <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="0.7s" repeatCount="indefinite" />
                            </path>
                        </svg>
                    ) : (
                        <QuizCanvas spriteUrl={spriteUrl} isHidden={isHidden} isVisible={!!spriteUrl} />
                    )}
                    {hasAnswered && correctPokemonName && (
                        <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: '#1a202c' }}>
                            {capitalize(correctPokemonName)}
                        </div>
                    )}
                    <div className="quiz-mobile-answer-bar" style={{ background: selectedOption === correctPokemonName ? 'linear-gradient(90deg, #16a34a, #22c55e)' : hasAnswered ? 'linear-gradient(90deg, #dc2626, #ef4444)' : 'transparent' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: '#1a202c', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                                Who&apos;s That<br />Pokémon?
                            </div>
                            <div style={{ fontSize: 13, color: '#718096', marginTop: 6 }}>
                                {genLabel} · Guess the silhouette
                            </div>
                            {user ? (
                                <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>✦ Correct answers earn XP</div>
                            ) : (
                                <div style={{ fontSize: 12, marginTop: 4 }}>
                                    <Link href="/signin" style={{ color: '#c0392b', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                                    <span style={{ color: '#718096' }}> to earn XP</span>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {score.total > 0 && (
                                <div style={{ background: '#1a202c', borderRadius: 10, padding: '6px 14px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1 }}>{score.correct}/{score.total}</div>
                                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, letterSpacing: '0.06em' }}>SCORE</div>
                                </div>
                            )}
                            <button
                                onClick={() => setAudioEnabled(v => !v)}
                                title={audioEnabled ? 'Mute audio' : 'Enable audio'}
                                style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #e2e8f0', background: audioEnabled ? '#1a202c' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0 }}
                            >
                                {audioEnabled ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                        <line x1="23" y1="9" x2="17" y2="15" />
                                        <line x1="17" y1="9" x2="23" y2="15" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: 8 }}>GENERATION</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {ALL_GENS.map(gen => {
                                const active = selectedGens.includes(gen);
                                return (
                                    <button
                                        key={gen}
                                        onClick={() => toggleGen(gen)}
                                        style={{ padding: '6px 14px', borderRadius: 8, border: active ? '1.5px solid #1a202c' : '1.5px solid #e2e8f0', background: active ? '#1a202c' : 'white', color: active ? 'white' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit' }}
                                    >
                                        {gen}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {answerOptions.length > 0 ? answerOptions.map(optionName => {
                            const isSelected = selectedOption === optionName;
                            const isCorrect = optionName === correctPokemonName;
                            const state: OptionState = !hasAnswered ? 'idle' : isCorrect ? 'correct' : isSelected ? 'wrong' : 'idle';
                            return (
                                <OptionButton
                                    key={optionName}
                                    name={optionName}
                                    state={state}
                                    isSelected={isSelected}
                                    hasAnswered={hasAnswered}
                                    onSelect={() => handleOptionSelect(optionName)}
                                />
                            );
                        }) : (
                            <div style={{ gridColumn: '1/-1', height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isIdle && <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Press Generate to start</p>}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={generateRandomPokemon}
                        disabled={isButtonDisabled}
                        style={{ width: '100%', padding: '15px', background: isButtonDisabled ? '#f1f5f9' : '#c0392b', color: isButtonDisabled ? '#94a3b8' : 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: isButtonDisabled ? 'not-allowed' : 'pointer', letterSpacing: '0.01em', transition: 'background 0.2s ease', fontFamily: 'inherit' }}
                        onMouseEnter={e => { if (!isButtonDisabled) (e.currentTarget as HTMLButtonElement).style.background = '#a93226'; }}
                        onMouseLeave={e => { if (!isButtonDisabled) (e.currentTarget as HTMLButtonElement).style.background = '#c0392b'; }}
                    >
                        {hasAnswered ? (isCoolingDown ? 'Wait...' : '→ Next Pokémon') : isLoading ? 'Loading...' : 'Generate'}
                    </button>
                </div>
            </div>

            <audio ref={audioRef}>
                <source src="/quiz.ogg" type="audio/ogg" />
            </audio>
        </div>
    );
};