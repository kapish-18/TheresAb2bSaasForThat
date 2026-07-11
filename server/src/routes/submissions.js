const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const requireAdmin = require('../middleware/adminAuth');
const {
  createSubmission,
  listSubmissions,
  approveSubmission,
  rejectSubmission
} = require('../controllers/submissionController');

// Public submission endpoint is the one thing anyone can write to without
// auth, so it gets its own limit — generous for a real person submitting a
// few suggestions, tight enough to blunt spam bots.
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many submissions from this IP. Try again in a bit.' }
});

// Admin endpoints are protected by a shared secret rather than real auth,
// so this limiter's real job is making brute-force guessing of that secret
// impractical. Applied BEFORE requireAdmin so failed guesses count against
// the limit too, not just successful requests. 60/15min is generous for one
// person actively reviewing submissions, but throttles automated guessing
// hard.
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: 'Too many admin requests from this IP. Try again in a bit.' }
});

// POST /api/submissions — anyone can suggest a competitor or a new problem
router.post('/', submissionLimiter, createSubmission);

// GET /api/submissions?status=pending — admin only
router.get('/', adminLimiter, requireAdmin, listSubmissions);

// POST /api/submissions/:id/approve — admin only
router.post('/:id/approve', adminLimiter, requireAdmin, approveSubmission);

// POST /api/submissions/:id/reject — admin only
router.post('/:id/reject', adminLimiter, requireAdmin, rejectSubmission);

module.exports = router;
