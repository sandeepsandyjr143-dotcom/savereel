'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ProviderError } = require('../utils/errors');

function py() {
  return process.platform === 'win32' ? 'python' : 'python3';
}

function cookieArgs() {
  const file = path.join(__dirname, '../../cookies.txt');
  return fs.existsSync(file) ? ['--cookies', file] : [];
}

function commonArgs() {
  return [
    ...cookieArgs(),
    '--no-playlist',
    '--no-warnings',
    '--extractor-args',
    'youtube:player_client=android'
  ];
}

function run(args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(py(), ['-m', 'yt_dlp', ...commonArgs(), ...args]);

    let out = '';
    let err = '';

    child.stdout.on('data', d => (out += d.toString()));
    child.stderr.on('data', d => (err += d.toString()));

    child.on('close', code => {
      if (code === 0) return resolve(out);
      reject(new ProviderError(err || 'yt-dlp failed'));
    });
  });
}

async function getInfo(url) {
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
        label: 'MP3 - Audio',
        quality: 'audio',
        type: 'audio',
        best: false
      }
    ]
  };
}

async function getFormat(url, itag) {
  const info = await getInfo(url);
  return info.formats[Number(itag)];
}

function createStream(url, format) {
  const fmt =
    format.type === 'audio'
      ? 'bestaudio/best'
      : 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best';

  const child = spawn(
    py(),
    [
      '-m',
      'yt_dlp',
      ...commonArgs(),
      '--no-part',
      '-f',
      fmt,
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