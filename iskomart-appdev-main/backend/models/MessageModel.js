const pool = require('../config/db');

// Send a message
const createMessage = async (sender_id, receiver_id, message_text, order_id = null) => {
    try {
        const query = `
            INSERT INTO messages (sender_id, receiver_id, message_text, order_id, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        `;
        
        const [result] = await pool.execute(query, [sender_id, receiver_id, message_text, order_id]);
        
        return {
            message_id: result.insertId,
            sender_id,
            receiver_id,
            message_text,
            order_id,
            created_at: new Date()
        };
    } catch (error) {
        throw error;
    }
};

// Get all messages for a user
const getMessagesByUser = async (user_id) => {
    try {
        const query = `
            SELECT 
                m.*,
                sender.username AS sender_name,
                receiver.username AS receiver_name
            FROM messages m
            JOIN users AS sender ON m.sender_id = sender.user_id
            JOIN users AS receiver ON m.receiver_id = receiver.user_id
            WHERE m.sender_id = ? OR m.receiver_id = ?
            ORDER BY m.created_at ASC
        `;
        
        const [rows] = await pool.execute(query, [user_id, user_id]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Get messages between two specific users
const getMessagesBetweenUsers = async (user1_id, user2_id) => {
    try {
        const query = `
            SELECT 
                m.*,
                sender.username AS sender_name,
                receiver.username AS receiver_name
            FROM messages m
            JOIN users AS sender ON m.sender_id = sender.user_id
            JOIN users AS receiver ON m.receiver_id = receiver.user_id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `;
        
        const [rows] = await pool.execute(query, [user1_id, user2_id, user2_id, user1_id]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Check if user exists
const checkUserExists = async (user_id) => {
    try {
        const query = 'SELECT user_id FROM users WHERE user_id = ?';
        const [rows] = await pool.execute(query, [user_id]);
        return rows.length > 0;
    } catch (error) {
        throw error;
    }
};

// Get user by ID
const getUserById = async (user_id) => {
    try {
        const query = 'SELECT user_id, username, first_name, last_name FROM users WHERE user_id = ?';
        const [rows] = await pool.execute(query, [user_id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
};

// Get latest messages for each conversation
const getLatestMessagesByUser = async (user_id) => {
    try {
        const query = `
            SELECT 
                m1.*,
                sender.username AS sender_name,
                receiver.username AS receiver_name
            FROM messages m1
            JOIN users AS sender ON m1.sender_id = sender.user_id
            JOIN users AS receiver ON m1.receiver_id = receiver.user_id
            WHERE m1.created_at = (
                SELECT MAX(m2.created_at)
                FROM messages m2
                WHERE (m2.sender_id = m1.sender_id AND m2.receiver_id = m1.receiver_id)
                   OR (m2.sender_id = m1.receiver_id AND m2.receiver_id = m1.sender_id)
            )
            AND (m1.sender_id = ? OR m1.receiver_id = ?)
            ORDER BY m1.created_at DESC
        `;
        
        const [rows] = await pool.execute(query, [user_id, user_id]);
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createMessage,
    getMessagesByUser,
    getMessagesBetweenUsers,
    checkUserExists,
    getUserById,
    getLatestMessagesByUser
};
