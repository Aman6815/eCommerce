const pool = require('../config/db');

/* ==================================================
   PUBLIC: list/search products
   Only shows products from approved sellers.
   Query params: ?q=&category=&page=&limit=
================================================== */
async function listProducts(req, res, next) {
    const { q, category, page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, page) - 1) * limit;

    const conditions = ['p.is_active = TRUE', 's.approved = TRUE'];
    const values = [];

    if (q) {
        values.push(`%${q}%`);
        conditions.push(`p.name ILIKE $${values.length}`);
    }

    if (category && category !== 'All') {
        values.push(category);
        conditions.push(`c.name = $${values.length}`);
    }

    values.push(limit, offset);

    const query = `
        SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url,
               c.name AS category, s.shop_name AS seller, s.id AS seller_id
        FROM products p
        JOIN sellers s ON s.id = p.seller_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY p.created_at DESC
        LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    try {
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

/* ==================================================
   PUBLIC: get one product
================================================== */
async function getProduct(req, res, next) {
    try {
        const result = await pool.query(
            `SELECT p.*, c.name AS category, s.shop_name AS seller, s.id AS seller_id
             FROM products p
             JOIN sellers s ON s.id = p.seller_id
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.id = $1 AND p.is_active = TRUE AND s.approved = TRUE`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
}

/* ==================================================
   SELLER: create a product (scoped to req.user.sellerId)
================================================== */
async function createProduct(req, res, next) {
    const { name, description, price, stock, category_id, image_url } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ error: 'name and price are required.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO products (seller_id, category_id, name, description, price, stock, image_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [req.user.sellerId, category_id || null, name, description || null, price, stock || 0, image_url || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
}

/* ==================================================
   SELLER: list own products (includes inactive/out of stock)
================================================== */
async function listOwnProducts(req, res, next) {
    try {
        const result = await pool.query(
            `SELECT p.*, c.name AS category
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.seller_id = $1
             ORDER BY p.created_at DESC`,
            [req.user.sellerId]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

/* ==================================================
   SELLER: update own product
   Ownership is enforced in the WHERE clause, not just
   by checking beforehand — prevents editing someone else's.
================================================== */
async function updateProduct(req, res, next) {
    const { name, description, price, stock, category_id, image_url, is_active } = req.body;

    try {
        const result = await pool.query(
            `UPDATE products SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                stock = COALESCE($4, stock),
                category_id = COALESCE($5, category_id),
                image_url = COALESCE($6, image_url),
                is_active = COALESCE($7, is_active)
             WHERE id = $8 AND seller_id = $9
             RETURNING *`,
            [name, description, price, stock, category_id, image_url, is_active, req.params.id, req.user.sellerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found or not yours to edit.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
}

/* ==================================================
   SELLER: delete own product
================================================== */
async function deleteProduct(req, res, next) {
    try {
        const result = await pool.query(
            'DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING id',
            [req.params.id, req.user.sellerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found or not yours to delete.' });
        }

        res.json({ message: 'Product deleted.' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listProducts,
    getProduct,
    createProduct,
    listOwnProducts,
    updateProduct,
    deleteProduct,
};
