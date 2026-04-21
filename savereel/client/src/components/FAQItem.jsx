import { useState } from 'react';
import styles from './FAQItem.module.css';

export default function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const id = `faq-${q.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`${styles.item} ${open ? styles.open : ''}`}>
      <button
        className={styles.question}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
      >
        <span>{q}</span>
        <span className={`${styles.chevron} ${open ? styles.rotated : ''}`} aria-hidden="true">▾</span>
      </button>
      {open && (
        <p id={id} className={styles.answer}>
          {a}
        </p>
      )}
    </div>
  );
}
