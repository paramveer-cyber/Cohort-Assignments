import { useGameLogic } from '../hooks/useGameLogic';
import { Masthead } from '../components/Masthead';
import { ScoreBoard } from '../components/ScoreBoard';
import { Board } from '../components/Board';
import { ResultBar } from '../components/ResultBar';
import { Footer } from '../components/Footer';
import styles from './GamePage.module.css';

export function GamePage() {
  const { board, turn, result, winLine, scores, play, reset, resetAll } = useGameLogic();

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <Masthead />
        <ScoreBoard turn={turn} result={result} scores={scores} />
        <Board board={board} winLine={winLine} onPlay={play} />
        <ResultBar result={result} onReset={reset} />
        <Footer turn={turn} result={result} onResetAll={resetAll} />
      </div>
    </main>
  );
}
