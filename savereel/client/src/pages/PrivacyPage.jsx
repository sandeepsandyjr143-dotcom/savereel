import styles from './LegalPage.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: April 2026</p>

        <section className={styles.section}>
          <h2>1. Information We Collect</h2>
          <p>SaveReel does <strong>not</strong> collect any personal information. We do not require account creation, email addresses, or any form of identification to use this service.</p>
          <p>We process URLs you submit solely to retrieve publicly available video metadata and facilitate downloads. These URLs are not stored on our servers after the request completes.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Cookies & Tracking</h2>
          <p>SaveReel does not use tracking cookies, advertising cookies, or third-party analytics that collect personal data. We may collect anonymous, aggregated usage statistics (e.g. number of requests per platform) to improve the service. This data contains no personally identifiable information.</p>
        </section>

        <section className={styles.section}>
          <h2>3. Third-Party Services</h2>
          <p>When you download a video, the media stream originates from the platform's own CDN (YouTube or Instagram). Your request passes through SaveReel's servers as a proxy but the media content is not stored. Your IP address may be visible to those CDN providers as with any normal web request.</p>
        </section>

        <section className={styles.section}>
          <h2>4. Data Security</h2>
          <p>All connections to SaveReel are encrypted via HTTPS. We do not store video files, user history, or download logs beyond short-term server request logs (which contain no personal data and are purged regularly).</p>
        </section>

        <section className={styles.section}>
          <h2>5. Children's Privacy</h2>
          <p>SaveReel is not directed at children under 13. We do not knowingly collect any information from children.</p>
        </section>

        <section className={styles.section}>
          <h2>6. Changes to This Policy</h2>
          <p>We may update this Privacy Policy occasionally. Changes will be posted on this page with an updated date. Continued use of the service after changes constitutes acceptance.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Contact</h2>
          <p>Questions about this policy? Contact us at <a href="mailto:legal@savereel.app">legal@savereel.app</a>.</p>
        </section>
      </div>
    </div>
  );
}
