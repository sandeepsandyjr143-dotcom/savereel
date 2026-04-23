'use strict';

const ytProvider = require('../providers/youtube');
const { validateYouTubeUrl, validateItag } = require('../validators/urlValidator');
const { asyncWrap, ok, sanitizeFilename } = require('../utils/helpers');
const analytics = require('../utils/analytics');
const logger = require('../utils/logger');

/* ─────────────────────────────────────────────
   GET INFO
───────────────────────────────────────────── */

const getInfo = asyncWrap(async (req, res) => {
  analytics.inc('visits');

  const url = validateYouTubeUrl(req.query.url);
  logger.info('YT info request', { url, reqId: req.reqId });

  try {
    const data = await ytProvider.getInfo(url);
    analytics.inc('yt_info_ok');
    return ok(res, { data });
  } catch (err) {
    analytics.inc('yt_info_fail');
    throw err;
  }
});

/* ─────────────────────────────────────────────
   DOWNLOAD
───────────────────────────────────────────── */

const download = asyncWrap(async (req, res) => {
  const url    = validateYouTubeUrl(req.query.url);
  const itag   = validateItag(req.query.itag);
  const title  = req.query.title || 'savereel-video';

  analytics.inc('yt_download');
  logger.info('YT download request', { reqId: req.reqId, itag });

  // Validate itag is 0 or 1
  const itagNum = Number(itag);
  if (itagNum !== 0 && itagNum !== 1) {
    throw new Error('Invalid itag. Must be 0 (video) or 1 (audio)');
  }

  const isAudio = itagNum === 1;
  const ext = isAudio ? 'mp3' : 'mp4';
  const filename = sanitizeFilename(title, ext);

  res.writeHead(200, {
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Type': isAudio ? 'audio/mpeg' : 'video/mp4',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Transfer-Encoding': 'chunked'
  });

  const format = { type: isAudio ? 'audio' : 'video' };
  const stream = ytProvider.createStream(url, format);

  stream.on('error', err => {
    logger.error('YT stream error', { message: err.message });
    // Headers already sent, just end
    res.end();
  });

  req.on('close', () => {
    logger.info('Client disconnected — destroying YT stream');
    try { stream.destroy(); } catch (_) {}
  });

  stream.pipe(res);
});

module.exports = { getInfo, download };
