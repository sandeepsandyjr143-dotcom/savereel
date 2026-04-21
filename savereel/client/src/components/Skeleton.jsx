import styles from './Skeleton.module.css';

export default function Skeleton({ width = '100%', height = 14, borderRadius = 8 }) {
  return (
    <div
      className={styles.skeleton}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}
