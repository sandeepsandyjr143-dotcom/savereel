'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ProviderError } = require('../utils/errors');

function getPythonCmd() {
  return process.platform === 'win32' ? 'python' : 'python3';
}

function getCookieArgs() {
  const cookiePath = path.join(__dirname, '../../cookies.txt');

  if (fs.existsSync(cookiePath)) {
    return ['--cookies', cookiePath];
  }

  return [];
}

function baseArgs() {
  return [
    ...getCookieArgs(),
    '--no-playlist',
    '--no-warnings',
    '--extractor-args',
    'youtube:player_client=android',
    '--user-agent',
    'com.google.android.youtube/19.09.37 (Linux; U; Android 11)',
    '--socket-timeout',
    '15'
  ];
}

function runYtDlp(args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      getPythonCmd(),
      ['-m', 'yt_dlp', ...baseArgs(), ...args],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    let out = '';
    let err = '';

    child.stdout.on('data', d => (out += d.toString()));
    child.stderr.on('data', d => (err += d.toString()));

    child.on('error', e => {
      reject(new ProviderError(e.message || 'yt-dlp start failed'));
    });

    child.on('close', code => {
      if (code === 0) return resolve(out);

      reject(
        new ProviderError(
          err || 'YouTube blocked request. Try another video or retry in a moment.'
        )
      );
    });
  });
}

function nearestQuality(height) {
  const levels = [144, 240, 360, 480, 720, 1080, 1440, 2160];
  let best = levels[0];

  for (const q of levels) {
    if (Math.abs(q - height) < Math.abs(best - height)) {
      best = q;
    }
  }

  return best;
}

function normalizeFormats(data) {
  const used = new Set();

  let formats = (data.formats || [])
    .filter(f => f.height && f.vcodec !== 'none')
    .map(f => ({ ...f, cleanHeight: nearestQuality(f.height) }))
    .filter(f => {
      if (used.has(f.cleanHeight)) return false;
      used.add(f.cleanHeight);
      return true;
    })
    .sort((a, b) => b.cleanHeight - a.cleanHeight)
    .map((f, i) => ({
      itag: String(i),
      format_id: f.format_id,
      label: `MP4 - ${f.cleanHeight}p`,
      quality: `${f.cleanHeight}p`,
      type: 'video',
      best: i === 0
    }));

  const audio = (data.formats || [])
    .filter(f => f.vcodec === 'none' && f.acodec !== 'none')
    .slice(0, 1)
    .map((f, i) => ({
      itag: String(formats.length + i),
      format_id: f.format_id,
      label: 'MP3 - Audio',
      quality: 'audio',
      type: 'audio',
      best: false
    }));

  return [...formats, ...audio];
}

async function getInfo(url) {
  try {
    const raw = await runYtDlp(['-J', url]);
    const data = JSON.parse(raw);

    return {
      platform: 'youtube',
      title: data.title || 'YouTube Video',
      thumbnail: data.thumbnail || '',
      duration: data.duration || 0,
      channel: data.uploader || '',
      views: data.view_count || 0,
      formats: normalizeFormats(data)
    };
  } catch (err) {
    throw new ProviderError(
      err.message || 'Unable to fetch YouTube video right now.'
    );
  }
}

async function getFormat(url, itag) {
  const info = await getInfo(url);
  return info.formats[Number(itag)];
}

function createStream(url, format) {
  const child = spawn(
    getPythonCmd(),
    [
      '-m',
      'yt_dlp',
      ...baseArgs(),
      '--no-part',
      '-f',
      format.format_id,
      '-o',
      '-',
      url
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  child.stderr.on('data', () => {});

  return child.stdout;
}

module.exports = {
  getInfo,
  getFormat,
  createStream
};