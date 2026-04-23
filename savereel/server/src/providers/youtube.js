'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ProviderError } = require('../utils/errors');

function cookieArgs() {
  const file = path.join(__dirname, '../../cookies.txt');
  return fs.existsSync(file) ? ['--cookies', file] : [];
}

function baseArgs() {
  return [
    '--extractor-args', 'youtube:player_client=android',
    '--no-check-certificates',
    '--no-check-formats',
    '--no-warnings',
    '--socket-timeout', '30',
    '--no-playlist',
  ];
}

function run(args = []) {
  return new Promise((resolve, reject) => {
    const allArgs = [
      ...baseArgs(),
      ...cookieArgs(),
      ...args
    ];

    const child = spawn('yt-dlp', allArgs, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let out = '';
    let err = '';

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new ProviderError('yt-dlp timed out (60s)'));
    }, 60000);

    child.stdout.on('data', d => (out += d.toString()));
    child.stderr.on('data', d => (err += d.toString()));

    child.on('close', code => {
      clearTimeout(timer);
      if (code === 0) return resolve(out);

      const meaningful = err
        .split('\n')
        .filter(l => l.includes('ERROR:'))
        .pop()
        || err.slice(-400)
        || 'yt-dlp exited with code ' + code;

      reject(new ProviderError(meaningful.trim()));
    });

    child.on('error', spawnErr => {
      clearTimeout(timer);
      reject(new ProviderError('Could not start yt-dlp: ' + spawnErr.message));
    });
  });
}

const QUALITY_MAP = [
  {
    itag: '0',
    label: 'MP4 - 4K (2160p)',
    format: 'bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160][ext=mp4]/best[height<=2160]',
    height: 2160,
    type: 'video'
  },
  {
    itag: '1',
    label: 'MP4 - 1440p (2K)',
    format: 'bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/best[height<=1440][ext=mp4]/best[height<=1440]',
    height: 1440,
    type: 'video'
  },
  {
    itag: '2',
    label: 'MP4 - 1080p (Full HD)',
    format: 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]',
    height: 1080,
    type: 'video'
  },
  {
    itag: '3',
    label: 'MP4 - 720p (HD)',
    format: 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]',
    height: 720,
    type: 'video'
  },
  {
    itag: '4',
    label: 'MP4 - 360p',
    format: 'best[height<=360][ext=mp4]/best[height<=360]',
    height: 360,
    type: 'video'
  },
  {
    itag: '5',
    label: 'MP4 - 144p',
    format: 'best[height<=144][ext=mp4]/best[height<=144]',
    height: 144,
    type: 'video'
  },
  {
    itag: '6',
    label: 'MP3 - Audio Only',
    format: 'bestaudio[ext=m4a]/bestaudio/best',
    height: 0,
    type: 'audio'
  }
];

async function getInfo(url) {
  try {
    const raw = await run(['-J', url]);
    const data = JSON.parse(raw);

    const availableHeights = new Set(
      (data.formats || [])
        .map(f => f.height)
        .filter(h => h && h > 0)
    );

    const formats = QUALITY_MAP.filter(q => {
      if (q.type === 'audio') return true;
      if (q.height <= 360) return true;
      return [...availableHeights].some(h => h >= q.height);
    });

    return {
      platform: 'youtube',
      title: data.title || 'YouTube Video',
      thumbnail: data.thumbnail || '',
      duration: data.duration || 0,
      channel: data.uploader || '',
      views: data.view_count || 0,
      formats
    };
  } catch (err) {
    throw new ProviderError(err.message || 'Failed to fetch YouTube info');
  }
}

function createStream(url, format) {
  const args = [
    ...baseArgs(),
    ...cookieArgs(),
    '--no-part',
    '-f', format.format,
    '--merge-output-format', 'mp4',
    '-o', '-',
    url
  ];

  const child = spawn('yt-dlp', args, {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stderr.on('data', d => {
    const line = d.toString().trim();
    if (line.includes('ERROR')) {
      console.error('[YT stream error]', line);
    }
  });

  child.on('error', err => {
    console.error('[YT spawn error]', err.message);
  });

  child.stdout.on('close', () => {
    try { child.kill(); } catch (_) {}
  });

  return child.stdout;
}

module.exports = { getInfo, createStream, QUALITY_MAP };