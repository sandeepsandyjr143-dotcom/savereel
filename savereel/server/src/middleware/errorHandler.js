'use strict';

const logger = require('../utils/logger');
const env    = require('../config/env');

/**
 * Express centralised error handler.
 * Must have 4 params for Express to recognise it as an error handler.
 *
 * Operational errors (AppError subclasses) → structured client response.
 * Unexpected errors → generic 500, full stack logged server-side only.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    // Stream already started — can only destroy
    return res.destroy();
  }

  if (err.isOperational) {
    logger.warn('Operational error', {
      code:    err.code,
      message: err.message,
      reqId:   req.reqId,
      path:    req.path,
    });
    return res.status(err.statusCode).json({
      success: false,
      error:   err.message,
      code:    err.code,
    });
  }

  // Unknown error — log full detail, respond generically
  logger.error('Unhandled error', {
    message: err.message,
    stack:   err.stack,
    reqId:   req.reqId,
    path:    req.path,
  });

  const body = {
    success: false,
    error:   'An unexpected error occurred. Please try again.',
    code:    'INTERNAL_ERROR',
  };

  if (env.IS_DEV) {
    body.stack = err.stack;
  }

  res.status(500).json(body);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error:   `Route not found: ${req.method} ${req.path}`,
    code:    'NOT_FOUND',
  });
}

module.exports = { errorHandler, notFoundHandler };
