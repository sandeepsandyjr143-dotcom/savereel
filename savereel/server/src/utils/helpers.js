'use strict';

const asyncWrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const ok = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, ...data });
};

const sanitizeFilename = (name, ext) => {
  const safe = (name || 'download')
    .replace(/[^\w\s\-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 80);
  return `${safe || 'savereel-download'}.${ext}`;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { asyncWrap, ok, sanitizeFilename, clamp, sleep };
