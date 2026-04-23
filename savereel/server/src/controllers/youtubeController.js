'use strict';

const ytProvider = require('../providers/youtube');
const { validateYouTubeUrl } = require('../validators/urlValidator');
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
   
   itag = '0' through '6' matching QUALITY_MAP
   We look up the format object by itag string
   and pass the full format object to createStream
───────────────────────────────────────────── */
const download = asyncWrap(async (req, res) => {
  const url   = validateYouTubeUrl(req.query.url);
  const itag  = req.query.itag;
  const title = req.query.title || 'savereel-video';

  if (!itag) {
    throw new Error('Missing itag parameter');
  }

  analytics.inc('yt_download');
  logger.info('YT download request', { reqId: req.reqId, itag });

  // Look up format from QUALITY_MAP by itag
  const { QUALITY_MAP } = require('../providers/youtube');
  const format = QUALITY_MAP.find(f => f.itag === itag);

  if (!format) {
    throw new Error(`Invalid itag: ${itag}. Valid values are 0-6`);
  }

  const isAudio = format.type === 'audio';
  const ext = isAudio ? 'mp3' : 'mp4';
  const filename = sanitizeFilename(title, ext);

  logger.info('YT download format selected', {
    label: format.label,
    type: format.type
  });

  res.writeHead(200, {
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Type': isAudio ? 'audio/mpeg' : 'video/mp4',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Transfer-Encoding': 'chunked'
  });

  const stream = ytProvider.createStream(url, format);

  stream.on('error', err => {
    logger.error('YT stream error', { message: err.message });
    res.end();
  });

  req.on('close', () => {
    logger.info('Client disconnected — destroying YT stream');
    try { stream.destroy(); } catch (_) {}
  });

  stream.pipe(res);
});

module.exports = { getInfo, download };