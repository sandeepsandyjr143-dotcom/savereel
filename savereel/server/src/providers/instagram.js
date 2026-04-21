'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { ProviderError } = require('../utils/errors');

const COOKIE_FILE = path.join(__dirname, '../../cookies.txt');

function runYtDlp(args = []) {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === 'win32' ? 'python' : 'python3';
    const finalArgs = ['-m', 'yt_dlp'];

    if (fs.existsSync(COOKIE_FILE)) {
      finalArgs.push('--cookies', COOKIE_FILE);
    }

    finalArgs.push(...args);

    const child = spawn(cmd, finalArgs);

    let out = '';
    let err = '';

    child.stdout.on('data', d => (out += d.toString()));
    child.stderr.on('data', d => (err += d.toString()));

    child.on('close', code => {
      if (code === 0) resolve(out);
      else reject(new ProviderError(err || 'yt-dlp failed'));
    });
  });
}

function isImage(url = '') {
  return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url);
}

function pickMedia(data) {
  if (!data) return '';

  if (data.video_url) return data.video_url;
  if (data.display_url) return data.display_url;
  if (data.url && !isImage(data.url)) return data.url;

  if (Array.isArray(data.formats)) {
    const bestVideo = data.formats.find(
      f => f.url && f.vcodec !== 'none'
    );
    if (bestVideo) return bestVideo.url;

    const any = data.formats.find(f => f.url);
    if (any) return any.url;
  }

  if (Array.isArray(data.entries)) {
    for (const item of data.entries) {
      const found = pickMedia(item);
      if (found) return found;
    }
  }

  if (Array.isArray(data.requested_downloads)) {
    for (const item of data.requested_downloads) {
      if (item.url) return item.url;
    }
  }

  return '';
}

function pickAudio(data) {
  if (!data) return '';

  if (Array.isArray(data.formats)) {
    const audio = data.formats.find(
      f => f.url && f.vcodec === 'none'
    );
    if (audio) return audio.url;
  }

  if (Array.isArray(data.entries)) {
    for (const item of data.entries) {
      const found = pickAudio(item);
      if (found) return found;
    }
  }

  return '';
}

function pickThumb(data) {
  if (!data) return '';

  if (data.thumbnail) return data.thumbnail;
  if (data.display_url) return data.display_url;
  if (data.thumbnail_src) return data.thumbnail_src;
  if (data.image) return data.image;
  if (data.cover_url) return data.cover_url;

  if (Array.isArray(data.thumbnails)) {
    const valid = data.thumbnails.filter(x => x?.url);
    if (valid.length) {
      return valid[valid.length - 1].url;
    }
  }

  if (Array.isArray(data.entries)) {
    for (const item of data.entries) {
      const found = pickThumb(item);
      if (found) return found;
    }
  }

  return '';
}

async function getInfo(url) {
  try {
    const raw = await runYtDlp([
      '-J',
      '--no-playlist',
      '--no-warnings',
      '--extractor-args',
      'instagram:api_version=v1',
      url
    ]);

    const data = JSON.parse(raw);

    let mediaUrl = pickMedia(data);
    const audioUrl = pickAudio(data);
    const thumbRaw = pickThumb(data);

    if (!mediaUrl && thumbRaw) {
      mediaUrl = thumbRaw;
    }

    if (!mediaUrl) {
      throw new ProviderError('No media found');
    }

    const isImg = isImage(mediaUrl);

    const thumbnail = thumbRaw
      ? `/api/ig/thumb?url=${encodeURIComponent(thumbRaw)}`
      : '';

    const formats = [
      {
        itag: isImg ? 'ig-image' : 'ig-video',
        format_id: isImg ? 'ig-image' : 'ig-video',
        label: isImg ? 'JPG - Image' : 'MP4 - Best Quality',
        quality: 'Best',
        type: isImg ? 'image' : 'video',
        best: true,
        directUrl: mediaUrl
      }
    ];

    if (audioUrl && !isImg) {
      formats.push({
        itag: 'ig-audio',
        format_id: 'ig-audio',
        label: 'MP3 - Audio',
        quality: 'Audio',
        type: 'audio',
        best: false,
        directUrl: audioUrl
      });
    }

    return {
      platform: 'instagram',
      title: data.title || `Instagram by ${data.uploader || 'User'}`,
      thumbnail,
      duration: data.duration || 0,
      channel: data.uploader || 'Instagram',
      views: 0,
      formats
    };
  } catch (err) {
    throw new ProviderError(
      err.message || 'Could not fetch Instagram media'
    );
  }
}

async function proxyStream(mediaUrl) {
  const response = await fetch(mediaUrl);

  if (!response.ok) {
    throw new ProviderError('Failed to download Instagram media');
  }

  return response;
}

module.exports = {
  getInfo,
  proxyStream
};