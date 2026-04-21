const API_BASE = import.meta.env.VITE_API_URL || '';
const REQUEST_TIMEOUT_MS = 30000;

export async function fetchVideoInfo(url, platform) {
  const endpoint = platform === 'youtube' ? '/api/yt/info' : '/api/ig/info';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(
      `${API_BASE}${endpoint}?url=${encodeURIComponent(url)}`,
      { signal: controller.signal }
    );

    clearTimeout(timer);

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || `Request failed (${res.status})`);
    }

    return json.data;

  } catch (err) {
    clearTimeout(timer);

    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    throw new Error(err.message || 'Network error.');
  }
}

export function buildDownloadUrl(videoInfo, format, originalUrl) {
  if (videoInfo.platform === 'youtube') {
    return (
      `${API_BASE}/api/yt/download` +
      `?url=${encodeURIComponent(originalUrl)}` +
      `&itag=${encodeURIComponent(format.itag)}` +
      `&title=${encodeURIComponent(videoInfo.title)}`
    );
  }

  return (
    `${API_BASE}/api/ig/download` +
    `?url=${encodeURIComponent(originalUrl)}` +
    `&title=${encodeURIComponent(videoInfo.title)}`
  );
}

export async function checkDownloadUrl(url) {
  try {
    return true;
  } catch {
    throw new Error('Download failed. Please try again.');
  }
}