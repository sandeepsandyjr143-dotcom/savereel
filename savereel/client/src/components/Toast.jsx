import styles from './Toast.module.css';

const TYPE_COLOURS = {
  success: '#12B76A',
  error:   '#F04438',
  info:    '#6172F3',
  warn:    '#F79009',
};

export default function Toast({ message, type = 'info', onClose }) {
  const colour = TYPE_COLOURS[type] || TYPE_COLOURS.info;

  return (
    <div
      className={styles.toast}
      role="alert"
      aria-live="polite"
      style={{ borderColor: `${colour}33` }}
    >
      <span className={styles.dot} style={{ background: colour }} aria-hidden="true" />
      <span className={styles.message}>{message}</span>
      <button
        onClick={onClose}
        className={styles.close}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}
