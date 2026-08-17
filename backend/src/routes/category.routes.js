const express = require('express');
const router = express.Router();
const { listCategories } = require('../controllers/category.controller');

router.get('/', listCategories);

module.exports = router;
