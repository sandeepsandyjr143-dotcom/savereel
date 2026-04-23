'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ProviderError } = require('../utils/errors');

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

function cookieArgs() {
  const file = path.join(__dirname, '../../cookies.txt');
  return fs.existsSync(file) ? ['--cookies', file] : [];
}

// THE CORE FIX: android client skips n-challenge entirely
// web fallback handles anything android misses
function baseArgs() {
  return [
    '--extractor-args', 'youtube:player_client=android,web',
    '--no-check-certificates',
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

    // Kill if it hangs beyond 60 seconds
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new ProviderError('yt-dlp timed out (60s)'));
    }, 60000);

    child.stdout.on('data', d => (out += d.toString()));
    child.stderr.on('data', d => (err += d.toString()));

    child.on('close', code => {
      clearTimeout(timer);
      if (code === 0) return resolve(out);

      // Extract most meaningful error line from stderr
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

/* ─────────────────────────────────────────────
   getInfo — fetches metadata only (no download)
───────────────────────────────────────────── */

async function getInfo(url) {
  try {
    const raw = await run(['-J', url]);
    const data = JSON.parse(raw);

    return {
      platform: 'youtube',
      title: data.title || 'YouTube Video',
      thumbnail: data.thumbnail || '',
      duration: data.duration || 0,
      channel: data.uploader || '',
      views: data.view_count || 0,
      formats: [
        {
          itag: '0',
          label: 'MP4 - Best Quality',
          quality: 'best',
          type: 'video',
          best: true
        },
        {
          itag: '1',
          label: 'MP3 - Audio Only',
          quality: 'audio',
          type: 'audio',
          best: false
        }
      ]
    };
  } catch (err) {
    throw new ProviderError(err.message || 'Failed to fetch YouTube info');
  }
}

/* ─────────────────────────────────────────────
   createStream — pipes video/audio to response
   
   IMPORTANT: We use combined format strings ONLY.
   "bestvideo+bestaudio" requires ffmpeg muxing
   which CANNOT stream to stdout (-o -).
   Use "best[ext=mp4]" which is a single combined
   stream — no ffmpeg needed, works on Render.
───────────────────────────────────────────── */

function createStream(url, format) {
  const isAudio = format.type === 'audio';

  const fmt = isAudio
    ? 'bestaudio[ext=m4a]/bestaudio/best'
    : 'best[ext=mp4]/best';

  const args = [
    ...baseArgs(),
    ...cookieArgs(),
    '--no-part',
    '-f', fmt,
    '-o', '-',   // stream to stdout
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

  // If stream closes, clean up child process
  child.stdout.on('close', () => {
    try { child.kill(); } catch (_) {}
  });

  return child.stdout;
}

module.exports = { getInfo, createStream };