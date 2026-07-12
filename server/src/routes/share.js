const express = require('express');
const router = express.Router();
const { getOgImage, getSharePage } = require('../controllers/shareController');

// GET /api/og/:slug.png — the actual generated image
router.get('/api/og/:slug.png', getOgImage);

// GET /share/:slug — bot-readable HTML with proper OG tags, redirects humans
// to the real React app. Mounted separately (not under /api) since this is
// the URL that actually gets pasted into Twitter/LinkedIn/etc.
router.get('/share/:slug', getSharePage);

module.exports = router;
