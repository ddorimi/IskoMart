const express = require('express');
const router = express.Router();
const { 
    placeOrder,
    getBuyerOrders,
    getSellerOrders,
    getOrderById,
    updateOrder,
    getOrdersBetween
} = require('../controllers/orderController');

// Routes
router.post('/place', placeOrder); // Place new order from cart
router.get('/buyer/:user_id', getBuyerOrders); // Get orders for buyer
router.get('/seller/:user_id', getSellerOrders); // Get orders for seller
router.get('/:order_id', getOrderById); // Get order details
router.put('/:order_id/status', updateOrder); // Update order status
router.get('/between/:user1_id/:user2_id', getOrdersBetween); // Get orders between two users

module.exports = router;
