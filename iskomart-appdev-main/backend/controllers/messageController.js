const pool = require('../config/db'); // Import the MySQL pool

// Send a message
const sendMessage = async (req, res) => {

    const { sender_id, receiver_id, text } = req.body;

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
    const checkUserExists = async (user_id) => {
        const query = 'SELECT user_id FROM users WHERE user_id = ?';
        const [rows] = await pool.execute(query, [user_id]);
        return rows.length > 0;
    };

    try {
        const senderExists = await checkUserExists(sender_id);
        const receiverExists = await checkUserExists(receiver_id);

        if (!senderExists || !receiverExists) {
            return res.status(404).send('Sender or receiver not found');
        }

        const query = `
            INSERT INTO messages (sender_id, receiver_id, text, time) 
            VALUES (?, ?, ?, ?)
        `;

        // Format time in MySQL-compatible format
        const time = new Date().toISOString().replace('T', ' ').slice(0, 19);

        const [rows] = await pool.execute(query, [sender_id, receiver_id, text, time]);
        const newMessage = { message_id: rows.insertId, sender_id, receiver_id, text, time };
        res.status(201).json(newMessage);
    } catch (err) {
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

    const query = `
        SELECT messages.*, sender.username AS sender_name, receiver.username AS receiver_name
        FROM messages
        JOIN users AS sender ON messages.sender_id = sender.user_id
        JOIN users AS receiver ON messages.receiver_id = receiver.user_id
        WHERE sender_id = ? OR receiver_id = ?
        ORDER BY time ASC
    `;

    try {
        const [rows] = await pool.execute(query, [user_id, user_id]);
        if (rows.length === 0) {
            return res.status(404).send('No messages found');
        }
        res.status(200).json(rows);
    } catch (err) {;
        res.status(500).send('Error fetching messages');
    }
};

// Get user by ID (avatar removed)
const getUserById = async (req, res) => {
    const { user_id } = req.params;

    // Input validation
    if (!user_id || isNaN(user_id)) {
        return res.status(400).send('Invalid user_id');
    }

    const query = 'SELECT username FROM users WHERE user_id = ?'; // Removed avatar
    try {
        const [rows] = await pool.execute(query, [user_id]);
        if (rows.length === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        res.status(500).send({ message: 'Error fetching user', error: err.message });
    }
};

module.exports = { sendMessage, getMessages, getUserById };
