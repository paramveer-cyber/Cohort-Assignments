import styles from './Cell.module.css';

export function Cell({ value, index, isWin, onClick }) {
  return (
    <button
      className={[
        styles.cell,
        value ? styles.taken : '',
        isWin ? styles.win : '',
        value === 'X' ? styles.x : '',
        value === 'O' ? styles.o : '',
      ].join(' ')}
      onClick={() => onClick(index)}
      aria-label={value ? `${value} at cell ${index + 1}` : `Empty cell ${index + 1}`}
      disabled={!!value}
    >
      {value && <span className={styles.mark}>{value}</span>}
    </button>
  );
}
