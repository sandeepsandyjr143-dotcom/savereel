import styles from './Spinner.module.css';

export default function Spinner({ size = 15, color = '#fff' }) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size, borderTopColor: color, borderColor: `${color}30`, borderTopColor: color }}
      role="status"
      aria-label="Loading"
    />
  );
}
