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
// few suggestions, tight enough to blunt spam bots. Admin review actions
// below are NOT limited by this, since one person might approve dozens in
// a sitting.
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many submissions from this IP. Try again in a bit.' }
});

// POST /api/submissions — anyone can suggest a competitor or a new problem
router.post('/', submissionLimiter, createSubmission);

// GET /api/submissions?status=pending — admin only
router.get('/', requireAdmin, listSubmissions);

// POST /api/submissions/:id/approve — admin only
router.post('/:id/approve', requireAdmin, approveSubmission);

// POST /api/submissions/:id/reject — admin only
router.post('/:id/reject', requireAdmin, rejectSubmission);

module.exports = router;
