import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo size="sm" />
          <p className={styles.tagline}>Fast, free video downloads.<br />No watermarks. No login. Ever.</p>
        </div>

        <nav className={styles.links} aria-label="Footer navigation">
          <div className={styles.col}>
            <p className={styles.colTitle}>Product</p>
            <a href="/#how-it-works">How it works</a>
            <a href="/#features">Features</a>
            <a href="/#faq">FAQ</a>
          </div>
          <div className={styles.col}>
            <p className={styles.colTitle}>Legal</p>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/dmca">DMCA Notice</Link>
          </div>
        </nav>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} SaveReel. Personal use only. We do not store your videos.</p>
      </div>
    </footer>
  );
}
