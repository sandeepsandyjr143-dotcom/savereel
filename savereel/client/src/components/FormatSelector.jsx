import styles from './FormatSelector.module.css';

export default function FormatSelector({ formats, selectedFmt, onSelect }) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>Select Quality</p>
      <div className={styles.list} role="radiogroup" aria-label="Download quality">
        {formats.map((fmt) => {
          const isSelected = selectedFmt?.itag === fmt.itag;
          return (
            <label
              key={fmt.itag}
              className={`${styles.option} ${isSelected ? styles.selected : ''}`}
            >
              <input
                type="radio"
                name="format"
                checked={isSelected}
                onChange={() => onSelect(fmt)}
                className={styles.radio}
                aria-label={fmt.label}
              />
              <span className={styles.optionLabel}>{fmt.label}</span>
              {fmt.best && (
                <span className={styles.bestBadge}>Best</span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
