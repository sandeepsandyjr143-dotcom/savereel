import styles from './Logo.module.css';

export default function Logo({ size = 'md' }) {
  const px = size === 'sm' ? 30 : 38;
  const fontSize = size === 'sm' ? '19px' : '23px';

  return (
    <div className={styles.wrapper}>
      <svg width={px} height={px} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#FF3A3A" />
            <stop offset="55%"  stopColor="#E5254C" />
            <stop offset="100%" stopColor="#BF2882" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#logo-grad)" />
        {/* YouTube play triangle */}
        <path d="M10 18 L10 30 L21 24 Z" fill="white" opacity="0.92" />
        {/* Instagram camera ring */}
        <circle cx="45" cy="22" r="8" stroke="white" strokeWidth="2.8" fill="none" opacity="0.92" />
        <circle cx="45" cy="22" r="3" fill="white" opacity="0.92" />
        <circle cx="51" cy="15" r="1.5" fill="white" opacity="0.92" />
        {/* Divider */}
        <line x1="32" y1="12" x2="32" y2="34" stroke="white" strokeWidth="1.2" opacity="0.25" />
        {/* Download arrows */}
        <path d="M18 42 L18 52" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M13 47 L18 53 L23 47" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 42 L32 52" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M27 47 L32 53 L37 47" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M46 42 L46 52" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M41 47 L46 53 L51 47" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={styles.text} style={{ fontSize }} aria-label="SaveReel">
        SaveReel
      </span>
    </div>
  );
}
