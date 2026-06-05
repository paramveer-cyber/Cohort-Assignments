'use client';
import { capitalize } from '@/lib/utils';

type AnswerState = 'idle' | 'correct' | 'wrong';

function optionBackground(state: AnswerState, isSelected: boolean) {
    if (state === 'correct') return '#dcfce7';
    if (state === 'wrong' && isSelected) return '#fee2e2';
    return 'white';
}

function optionBorder(state: AnswerState, isSelected: boolean) {
    if (state === 'correct') return '2px solid #16a34a';
    if (state === 'wrong' && isSelected) return '2px solid #dc2626';
    return '2px solid #e2e8f0';
}

function optionTextColor(state: AnswerState, isSelected: boolean) {
    if (state === 'correct') return '#15803d';
    if (state === 'wrong' && isSelected) return '#dc2626';
    return '#1a202c';
}

function ResultIcon({ state }: { state: AnswerState }) {
    if (state === 'correct') return <span style={{ fontSize: 18 }}>✓</span>;
    if (state === 'wrong') return <span style={{ fontSize: 18 }}>✗</span>;
    return null;
}

export default function QuizOptions({
    options,
    selectedOption,
    correctAnswer,
    hasAnswered,
    onSelect,
}: {
    options: string[];
    selectedOption: string | null;
    correctAnswer: string;
    hasAnswered: boolean;
    onSelect: (name: string) => void;
}) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            width: '100%',
        }}>
            {options.map((optionName) => {
                const isSelected = selectedOption === optionName;
                const isCorrect = optionName === correctAnswer;
                const state: AnswerState = !hasAnswered
                    ? 'idle'
                    : isCorrect
                        ? 'correct'
                        : isSelected
                            ? 'wrong'
                            : 'idle';

                return (
                    <button
                        key={optionName}
                        onClick={() => !hasAnswered && onSelect(optionName)}
                        disabled={hasAnswered}
                        style={{
                            background: optionBackground(state, isSelected),
                            border: optionBorder(state, isSelected),
                            borderRadius: 12,
                            padding: '14px 16px',
                            cursor: hasAnswered ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => {
                            if (!hasAnswered) {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#94a3b8';
                                (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!hasAnswered) {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
                                (e.currentTarget as HTMLButtonElement).style.background = 'white';
                            }
                        }}
                    >
                        <span style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: optionTextColor(state, isSelected),
                            textAlign: 'left',
                        }}>
                            {capitalize(optionName)}
                        </span>
                        <ResultIcon state={state} />
                    </button>
                );
            })}
        </div>
    );
}