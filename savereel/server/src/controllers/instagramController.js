'use strict';

const igProvider = require('../providers/instagram');
const { validateInstagramUrl } = require('../validators/urlValidator');
const { asyncWrap, ok, sanitizeFilename } = require('../utils/helpers');
const analytics = require('../utils/analytics');
const logger = require('../utils/logger');

const getInfo = asyncWrap(async (req, res) => {
  analytics.inc('visits');

  const url = validateInstagramUrl(req.query.url);

  logger.info('IG info request', {
    url,
    reqId: req.reqId
  });

  const data = await igProvider.getInfo(url);
  analytics.inc('ig_info_ok');

  ok(res, { data });
});

const download = asyncWrap(async (req, res) => {
  const url = validateInstagramUrl(req.query.url);
  const title = req.query.title || 'instagram-video';

  logger.info('IG download request', {
    reqId: req.reqId
  });

  analytics.inc('ig_download');

  const data = await igProvider.getInfo(url);
  const mediaUrl = data.formats[0].directUrl;

  const isAudio = data.formats[0].type === 'audio';
  const ext = isAudio ? 'mp3' : 'mp4';
  const mime = isAudio ? 'audio/mpeg' : 'video/mp4';

  const filename = sanitizeFilename(title, ext);

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', mime);
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const response = await igProvider.proxyStream(mediaUrl);

  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
});

module.exports = {
  getInfo,
  download
};