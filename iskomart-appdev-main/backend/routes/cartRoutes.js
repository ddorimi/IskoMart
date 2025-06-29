const express = require('express');
const router = express.Router();
const {
    addItemToCart,
    getUserCart,
    updateCartItem,
    removeCartItem,
    clearUserCart
} = require('../controllers/cartController');

// Add item to cart
router.post('/add', addItemToCart);

// Get user's cart
router.get('/:user_id', getUserCart);

// Update cart item quantity
router.put('/update', updateCartItem);

// Remove item from cart
router.delete('/remove', removeCartItem);

// Clear entire cart
router.delete('/clear/:user_id', clearUserCart);

module.exports = router;
