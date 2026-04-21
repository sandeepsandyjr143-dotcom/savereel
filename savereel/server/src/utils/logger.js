'use strict';

const env = require('../config/env');

/**
 * Minimal structured logger.
 * - Dev: coloured console output for readability
 * - Prod: JSON lines for log aggregators (Datadog, Loki, Render logs, etc.)
 */

const COLOURS = {
  info:  '\x1b[36m',   // cyan
  warn:  '\x1b[33m',   // yellow
  error: '\x1b[31m',   // red
  debug: '\x1b[90m',   // grey
  reset: '\x1b[0m',
};

function timestamp() {
  return new Date().toISOString();
}

function sanitiseMeta(meta = {}) {
  // Never log secrets or internal pointers
  const REDACT = ['password', 'token', 'secret', 'authorization', 'cookie'];
  const out = {};
  for (const [k, v] of Object.entries(meta)) {
    out[k] = REDACT.some((r) => k.toLowerCase().includes(r)) ? '[REDACTED]' : v;
  }
  return out;
}

function write(level, message, meta = {}) {
  const clean = sanitiseMeta(meta);
  const entry = { ts: timestamp(), level, message, ...clean };

  if (env.IS_DEV) {
    const colour = COLOURS[level] || '';
    const metaStr = Object.keys(clean).length ? '  ' + JSON.stringify(clean) : '';
    // eslint-disable-next-line no-console
    console.log(`${colour}[${level.toUpperCase()}]${COLOURS.reset} ${message}${metaStr}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }
}

let _counter = 0;

const logger = {
  info:  (msg, meta) => write('info',  msg, meta),
  warn:  (msg, meta) => write('warn',  msg, meta),
  error: (msg, meta) => write('error', msg, meta),
  debug: (msg, meta) => write('debug', msg, meta),

  /** Generate a unique request ID for correlation */
  genReqId: () => `req_${Date.now().toString(36)}_${(++_counter).toString(36)}`,
};

module.exports = logger;
