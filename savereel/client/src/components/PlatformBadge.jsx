import styles from './PlatformBadge.module.css';

export default function PlatformBadge({ platform }) {
  if (!platform) return null;
  const isYT = platform === 'youtube';
  return (
    <span className={`${styles.badge} ${isYT ? styles.youtube : styles.instagram}`}>
      {isYT ? '▶ YouTube' : '◎ Instagram'}
    </span>
  );
}
