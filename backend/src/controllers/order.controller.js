const pool = require('../config/db');

/* ==================================================
   CHECKOUT
   Body: { items: [{ product_id, quantity }, ...] }
   Creates ONE order but line items keep each product's
   seller_id, so each seller can later query their own
   share of the order.
================================================== */
async function checkout(req, res, next) {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'items must be a non-empty array.' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let total = 0;
        const lineItems = [];

        for (const { product_id, quantity } of items) {
            if (!product_id || !quantity || quantity < 1) {
                throw Object.assign(new Error('Each item needs a valid product_id and quantity.'), { status: 400 });
            }

            const productResult = await client.query(
                `SELECT p.id, p.name, p.price, p.stock, p.seller_id
                 FROM products p
                 JOIN sellers s ON s.id = p.seller_id
                 WHERE p.id = $1 AND p.is_active = TRUE AND s.approved = TRUE
                 FOR UPDATE`,
                [product_id]
            );

            const product = productResult.rows[0];

            if (!product) {
                throw Object.assign(new Error(`Product ${product_id} is not available.`), { status: 400 });
            }

            if (product.stock < quantity) {
                throw Object.assign(
                    new Error(`Not enough stock for "${product.name}" (${product.stock} left).`),
                    { status: 400 }
                );
            }

            await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [quantity, product.id]);

            total += Number(product.price) * quantity;
            lineItems.push({
                product_id: product.id,
                seller_id: product.seller_id,
                product_name: product.name,
                unit_price: product.price,
                quantity,
            });
        }

        const orderResult = await client.query(
            `INSERT INTO orders (buyer_id, total) VALUES ($1, $2) RETURNING *`,
            [req.user.id, total]
        );
        const order = orderResult.rows[0];

        for (const item of lineItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, seller_id, product_name, unit_price, quantity)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [order.id, item.product_id, item.seller_id, item.product_name, item.unit_price, item.quantity]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ order, items: lineItems });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
}

/* ==================================================
   BUYER: list my orders
================================================== */
async function listMyOrders(req, res, next) {
    try {
        const orders = await pool.query(
            'SELECT * FROM orders WHERE buyer_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );

        const orderIds = orders.rows.map((o) => o.id);
        let items = [];

        if (orderIds.length > 0) {
            const itemsResult = await pool.query(
                'SELECT * FROM order_items WHERE order_id = ANY($1::int[])',
                [orderIds]
            );
            items = itemsResult.rows;
        }

        const withItems = orders.rows.map((order) => ({
            ...order,
            items: items.filter((i) => i.order_id === order.id),
        }));

        res.json(withItems);
    } catch (err) {
        next(err);
    }
}

/* ==================================================
   SELLER: list my share of orders (just this seller's line items)
================================================== */
async function listSellerOrders(req, res, next) {
    try {
        const result = await pool.query(
            `SELECT oi.*, o.status, o.created_at AS ordered_at
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE oi.seller_id = $1
             ORDER BY o.created_at DESC`,
            [req.user.sellerId]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

module.exports = { checkout, listMyOrders, listSellerOrders };
