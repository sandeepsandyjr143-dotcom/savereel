'use strict';

const express = require('express');
const router = express.Router();

const ytCtrl = require('../controllers/youtubeController');
const igCtrl = require('../controllers/instagramController');

/* ─────────────────────────────────────────────────────────── */
/* YouTube */
/* ─────────────────────────────────────────────────────────── */
router.get('/yt/info', ytCtrl.getInfo);
router.get('/yt/download', ytCtrl.download);

/* ─────────────────────────────────────────────────────────── */
/* Instagram */
/* ─────────────────────────────────────────────────────────── */
router.get('/ig/info', igCtrl.getInfo);
router.get('/ig/download', igCtrl.download);

/* Instagram Thumbnail Proxy */
router.get('/ig/thumb', async (req, res) => {
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
      throw new Error('Failed to fetch image');
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader(
      'Content-Type',
      response.headers.get('content-type') || 'image/jpeg'
    );

    res.setHeader('Cache-Control', 'public, max-age=86400');

    res.send(buffer);
  } catch (err) {
    res.status(404).send('No image');
  }
});

module.exports = router;