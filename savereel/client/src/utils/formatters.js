/**
 * Pure formatting helpers — no side effects, easily unit-testable.
 */

/**
 * Formats a duration in seconds to HH:MM:SS or MM:SS
 * @param {number|null} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '';
  const h   = Math.floor(seconds / 3600);
  const m   = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(sec)}`;
  }
  return `${m}:${pad(sec)}`;
}

/**
 * Formats a large number to human-readable form (1.2M, 450K, etc.)
 * @param {number|null} n
 * @returns {string}
 */
export function formatViews(n) {
  if (!n || n <= 0) return '';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function pad(n) {
  return String(n).padStart(2, '0');
}
