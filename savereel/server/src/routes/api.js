'use strict';

const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const { URL } = require('url');

const ytCtrl = require('../controllers/youtubeController');
const igCtrl = require('../controllers/instagramController');

/* ─────────────────────────────────────────────
   YouTube
───────────────────────────────────────────── */
router.get('/yt/info',     ytCtrl.getInfo);
router.get('/yt/download', ytCtrl.download);

/* ─────────────────────────────────────────────
   Instagram
───────────────────────────────────────────── */
router.get('/ig/info',     igCtrl.getInfo);
router.get('/ig/download', igCtrl.download);

/* ─────────────────────────────────────────────
   Instagram Thumbnail Proxy
   
   WHY THIS EXISTS:
   Instagram CDN (scontent-*.cdninstagram.com) 
   blocks browser requests due to missing Referer
   and User-Agent headers. This proxy adds them
   server-side so the browser never hits CDN.
   
   WHY WE USE http/https MODULES:
   Native fetch and axios both have issues with
   Instagram CDN on certain Render Node versions.
   Core http/https module is always reliable.
───────────────────────────────────────────── */
router.get('/ig/thumb', (req, res) => {
  const rawUrl = req.query.url;

  if (!rawUrl) {
    return res.status(400).json({ success: false, error: 'Missing url param' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid URL' });
  }

  // Only allow Instagram and Facebook CDN domains
  const allowed = [
    'cdninstagram.com',
    'fbcdn.net',
    'instagram.com',
    'fbsbx.com'
  ];

  const isAllowed = allowed.some(d => parsedUrl.hostname.endsWith(d));
  if (!isAllowed) {
    return res.status(403).json({ success: false, error: 'Domain not allowed' });
  }

  const options = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname + parsedUrl.search,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.instagram.com/',
      'Origin': 'https://www.instagram.com',
      'sec-fetch-dest': 'image',
      'sec-fetch-mode': 'no-cors',
      'sec-fetch-site': 'cross-site',
    },
    timeout: 15000,
  };

  const lib = parsedUrl.protocol === 'https:' ? https : http;

  const proxyReq = lib.request(options, proxyRes => {
    // Follow redirect (Instagram CDN often redirects)
    if (
      proxyRes.statusCode >= 300 &&
      proxyRes.statusCode < 400 &&
      proxyRes.headers.location
    ) {
      // Redirect to our own proxy with new URL
      const redirectUrl = encodeURIComponent(proxyRes.headers.location);
      return res.redirect(`/api/ig/thumb?url=${redirectUrl}`);
    }

    if (proxyRes.statusCode !== 200) {
      return res.status(404).send('Thumbnail not available');
    }

    res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    proxyRes.pipe(res);
  });

  proxyReq.on('error', err => {
    console.error('[Thumb proxy error]', err.message);
    res.status(500).send('Proxy error');
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    res.status(408).send('Proxy timeout');
  });

  proxyReq.end();
});

module.exports = router;