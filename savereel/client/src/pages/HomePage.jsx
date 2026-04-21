import { useDownloader } from '../hooks/useDownloader.js';
import UrlForm from '../components/UrlForm.jsx';
import ResultCard, { ResultSkeleton } from '../components/ResultCard.jsx';
import FAQItem from '../components/FAQItem.jsx';
import styles from './HomePage.module.css';

const FEATURES = [
  { icon: '⚡', title: 'Instant Fetch', desc: 'Paste any YouTube or Instagram link and get download options in seconds.' },
  { icon: '🎬', title: 'HD Quality', desc: 'Download in up to 1080p HD. Choose your preferred resolution or audio-only.' },
  { icon: '🔒', title: 'Zero Storage', desc: 'We never store your videos or URLs. Everything is streamed directly to you.' },
  { icon: '📱', title: 'Mobile Ready', desc: 'Works perfectly on any device iPhone, Android, tablet, or desktop.' },
  { icon: '🚫', title: 'No Watermarks', desc: 'Clean downloads, no branding added. Your file, exactly as uploaded.' },
  { icon: '♾️', title: 'Always Free', desc: 'No account needed, no credit card, no daily limits. Free forever.' },
];

const FAQS = [
  { q: 'Is SaveReel free to use?', a: 'Yes, completely free. No account, no subscription, no hidden fees ever.' },
  { q: 'Can I download private Instagram posts?', a: 'No. SaveReel can only download public posts and reels. Private content requires login and we never ask for your credentials.' },
  { q: 'Why is my Instagram download failing?', a: 'Instagram frequently updates their servers. If a download fails, try again in a moment. If it keeps failing, the post may have been set to private.' },
  { q: 'What YouTube formats are available?', a: 'We offer all available MP4 video formats plus MP3 audio-only options for every video.' },
  { q: 'Does SaveReel work on iPhone?', a: 'Yes. Paste the URL, tap Download, and save to Files or Photos. You may need to use the Share sheet on Safari.' },
  { q: 'Is it legal to download videos?', a: 'Downloading for personal use may be allowed in some places. Re-uploading, distributing, or monetising content you do not own is not. Please review our Terms of Service.' },
];

export default function HomePage({ showToast }) {
  const {
    state,
    inputRef,
    resultRef,
    handleFetch,
    handleDownload,
    handlePaste,
    reset,
    setUrl,
    setFormat,
  } = useDownloader(showToast);

  const { url, platform, loading, result, selectedFmt, downloading, error } = state;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.badge}>YouTube + Instagram Downloader</div>

          <h1 className={styles.headline}>
            Save Any Video,<br />
            <span className={styles.accent}>Instantly Free</span>
          </h1>

          <p className={styles.sub}>
            Paste a YouTube or Instagram link below. Pick your quality. Download in seconds.
            No watermarks, no login, no nonsense.
          </p>

          <div className={styles.formWrap}>
            <UrlForm
              url={url}
              platform={platform}
              loading={loading}
              error={error}
              inputRef={inputRef}
              onUrlChange={setUrl}
              onFetch={handleFetch}
              onPaste={handlePaste}
              onReset={reset}
            />

            {loading && <ResultSkeleton />}

            {!loading && result && (
              <ResultCard
                videoInfo={result}
                selectedFmt={selectedFmt}
                downloading={downloading}
                resultRef={resultRef}
                onSelectFormat={setFormat}
                onDownload={handleDownload}
              />
            )}
          </div>

          <p className={styles.supportedNote}>
            Supports <strong>youtube.com/watch</strong> · <strong>youtu.be</strong> ·{' '}
            <strong>youtube.com/shorts</strong> · <strong>instagram.com/reel</strong> ·{' '}
            <strong>instagram.com/p</strong>
          </p>
        </div>
      </section>

      <section id="how-it-works" className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>How It Works</h2>

          <div className={styles.steps}>
            {[
              {
                n: '1',
                t: 'Copy the link',
                d: 'Go to YouTube or Instagram and copy the video or reel URL from your browser or app.',
              },
              {
                n: '2',
                t: 'Paste and fetch',
                d: 'Paste the URL into SaveReel and hit Fetch. We will pull all available formats instantly.',
              },
              {
                n: '3',
                t: 'Choose and download',
                d: 'Pick your quality 1080p, 720p, or audio-only and tap Download. Done.',
              },
            ].map(({ n, t, d }) => (
              <div key={n} className={styles.step}>
                <div className={styles.stepNum}>{n}</div>
                <h3 className={styles.stepTitle}>{t}</h3>
                <p className={styles.stepDesc}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Why SaveReel</h2>

          <div className={styles.features}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className={styles.feature}>
                <span className={styles.featureIcon}>{icon}</span>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>

          <div className={styles.faqList}>
            {FAQS.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}