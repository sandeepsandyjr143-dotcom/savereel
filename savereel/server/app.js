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

/* SECURITY */
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
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    dnsPrefetchControl: { allow: false }
  })
);

/* CORS */
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
    methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
    credentials: true
  })
);

app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(requestLogger);

/* HEALTH */
app.head('/health', (_req, res) => {
  res.sendStatus(200);
});

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

/* ROOT */
app.head('/', (_req, res) => {
  res.sendStatus(200);
});

app.get('/', (_req, res) => {
  res.json({
    status: 'SaveReel API running 🚀',
    version: '3.0.0'
  });
});

/* API */
app.use('/api', apiLimiter);
app.use('/api/yt/info', infoLimiter);
app.use('/api/ig/info', infoLimiter);
app.use('/api/yt/download', downloadLimiter);
app.use('/api/ig/download', downloadLimiter);
app.use('/api', apiRoutes);

/* ERRORS */
app.use(notFoundHandler);
app.use(errorHandler);

/* START */
const PORT = process.env.PORT || env.PORT || 3001;

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info('SaveReel API started', {
    port: PORT,
    env: env.NODE_ENV,
    version: '3.0.0'
  });
});

/* SHUTDOWN */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');

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