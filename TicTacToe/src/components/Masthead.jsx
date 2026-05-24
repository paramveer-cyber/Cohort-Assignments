import styles from './Masthead.module.css';

export function Masthead() {
  return (
    <header className={styles.masthead}>
      <div className={styles.title}>Tic — Tac — Toe</div>
      <div className={styles.sub}>Two Player</div>
    </header>
  );
}
