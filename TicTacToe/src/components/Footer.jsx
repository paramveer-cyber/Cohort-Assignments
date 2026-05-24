import styles from './Footer.module.css';

export function Footer({ turn, result, onResetAll }) {
  const turnNote = result ? '' : `${turn} to move`;

  return (
    <footer className={styles.footer}>
      <span className={styles.note}>International Grid Standard</span>
      <div className={styles.right}>
        {turnNote && <span className={styles.note}>{turnNote}</span>}
        <button className={styles.resetAll} onClick={onResetAll}>Reset All</button>
      </div>
    </footer>
  );
}
