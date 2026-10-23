const express = require('express');
const router = express.Router();
const c = require('../controllers/productController');
const cache = require('../middleware/cache');

router.get('/search', cache(60), c.searchProducts);
router.get('/', cache(60), c.getProducts);
router.get('/:id', cache(300), c.getProductById);
router.post('/', c.createProduct);

module.exports = router;