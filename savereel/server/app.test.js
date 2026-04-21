'use strict';

const request = require('supertest');

jest.mock('./src/providers/youtube', () => ({
  getInfo: jest.fn(),
  getFormat: jest.fn(),
  createStream: jest.fn(),
}));

jest.mock('./src/providers/instagram', () => ({
  getInfo: jest.fn(),
  proxyStream: jest.fn(),
}));

process.env.NODE_ENV   = 'test';
process.env.PORT       = '3099';
process.env.CLIENT_URL = 'http://localhost:5173';

const app    = require('./app');
const ytProv = require('./src/providers/youtube');
const igProv = require('./src/providers/instagram');
const { ProviderError, UnsupportedError } = require('./src/utils/errors');

const MOCK_YT_DATA = {
  platform: 'youtube', title: 'Test Video',
  thumbnail: 'https://i.ytimg.com/vi/test/hqdefault.jpg',
  duration: 120, channel: 'Test Channel', views: 10000,
  formats: [
    { itag: '22', label: 'MP4 — 720p', quality: '720p', type: 'video', container: 'mp4', best: true },
    { itag: '18', label: 'MP4 — 360p', quality: '360p', type: 'video', container: 'mp4', best: false },
  ],
};

const MOCK_IG_DATA = {
  platform: 'instagram', title: 'Instagram Video',
  thumbnail: 'https://cdninstagram.com/test.jpg',
  duration: null, channel: '', views: 0,
  formats: [{ itag: '0', label: 'MP4 — 1080p (Max Quality)', quality: '1080p', type: 'video', directUrl: 'https://cdninstagram.com/test.mp4', best: true }],
};

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
    expect(res.body.memory).toBeUndefined();
  });
});

describe('GET /health/analytics', () => {
  it('returns analytics snapshot without secret when no secret set', async () => {
    const res = await request(app).get('/health/analytics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('fetchSuccessRate');
  });
});

describe('GET /api/yt/info', () => {
  it('returns video info for a valid YouTube URL', async () => {
    ytProv.getInfo.mockResolvedValueOnce(MOCK_YT_DATA);
    const res = await request(app).get('/api/yt/info').query({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.platform).toBe('youtube');
    expect(res.body.data.formats.length).toBeGreaterThan(0);
  });

  it('returns 422 for an invalid YouTube URL', async () => {
    const res = await request(app).get('/api/yt/info').query({ url: 'https://invalid.com/not-a-video' });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('UNSUPPORTED_URL');
  });

  it('returns 400 when url param is missing', async () => {
    const res = await request(app).get('/api/yt/info');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 502 on provider failure', async () => {
    ytProv.getInfo.mockRejectedValueOnce(new ProviderError('Provider down'));
    const res = await request(app).get('/api/yt/info').query({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
    expect(res.status).toBe(502);
    expect(res.body.code).toBe('PROVIDER_ERROR');
  });

  it('returns 422 for private video', async () => {
    ytProv.getInfo.mockRejectedValueOnce(new UnsupportedError('This video is private.'));
    const res = await request(app).get('/api/yt/info').query({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('UNSUPPORTED_URL');
  });
});

describe('GET /api/ig/info', () => {
  it('returns media info for a valid Instagram URL', async () => {
    igProv.getInfo.mockResolvedValueOnce(MOCK_IG_DATA);
    const res = await request(app).get('/api/ig/info').query({ url: 'https://www.instagram.com/reel/abc123/' });
    expect(res.status).toBe(200);
    expect(res.body.data.platform).toBe('instagram');
  });

  it('returns 422 for an invalid Instagram URL', async () => {
    const res = await request(app).get('/api/ig/info').query({ url: 'https://instagram.com/just-a-profile' });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('UNSUPPORTED_URL');
  });
});

describe('Unknown routes', () => {
  it('returns 404 with NOT_FOUND code', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
