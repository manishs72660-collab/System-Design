const express = require('express');
const router = express.Router();
const c = require('../controllers/productController');

router.get('/search', c.searchProducts); // /:id se pehle hona zaroori hai
router.get('/', c.getProducts);
router.get('/:id', c.getProductById);
router.post('/', c.createProduct);

module.exports = router;