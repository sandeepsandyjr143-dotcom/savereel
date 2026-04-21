'use strict';

/**
 * Centralised env config with strict startup validation.
 * Import this ONCE at app entry — it validates and exports all values.
 */

const REQUIRED_IN_PROD = ['CLIENT_URL'];
const IS_PROD = process.env.NODE_ENV === 'production';

// Always required
if (!process.env.NODE_ENV) {
  console.error('[FATAL] NODE_ENV is not set. Set it to "production" or "development".');
  process.exit(1);
}

if (!process.env.PORT) {
  console.warn('[WARN] PORT not set — defaulting to 3001.');
}

// Production-only required vars
if (IS_PROD) {
  const missing = REQUIRED_IN_PROD.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`[FATAL] Missing required production env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
}

module.exports = Object.freeze({
  NODE_ENV:   process.env.NODE_ENV,
  PORT:       parseInt(process.env.PORT, 10) || 3001,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  REDIS_URL:  process.env.REDIS_URL  || null,
  SENTRY_DSN: process.env.SENTRY_DSN || null,

  /** Admin secret for /health/details — optional but recommended in prod */
  HEALTH_SECRET: process.env.HEALTH_SECRET || null,

  IS_PROD,
  IS_DEV: process.env.NODE_ENV === 'development',
});
