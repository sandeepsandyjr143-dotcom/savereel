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
    '--socket-timeout', '30',
    '--extractor-args', 'youtube:player_client=android,web',
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

    child.stdout.on('data', d => out += d.toString());
    child.stderr.on('data', d => err += d.toString());

    child.on('close', code => {
      if (code === 0) return resolve(out);
      reject(new ProviderError(err || 'yt-dlp failed'));
    });

    child.on('error', e => {
      reject(new ProviderError(e.message));
    });
  });
}

const QUALITY_MAP = [
  {
    itag: '0',
    label: 'MP4 - Best Quality',
    format: 'best',
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
}

async function getFormat(url, itag) {
  return QUALITY_MAP.find(x => x.itag === String(itag));
}

function createStream(url, format) {
  const child = spawn(
    'yt-dlp',
    [
      ...baseArgs(),
      ...cookieArgs(),
      '--no-part',
      '-f', format.format,
      '-o', '-',
      url
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  return child.stdout;
}

module.exports = {
  getInfo,
  getFormat,
  createStream
};