const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getUserById } = require('../controllers/messageController'); // Corrected import

// Route to send a new message
router.post('/messages', sendMessage);

// Route to get messages for a user
router.get('/messages/:user_id', getMessages);

// Route to get user info by user_id (for the receiver)
router.get('/messages/user/:user_id', getUserById);

module.exports = router;
