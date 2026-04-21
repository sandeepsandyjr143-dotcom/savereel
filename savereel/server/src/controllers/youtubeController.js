'use strict';

const ytProvider = require('../providers/youtube');
const { validateYouTubeUrl, validateItag } = require('../validators/urlValidator');
const { asyncWrap, ok, sanitizeFilename } = require('../utils/helpers');
const analytics = require('../utils/analytics');
const logger = require('../utils/logger');

const getInfo = asyncWrap(async (req, res) => {
  analytics.inc('visits');

  const url = validateYouTubeUrl(req.query.url);
  logger.info('YT info request', { url, reqId: req.reqId });

  try {
    const data = await ytProvider.getInfo(url);
    analytics.inc('yt_info_ok');
    ok(res, { data });
  } catch (err) {
    analytics.inc('yt_info_fail');
    throw err;
  }
});

const download = asyncWrap(async (req, res) => {
  const url = validateYouTubeUrl(req.query.url);
  const itag = validateItag(req.query.itag);
  const title = req.query.title || 'savereel-video';

  analytics.inc('yt_download');
  logger.info('YT download request', { reqId: req.reqId, itag });

  const format = await ytProvider.getFormat(url, itag);
  const isAudio = format.type === 'audio';

  const ext = isAudio ? 'mp3' : 'mp4';
  const filename = sanitizeFilename(title, ext);

  res.writeHead(200, {
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Type': isAudio ? 'audio/mpeg' : 'video/mp4',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Connection': 'keep-alive'
  });

  const stream = ytProvider.createStream(url, format);

  stream.on('error', err => {
    logger.error('YT stream error', { message: err.message });
    if (!res.headersSent) {
      res.status(500).end('Download failed');
    } else {
      res.end();
    }
  });

  req.on('close', () => {
    try {
      stream.destroy();
    } catch {}
  });

  stream.pipe(res);
});

module.exports = {
  getInfo,
  download
};
