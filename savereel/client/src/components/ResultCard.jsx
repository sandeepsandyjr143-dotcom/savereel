import { memo, useState } from 'react';
import PlatformBadge from './PlatformBadge';
import FormatSelector from './FormatSelector';
import Skeleton from './Skeleton';
import Spinner from './Spinner';
import styles from './ResultCard.module.css';
import { formatDuration, formatViews } from '../utils/formatters';

export function ResultSkeleton() {
  return (
    <div className={styles.skeletonWrap}>
      <div className={styles.skeletonRow}>
        <Skeleton width={128} height={80} borderRadius={10} />
        <div className={styles.skeletonMeta}>
          <Skeleton width="55%" height={12} />
          <Skeleton width="88%" height={16} />
          <Skeleton width="65%" height={15} />
          <Skeleton width="38%" height={11} />
        </div>
      </div>

      <div className={styles.skeletonFormats}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={46} borderRadius={11} />
        ))}
      </div>
    </div>
  );
}

const ResultCard = memo(function ResultCard({
  videoInfo,
  selectedFmt,
  downloading,
  resultRef,
  onSelectFormat,
  onDownload,
}) {
  const [imgError, setImgError] = useState(false);

  const showThumb =
    videoInfo?.thumbnail &&
    videoInfo.thumbnail.trim() !== '' &&
    !imgError;

  return (
    <div ref={resultRef} className={styles.wrapper}>
      {/* Top Info */}
      <div className={styles.infoRow}>
        {showThumb ? (
          <div className={styles.thumbnail}>
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className={styles.thumbImg}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className={styles.noThumb}>
            No Thumbnail
          </div>
        )}

        <div className={styles.meta}>
          <div className={styles.badgeRow}>
            <PlatformBadge platform={videoInfo.platform} />
          </div>

          <p className={styles.title}>{videoInfo.title}</p>

          <div className={styles.stats}>
            {videoInfo.duration > 0 && (
              <span className={styles.stat}>
                ⏱ {formatDuration(videoInfo.duration)}
              </span>
            )}

            {videoInfo.channel && (
              <span className={styles.stat}>
                👤 {videoInfo.channel}
              </span>
            )}

            {videoInfo.views > 0 && (
              <span className={styles.stat}>
                👁 {formatViews(videoInfo.views)} views
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quality Selector */}
      <FormatSelector
        formats={videoInfo.formats}
        selectedFmt={selectedFmt}
        onSelect={onSelectFormat}
      />

      {/* Download Button */}
      <button
        onClick={onDownload}
        disabled={downloading || !selectedFmt}
        className={`${styles.dlBtn} ${
          downloading ? styles.dlBtnLoading : ''
        }`}
        aria-label={
          downloading ? 'Starting download' : 'Download now'
        }
      >
        {downloading ? (
          <>
            <Spinner size={16} color="#fff" /> Starting download...
          </>
        ) : (
          '⬇ Download Now'
        )}
      </button>

      <p className={styles.disclaimer}>
        Personal use only · SaveReel never stores your videos
      </p>
    </div>
  );
});

export default ResultCard;