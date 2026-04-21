'use strict';

const { ValidationError, UnsupportedError } = require('../utils/errors');

// Covers youtube.com/watch, youtube.com/shorts, youtu.be short links
const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w\-]{6,}/;

// Covers /p/, /reel/, /tv/  — reels and video posts
const IG_REGEX =
  /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv)\/[\w\-]+/;

// Instagram CDN domains that are safe to proxy
const IG_CDN_HOSTS = ['cdninstagram.com', 'fbcdn.net', 'instagram.foty1-1.fna.fbcdn.net'];

/**
 * Validate and normalise a YouTube URL.
 * @param {unknown} url
 * @returns {string}
 */
function validateYouTubeUrl(url) {
  assertUrlParam(url);
  if (!YT_REGEX.test(url)) {
    throw new UnsupportedError(
      'Invalid YouTube URL. Must be a youtube.com/watch, youtube.com/shorts, or youtu.be link.',
    );
  }
  return url;
}

/**
 * Validate and normalise an Instagram URL.
 * @param {unknown} url
 * @returns {string}
 */
function validateInstagramUrl(url) {
  assertUrlParam(url);
  if (!IG_REGEX.test(url)) {
    throw new UnsupportedError(
      'Invalid Instagram URL. Must be an instagram.com/p/, /reel/, or /tv/ link.',
    );
  }
  return url;
}

/**
 * Validate a YouTube format itag.
 * @param {unknown} itag
 * @returns {string}
 */
function validateItag(itag) {
  if (!itag || typeof itag !== 'string') throw new ValidationError('Format itag is required.');
  if (!/^\d{1,6}$/.test(itag)) throw new ValidationError('Invalid format itag.');
  return itag;
}

/**
 * Validate an Instagram CDN media URL.
 * Only allows known Instagram/Facebook CDN hosts to prevent SSRF.
 * @param {unknown} mediaUrl
 * @returns {string}
 */
function validateMediaUrl(mediaUrl) {
  if (!mediaUrl || typeof mediaUrl !== 'string') {
    throw new ValidationError('mediaUrl is required.');
  }

  let decoded;
  try {
    decoded = decodeURIComponent(mediaUrl);
  } catch {
    throw new ValidationError('mediaUrl is malformed.');
  }

  let parsed;
  try {
    parsed = new URL(decoded);
  } catch {
    throw new ValidationError('mediaUrl is not a valid URL.');
  }

  const isAllowed = IG_CDN_HOSTS.some((host) => parsed.hostname.endsWith(host));
  if (!isAllowed) {
    throw new ValidationError('mediaUrl must point to an Instagram CDN host.');
  }

  return decoded;
}

// ─── Internal ──────────────────────────────────────────────────────────────────

function assertUrlParam(url) {
  if (!url || typeof url !== 'string') throw new ValidationError('URL is required.');
  const clean = url.trim();
  if (clean.length === 0)    throw new ValidationError('URL cannot be empty.');
  if (clean.length > 500)    throw new ValidationError('URL is too long (max 500 chars).');
  // Mutate the original — callers receive the trimmed string via return
  return clean;
}

module.exports = {
  validateYouTubeUrl,
  validateInstagramUrl,
  validateItag,
  validateMediaUrl,
};
