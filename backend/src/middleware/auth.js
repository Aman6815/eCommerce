const { verifyToken } = require('../utils/jwt');

/* ---------- Require a valid logged-in user (any role) ---------- */
function requireAuth(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
    }

    const token = header.split(' ')[1];

    try {
        req.user = verifyToken(token); // { id, role, sellerId? }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

/* ---------- Require one of the given roles ----------
   Usage: requireRole('seller'), requireRole('admin', 'seller') */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'You do not have permission to do this.' });
        }
        next();
    };
}

module.exports = { requireAuth, requireRole };
