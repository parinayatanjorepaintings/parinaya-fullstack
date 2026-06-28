const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      // Also check session cookie (for admin panel HTML pages)
      if (req.session && req.session.adminId) {
        req.adminId = req.session.adminId;
        return next();
      }
      return res.status(401).json({ error: 'Unauthorised' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Lightweight session-only check for admin panel HTML routes
function requireSession(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.redirect('/admin/login');
}

module.exports = { requireAuth, requireSession };
