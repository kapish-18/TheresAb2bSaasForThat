const crypto = require('crypto');

// Minimal auth for solo-founder admin actions. Not a real auth system —
// just enough to keep the review endpoints from being public. Upgrade this
// to real auth (or an admin login) before you have other people helping
// moderate submissions.
function requireAdmin(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (!process.env.ADMIN_SECRET) {
    return res.status(500).json({ error: 'ADMIN_SECRET is not configured on the server.' });
  }
  if (!secret || !timingSafeStringCompare(secret, process.env.ADMIN_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
}

// Regular !== comparison leaks timing info (string comparison bails at the
// first mismatched character), which in theory lets an attacker guess the
// secret one character at a time. This compares in constant time instead.
function timingSafeStringCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // still run a comparison so this branch takes ~the same time either way
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = requireAdmin;
