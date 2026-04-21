import styles from './LegalPage.module.css';

export default function DmcaPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>DMCA Notice</h1>
        <p className={styles.updated}>Last updated: April 2026</p>

        <section className={styles.section}>
          <h2>Overview</h2>
          <p>SaveReel respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). SaveReel does <strong>not</strong> host or store any video content — we provide a download proxy for publicly accessible content on third-party platforms.</p>
          <p>If you believe that content accessible through our Service infringes your copyright, you may submit a DMCA takedown notice as described below.</p>
        </section>

        <section className={styles.section}>
          <h2>Filing a DMCA Notice</h2>
          <p>Your notice must include all of the following:</p>
          <ul>
            <li>Your full legal name and contact information (email, address, phone)</li>
            <li>A description of the copyrighted work you claim has been infringed</li>
            <li>The specific URL on the third-party platform (YouTube/Instagram) that contains the allegedly infringing content</li>
            <li>A statement that you have a good faith belief that the use is not authorised by the copyright owner, its agent, or the law</li>
            <li>A statement under penalty of perjury that the information is accurate and that you are the copyright owner or authorised to act on their behalf</li>
            <li>Your physical or electronic signature</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Where to Send</h2>
          <p>Send DMCA notices by email to: <a href="mailto:dmca@savereel.app">dmca@savereel.app</a></p>
          <p>We will review all valid notices and respond within 72 hours.</p>
        </section>

        <section className={styles.section}>
          <h2>Counter-Notice</h2>
          <p>If you believe content was removed in error, you may file a counter-notice. Counter-notices must comply with 17 U.S.C. § 512(g)(3) and should be sent to the same email address above.</p>
        </section>

        <section className={styles.section}>
          <h2>Note on Third-Party Platforms</h2>
          <p>SaveReel only facilitates access to content that is publicly available on YouTube and Instagram. For content removal from those platforms directly, please contact them via their own DMCA processes:</p>
          <ul>
            <li><a href="https://support.google.com/youtube/answer/2807622" target="_blank" rel="noopener noreferrer">YouTube Copyright Takedown</a></li>
            <li><a href="https://help.instagram.com/contact/372592039493026" target="_blank" rel="noopener noreferrer">Instagram Copyright Report</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
