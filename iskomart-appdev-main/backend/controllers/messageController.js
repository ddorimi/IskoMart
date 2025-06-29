const pool = require('../config/db'); // Import the MySQL pool
const { createOrder } = require('../models/OrderModel');
const { 
    createMessage, 
    getMessagesByUser, 
    checkUserExists, 
    getUserById 
} = require('../models/MessageModel');

// Send a message
const sendMessage = async (req, res) => {
    const { sender_id, receiver_id, text, order_data } = req.body;

    // Input validation
    if (!sender_id || !receiver_id || !text) {
        return res.status(400).send('Missing required fields');
    }

    if (isNaN(sender_id) || isNaN(receiver_id)) {
        return res.status(400).send('Invalid sender_id or receiver_id');
    }

    if (typeof text !== 'string' || text.trim() === '') {
        return res.status(400).send('Invalid message text');
    }

    // Check if sender and receiver exist
    try {
        const senderExists = await checkUserExists(sender_id);
        const receiverExists = await checkUserExists(receiver_id);

        if (!senderExists || !receiverExists) {
            return res.status(404).send('Sender or receiver not found');
        }

        // If this is an order confirmation message, create the order
        let order_id = null;
        if (order_data && order_data.items && order_data.items.length > 0) {
            order_id = await createOrder(
                order_data.buyer_id,
                order_data.seller_id,
                order_data.total_amount,
                order_data.items,
                order_data.delivery_address || '',
                order_data.notes || ''
            );
        }

        // Create the message using MessageModel
        const newMessage = await createMessage(sender_id, receiver_id, text, order_id);
        res.status(201).json(newMessage);
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).send('Error sending message');
    }
};

// Get messages for a specific user
const getMessages = async (req, res) => {
    const { user_id } = req.params;

    // Input validation
    if (!user_id || isNaN(user_id)) {
        return res.status(400).send('Invalid user_id');
    }

    try {
        const messages = await getMessagesByUser(user_id);
        if (messages.length === 0) {
            return res.status(404).send('No messages found');
        }
        res.status(200).json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).send('Error fetching messages');
    }
};

// Get user by ID (avatar removed)
const getUserByIdController = async (req, res) => {
    const { user_id } = req.params;

    // Input validation
    if (!user_id || isNaN(user_id)) {
        return res.status(400).send('Invalid user_id');
    }

    try {
        const user = await getUserById(user_id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).json({ username: user.username });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send({ message: 'Error fetching user', error: err.message });
    }
};

// Confirm order endpoint
const confirmOrder = async (req, res) => {
    const { buyer_id, seller_id, items, delivery_address, notes, total_amount } = req.body;

    try {
        // Validate required fields
        if (!buyer_id || !seller_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: buyer_id, seller_id, items' 
            });
        }

        // Create the order
        const order_id = await createOrder(
            buyer_id,
            seller_id,
            total_amount,
            items,
            delivery_address || '',
            notes || ''
        );

        // Send confirmation messages to both parties
        const buyerMessage = `Order #${order_id} has been confirmed! Total: ₱${total_amount}`;
        const sellerMessage = `New order #${order_id} received! Total: ₱${total_amount}`;

        // Insert messages into database
        await pool.execute(
            "INSERT INTO messages (sender_id, receiver_id, message_text, order_id) VALUES (?, ?, ?, ?)",
            [seller_id, buyer_id, buyerMessage, order_id]
        );

        await pool.execute(
            "INSERT INTO messages (sender_id, receiver_id, message_text, order_id) VALUES (?, ?, ?, ?)",
            [buyer_id, seller_id, sellerMessage, order_id]
        );

        res.status(201).json({
            success: true,
            message: 'Order confirmed successfully',
            order_id,
            total_amount
        });

    } catch (error) {
        console.error('Error confirming order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to confirm order',
            error: error.message
        });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    const { order_id, status } = req.body;
    const { user_id } = req.params;

    try {
        // Verify the user is involved in this order
        const [orderCheck] = await pool.execute(
            "SELECT buyer_id, seller_id FROM orders WHERE order_id = ?",
            [order_id]
        );

        if (orderCheck.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const order = orderCheck[0];
        if (order.buyer_id != user_id && order.seller_id != user_id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Update order status
        await pool.execute(
            "UPDATE orders SET status = ? WHERE order_id = ?",
            [status, order_id]
        );

        // Send status update message
        const other_user_id = order.buyer_id == user_id ? order.seller_id : order.buyer_id;
        const statusMessage = `Order #${order_id} status updated to: ${status}`;

        await pool.execute(
            "INSERT INTO messages (sender_id, receiver_id, message_text, order_id) VALUES (?, ?, ?, ?)",
            [user_id, other_user_id, statusMessage, order_id]
        );

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order_id,
            status
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

module.exports = { sendMessage, getMessages, getUserByIdController, confirmOrder, updateOrderStatus };
