'use strict';

const logger = require('../utils/logger');

/**
 * Attaches a unique request ID to every request and logs
 * method, path, status code, and response time on completion.
 */
function requestLogger(req, res, next) {
  req.reqId    = logger.genReqId();
  req.startedAt = Date.now();

  res.setHeader('X-Request-Id', req.reqId);

  res.on('finish', () => {
    const ms = Date.now() - req.startedAt;
    const level = res.statusCode >= 500 ? 'error'
                : res.statusCode >= 400 ? 'warn'
                : 'info';

    logger[level]('HTTP', {
      reqId:  req.reqId,
      method: req.method,
      path:   req.path,
      status: res.statusCode,
      ms,
      ip:     req.ip,
      ua:     req.headers['user-agent']?.slice(0, 80) || '-',
    });
  });

  next();
}

module.exports = requestLogger;
