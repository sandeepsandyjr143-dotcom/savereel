/**
 * Detects which supported platform a URL belongs to.
 * @param {string} url
 * @returns {'youtube' | 'instagram' | null}
 */
export function detectPlatform(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  return null;
}
