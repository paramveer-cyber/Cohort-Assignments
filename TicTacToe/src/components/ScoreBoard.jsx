import styles from './ScoreBoard.module.css';

export function ScoreBoard({ turn, result, scores }) {
  const winner = result?.type === 'win' ? result.winner : null;

  function blockClass(player) {
    if (winner === player) return `${styles.block} ${styles.winner}`;
    if (!result && turn === player) return `${styles.block} ${styles.active}`;
    return styles.block;
  }

  return (
    <div className={styles.wrap}>
      {['X', 'O'].map((p) => (
        <div key={p} className={blockClass(p)}>
          <span className={styles.label}>Player</span>
          <span className={styles.symbol}>{p}</span>
          <span className={styles.score}>{scores[p]}</span>
        </div>
      ))}
    </div>
  );
}
