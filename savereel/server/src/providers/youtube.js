'use strict';

const { spawn } = require('child_process');
const { ProviderError } = require('../utils/errors');

function runYtDlp(args = []) {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === 'win32' ? 'python' : 'python3';
    const child = spawn(cmd, ['-m', 'yt_dlp', ...args]);

    let out = '';
    let err = '';

    child.stdout.on('data', d => out += d.toString());
    child.stderr.on('data', d => err += d.toString());

    child.on('close', code => {
      if (code === 0) resolve(out);
      else reject(new ProviderError(err || 'yt-dlp failed'));
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

async function getInfo(url) {
  const raw = await runYtDlp(['-J', '--no-playlist', url]);
  const data = JSON.parse(raw);

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

  formats = [...formats, ...audio];

  return {
    platform: 'youtube',
    title: data.title || 'YouTube Video',
    thumbnail: data.thumbnail || '',
    duration: data.duration || 0,
    channel: data.uploader || '',
    views: data.view_count || 0,
    formats
  };
}

async function getFormat(url, itag) {
  const info = await getInfo(url);
  return info.formats[Number(itag)];
}

function createStream(url, format) {
  const cmd = process.platform === 'win32' ? 'python' : 'python3';

  const child = spawn(cmd, [
    '-m',
    'yt_dlp',
    '--no-part',
    '--no-playlist',
    '-f',
    format.format_id,
    '-o',
    '-',
    url
  ], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stderr.on('data', () => {});

  return child.stdout;
}

module.exports = {
  getInfo,
  getFormat,
  createStream
};