import styles from './LegalPage.module.css';

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.updated}>Last updated: April 2026</p>

        <section className={styles.section}>
          <h2>1. Acceptance of Terms</h2>
          <p>By using SaveReel ("Service"), you agree to these Terms of Service. If you do not agree, please do not use the Service.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Permitted Use</h2>
          <p>SaveReel is provided solely for <strong>personal, non-commercial use</strong>. You may use this Service to download publicly available videos for your own viewing, archiving, or offline access.</p>
          <p>You agree not to:</p>
          <ul>
            <li>Re-upload, redistribute, or publicly share downloaded content you do not own</li>
            <li>Use downloaded content for commercial purposes without the rights holder's permission</li>
            <li>Attempt to circumvent platform security, access private content, or abuse this Service</li>
            <li>Use automated scripts or bots to make bulk requests to the Service</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Copyright & Intellectual Property</h2>
          <p>SaveReel does not host, store, or claim ownership of any downloaded content. All downloaded content remains the intellectual property of its respective creators and platforms. You are solely responsible for ensuring your use of downloaded content complies with applicable copyright law.</p>
          <p>We comply with the Digital Millennium Copyright Act (DMCA). If you believe content accessible via our Service infringes your copyright, please see our <a href="/dmca">DMCA Notice</a>.</p>
        </section>

        <section className={styles.section}>
          <h2>4. Disclaimer of Warranties</h2>
          <p>The Service is provided "as is" without warranties of any kind. Platform providers (YouTube, Instagram) frequently change their APIs and infrastructure. We cannot guarantee uninterrupted or error-free service. We are not liable for any loss of data, failed downloads, or service interruptions.</p>
        </section>

        <section className={styles.section}>
          <h2>5. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, SaveReel and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>
        </section>

        <section className={styles.section}>
          <h2>6. Modifications</h2>
          <p>We reserve the right to modify or discontinue the Service at any time. We may update these Terms; continued use after changes constitutes acceptance of the new Terms.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Governing Law</h2>
          <p>These Terms shall be governed by applicable law in the jurisdiction where SaveReel operates, without regard to conflict of law principles.</p>
        </section>

        <section className={styles.section}>
          <h2>8. Contact</h2>
          <p>Questions about these Terms? Contact us at <a href="mailto:legal@savereel.app">legal@savereel.app</a>.</p>
        </section>
      </div>
    </div>
  );
}
