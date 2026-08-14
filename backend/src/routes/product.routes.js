const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const {
    listProducts,
    getProduct,
    createProduct,
    listOwnProducts,
    updateProduct,
    deleteProduct,
} = require('../controllers/product.controller');

// Public
router.get('/', listProducts);
router.get('/mine', requireAuth, requireRole('seller'), listOwnProducts); // before /:id
router.get('/:id', getProduct);

// Seller-only
router.post('/', requireAuth, requireRole('seller'), createProduct);
router.put('/:id', requireAuth, requireRole('seller'), updateProduct);
router.delete('/:id', requireAuth, requireRole('seller'), deleteProduct);

module.exports = router;
