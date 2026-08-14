const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { signToken } = require('../utils/jwt');

/* ==================================================
   REGISTER
   role: 'buyer' or 'seller'.
   Sellers also submit shop_name (+ optional phone/location)
   and start out unapproved until an admin approves them.
================================================== */
async function register(req, res, next) {
    const { name, email, password, role, shop_name, phone, location } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (role === 'seller' && !shop_name) {
        return res.status(400).json({ error: 'shop_name is required to register as a seller.' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const passwordHash = await bcrypt.hash(password, 10);
        const finalRole = role === 'seller' ? 'seller' : 'buyer';

        const userResult = await client.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role`,
            [name, email, passwordHash, finalRole]
        );

        const user = userResult.rows[0];
        let seller = null;

        if (finalRole === 'seller') {
            const sellerResult = await client.query(
                `INSERT INTO sellers (user_id, shop_name, phone, location)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, shop_name, approved`,
                [user.id, shop_name, phone || null, location || null]
            );
            seller = sellerResult.rows[0];
        }

        await client.query('COMMIT');

        const token = signToken({
            id: user.id,
            role: user.role,
            sellerId: seller ? seller.id : null,
        });

        res.status(201).json({
            token,
            user,
            seller,
            message:
                finalRole === 'seller'
                    ? 'Registered. Your shop is pending admin approval before your products go live.'
                    : 'Registered successfully.',
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
}

/* ==================================================
   LOGIN
================================================== */
async function login(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        let sellerId = null;
        if (user.role === 'seller') {
            const sellerResult = await pool.query(
                'SELECT id, approved FROM sellers WHERE user_id = $1',
                [user.id]
            );
            sellerId = sellerResult.rows[0]?.id || null;
        }

        const token = signToken({ id: user.id, role: user.role, sellerId });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login };
