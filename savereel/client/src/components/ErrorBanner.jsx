import styles from './ErrorBanner.module.css';

export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className={styles.banner} role="alert" aria-live="assertive">
      <span className={styles.icon} aria-hidden="true">⚠️</span>
      <span className={styles.message}>{message}</span>
      {onRetry && (
        <button className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
