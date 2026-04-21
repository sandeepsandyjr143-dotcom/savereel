'use strict';

const rateLimit = require('express-rate-limit');
const env       = require('../config/env');

/**
 * Factory — keeps limiter config DRY.
 *
 * @param {number} windowMs
 * @param {number} max          - Max requests per windowMs per IP
 * @param {string} message      - User-facing message when limit hit
 * @param {string} [code]       - Machine-readable error code
 */
function createLimiter(windowMs, max, message, code = 'RATE_LIMIT_EXCEEDED') {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-7',   // RateLimit headers (RFC-compliant)
    legacyHeaders:   false,
    skipSuccessfulRequests: false,

    // Skip loopback in dev so local testing is never blocked
    skip: (req) => env.IS_DEV && (req.ip === '::1' || req.ip === '127.0.0.1'),

    // Consistent JSON shape across all limit responses
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error:   message,
        code,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },

    // NOTE: To use Redis store, install `rate-limit-redis` and replace this:
    //   store: new RedisStore({ ... })
    // The rest of the code requires no changes.
  });
}

// ─── Configured limiters ───────────────────────────────────────────────────────

/** Broad API guard — 60 req / 15 min */
const apiLimiter = createLimiter(
  15 * 60 * 1000,
  60,
  'Too many requests. Please wait a few minutes and try again.',
);

/** Info endpoints — 30 req / 10 min (fetching metadata) */
const infoLimiter = createLimiter(
  10 * 60 * 1000,
  30,
  'Too many fetch requests. Please slow down.',
);

/** Download endpoints — 12 req / 15 min (stricter, bandwidth-heavy) */
const downloadLimiter = createLimiter(
  15 * 60 * 1000,
  12,
  'Download limit reached. Please try again in 15 minutes.',
);

module.exports = { apiLimiter, infoLimiter, downloadLimiter };
