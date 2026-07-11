// Minimal auth for solo-founder admin actions. Not a real auth system —
// just enough to keep the review endpoints from being public. Upgrade this
// to real auth (or an admin login) before you have other people helping
// moderate submissions.
function requireAdmin(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (!process.env.ADMIN_SECRET) {
    return res.status(500).json({ error: 'ADMIN_SECRET is not configured on the server.' });
  }
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
}

module.exports = requireAdmin;
