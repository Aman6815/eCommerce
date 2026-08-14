const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { listPendingSellers, approveSeller, rejectSeller } = require('../controllers/admin.controller');

router.use(requireAuth, requireRole('admin'));

router.get('/sellers/pending', listPendingSellers);
router.post('/sellers/:id/approve', approveSeller);
router.post('/sellers/:id/reject', rejectSeller);

module.exports = router;
