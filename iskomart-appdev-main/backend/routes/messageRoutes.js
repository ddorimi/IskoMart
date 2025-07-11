const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getUserByIdController, confirmOrder, updateOrderStatus } = require('../controllers/messageController');

// Route to send a new message
router.post('/messages', sendMessage);

// Route to get messages for a user
router.get('/messages/:user_id', getMessages);

// Route to get user info by user_id (for the receiver)
router.get('/messages/user/:user_id', getUserByIdController);

// Route to confirm order
router.post('/orders/confirm', confirmOrder);

// Route to update order status
router.put('/orders/status/:user_id', updateOrderStatus);

module.exports = router;
