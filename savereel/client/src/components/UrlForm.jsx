import Spinner from './Spinner';
import ErrorBanner from './ErrorBanner';
import styles from './UrlForm.module.css';

export default function UrlForm({
  url,
  platform,
  loading,
  error,
  inputRef,
  onUrlChange,
  onFetch,
  onPaste,
  onReset,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) onFetch();
  };

  return (
    <div className={styles.card}>
      <div className={styles.inputRow}>
        <div className={styles.inputWrap}>
          <svg
            className={styles.linkIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>

          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste YouTube or Instagram URL here..."
            autoComplete="off"
            spellCheck="false"
            aria-label="Video URL"
            className={styles.input}
            disabled={loading}
          />

          {url && !loading && (
            <button
              onClick={onReset}
              className={styles.clearBtn}
              aria-label="Clear URL"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={url ? onFetch : onPaste}
          disabled={loading}
          className={`${styles.fetchBtn} ${loading ? styles.fetchBtnLoading : ''}`}
          aria-label={
            loading
              ? 'Fetching video info'
              : url
              ? 'Fetch video info'
              : 'Paste URL from clipboard'
          }
          type="button"
        >
          {loading ? (
            <>
              <Spinner size={15} color="#fff" /> Fetching…
            </>
          ) : url ? (
            '→ Fetch'
          ) : (
            '⌘ Paste'
          )}
        </button>
      </div>

      <ErrorBanner message={error} onRetry={url ? onFetch : null} />
    </div>
  );
}