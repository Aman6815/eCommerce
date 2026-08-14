const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { checkout, listMyOrders, listSellerOrders } = require('../controllers/order.controller');

router.post('/checkout', requireAuth, requireRole('buyer'), checkout);
router.get('/mine', requireAuth, requireRole('buyer'), listMyOrders);
router.get('/seller', requireAuth, requireRole('seller'), listSellerOrders);

module.exports = router;
