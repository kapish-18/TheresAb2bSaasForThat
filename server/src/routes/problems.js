const express = require('express');
const router = express.Router();
const { search, random, getBySlug } = require('../controllers/problemController');

// GET /api/problems/search?q=coffee&satire=true
router.get('/search', search);

// GET /api/problems/random?satire=true
router.get('/random', random);

// GET /api/problems/slug/:slug  (for shareable /r/:slug links)
router.get('/slug/:slug', getBySlug);

module.exports = router;
