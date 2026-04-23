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
    '--no-playlist',
    '--no-warnings',
    '--ignore-errors',
    '--no-check-certificates',
    '--socket-timeout', '30',
    '--user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
    '--extractor-args',
    'youtube:player_client=web,android,ios'
  ];
}

function run(args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'yt-dlp',
      [...baseArgs(), ...cookieArgs(), ...args],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    let out = '';
    let err = '';

    child.stdout.on('data', d => (out += d.toString()));
    child.stderr.on('data', d => (err += d.toString()));

    child.on('close', code => {
      if (code === 0) return resolve(out.trim());
      reject(new ProviderError(err || 'YouTube request failed'));
    });

    child.on('error', e => {
      reject(new ProviderError(e.message || 'yt-dlp failed'));
    });
  });
}

const QUALITY_MAP = [
  {
    itag: '0',
    label: 'MP4 - Best Quality',
    format: 'bv*+ba/b',
    type: 'video',
    best: true
  },
  {
    itag: '1',
    label: 'MP3 - Audio Only',
    format: 'bestaudio/best',
    type: 'audio',
    best: false
  }
];

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
      formats: QUALITY_MAP
    };
  } catch (err) {
    throw new ProviderError(err.message || 'Unable to fetch video info');
  }
}

async function getFormat(url, itag) {
  const format = QUALITY_MAP.find(x => x.itag === String(itag));

  if (!format) {
    throw new ProviderError('Invalid format');
  }

  return format;
}

function createStream(url, format) {
  const child = spawn(
    'yt-dlp',
    [
      ...baseArgs(),
      ...cookieArgs(),
      '--no-part',
      '--merge-output-format',
      'mp4',
      '-f',
      format.format,
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