import styles from './ResultBar.module.css';

export function ResultBar({ result, onReset }) {
  if (!result) return null;

  const msg = result.type === 'win' ? `${result.winner} wins` : 'draw';
  const isDraw = result.type === 'draw';

  return (
    <div className={`${styles.bar} ${isDraw ? styles.draw : ''}`}>
      <span className={styles.msg}>{msg}</span>
      <button className={styles.btn} onClick={onReset}>New Game</button>
    </div>
  );
}
