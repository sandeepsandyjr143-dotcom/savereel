'use strict';

require('dotenv').config();
const env = require('./src/config/env');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const apiRoutes = require('./src/routes/api');
const {
  apiLimiter,
  infoLimiter,
  downloadLimiter
} = require('./src/middleware/rateLimiter');

const requestLogger = require('./src/middleware/requestLogger');
const {
  errorHandler,
  notFoundHandler
} = require('./src/middleware/errorHandler');

const logger = require('./src/utils/logger');
const analytics = require('./src/utils/analytics');

const app = express();

app.set('trust proxy', 1);

/* ───────────────────────────────────────── */
/* SECURITY */
/* ───────────────────────────────────────── */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: env.IS_PROD ? undefined : false,
    hsts: env.IS_PROD
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      : false,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },
    noSniff: true,
    dnsPrefetchControl: { allow: false }
  })
);

/* ───────────────────────────────────────── */
/* CORS FINAL FIX */
/* ───────────────────────────────────────── */
const allowedOrigins = [
  'https://savereel-client.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      logger.warn('CORS blocked', { origin });

      return cb(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  })
);

app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(requestLogger);

/* ───────────────────────────────────────── */
/* HEALTH */
/* ───────────────────────────────────────── */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '3.0.0'
  });
});

app.get('/health/details', (req, res) => {
  const secret = env.HEALTH_SECRET;

  if (secret && req.headers['x-health-secret'] !== secret) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorised.',
      code: 'UNAUTHORISED'
    });
  }

  res.json({
    status: 'ok',
    version: '3.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: env.NODE_ENV,
    ts: new Date().toISOString()
  });
});

app.get('/health/analytics', (req, res) => {
  const secret = env.HEALTH_SECRET;

  if (secret && req.headers['x-health-secret'] !== secret) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorised.',
      code: 'UNAUTHORISED'
    });
  }

  res.json({
    success: true,
    data: analytics.snapshot()
  });
});

/* ───────────────────────────────────────── */
/* ROOT */
/* ───────────────────────────────────────── */
app.get('/', (_req, res) => {
  res.json({
    status: 'SaveReel API running 🚀',
    version: '3.0.0'
  });
});

/* ───────────────────────────────────────── */
/* INSTAGRAM THUMBNAIL PROXY */
/* ───────────────────────────────────────── */
app.get('/api/ig/thumb', async (req, res) => {
  try {
    const imageUrl = req.query.url;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing image url'
      });
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
        Referer: 'https://www.instagram.com/'
      }
    });

    if (!response.ok) {
      throw new Error('Could not fetch thumbnail');
    }

    const buffer = Buffer.from(
      await response.arrayBuffer()
    );

    res.setHeader(
      'Content-Type',
      response.headers.get('content-type') ||
        'image/jpeg'
    );

    res.setHeader(
      'Cache-Control',
      'public, max-age=86400'
    );

    res.send(buffer);
  } catch (err) {
    logger.warn('Thumbnail proxy failed', {
      message: err.message
    });

    res.status(404).send('No image');
  }
});

/* ───────────────────────────────────────── */
/* API ROUTES */
/* ───────────────────────────────────────── */
app.use('/api', apiLimiter);

app.use('/api/yt/info', infoLimiter);
app.use('/api/ig/info', infoLimiter);

app.use('/api/yt/download', downloadLimiter);
app.use('/api/ig/download', downloadLimiter);

app.use('/api', apiRoutes);

/* ───────────────────────────────────────── */
/* ERROR HANDLERS */
/* ───────────────────────────────────────── */
app.use(notFoundHandler);
app.use(errorHandler);

/* ───────────────────────────────────────── */
/* SERVER START */
/* ───────────────────────────────────────── */
const server = app.listen(env.PORT, () => {
  logger.info('SaveReel API started', {
    port: env.PORT,
    env: env.NODE_ENV,
    version: '3.0.0'
  });
});

/* ───────────────────────────────────────── */
/* SHUTDOWN */
/* ───────────────────────────────────────── */
process.on('SIGTERM', () => {
  logger.info(
    'SIGTERM received — shutting down gracefully'
  );

  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received — shutting down');

  server.close(() => process.exit(0));
});

process.on('uncaughtException', err => {
  logger.error('Uncaught exception', {
    message: err.message,
    stack: err.stack
  });

  process.exit(1);
});

process.on('unhandledRejection', reason => {
  logger.error('Unhandled rejection', {
    reason: String(reason)
  });
});

module.exports = app;