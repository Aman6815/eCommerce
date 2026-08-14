const pool = require('../config/db');

/* ==================================================
   ADMIN: list sellers pending approval
================================================== */
async function listPendingSellers(req, res, next) {
    try {
        const result = await pool.query(
            `SELECT s.id, s.shop_name, s.phone, s.location, s.created_at,
                    u.name AS owner_name, u.email
             FROM sellers s
             JOIN users u ON u.id = s.user_id
             WHERE s.approved = FALSE
             ORDER BY s.created_at ASC`
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

/* ==================================================
   ADMIN: approve a seller
================================================== */
async function approveSeller(req, res, next) {
    try {
        const result = await pool.query(
            'UPDATE sellers SET approved = TRUE WHERE id = $1 RETURNING *',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Seller not found.' });
        }

        res.json({ message: 'Seller approved.', seller: result.rows[0] });
    } catch (err) {
        next(err);
    }
}

/* ==================================================
   ADMIN: reject / remove a pending seller
================================================== */
async function rejectSeller(req, res, next) {
    try {
        const result = await pool.query(
            'DELETE FROM sellers WHERE id = $1 AND approved = FALSE RETURNING id',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pending seller not found.' });
        }

        res.json({ message: 'Seller application rejected.' });
    } catch (err) {
        next(err);
    }
}

module.exports = { listPendingSellers, approveSeller, rejectSeller };
