import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import styles from './Header.module.css';

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#features',     label: 'Features' },
  { href: '/#faq',          label: 'FAQ' },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <Link to="/" aria-label="SaveReel home" style={{ textDecoration: 'none' }}>
        <Logo />
      </Link>
      <nav aria-label="Main navigation">
        <ul className={styles.nav}>
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a href={href} className={styles.navLink}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
