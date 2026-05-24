import { Cell } from './Cell';
import styles from './Board.module.css';

export function Board({ board, winLine, onPlay }) {
  return (
    <div className={styles.board} role="grid" aria-label="Tic Tac Toe board">
      {board.map((value, i) => (
        <Cell
          key={i}
          index={i}
          value={value}
          isWin={winLine.includes(i)}
          onClick={onPlay}
        />
      ))}
    </div>
  );
}
