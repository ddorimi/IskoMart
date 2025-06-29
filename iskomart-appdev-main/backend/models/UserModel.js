const pool = require('../config/db'); // Import DB connection
const bcrypt = require('bcrypt');

// Find user by username
const findUserByUsername = async (username) => {
    const [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
    return rows[0]; // Return the first match
};

// Find user by ID
const findUserById = async (user_id) => {
    const [rows] = await pool.execute("SELECT user_id, username, first_name, last_name, email, profile_image, phone, address, created_at FROM users WHERE user_id = ?", [user_id]);
    return rows[0];
};

// Register a new user
const createUser = async (username, email, password, first_name = '', last_name = '', phone = '', address = '', profile_image = null) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, email, password, first_name, last_name, phone, address, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    await pool.execute(sql, [username, email, hashedPassword, first_name, last_name, phone, address, profile_image]);
};

// Update user profile
const updateUserProfile = async (user_id, updates) => {
    const fields = [];
    const values = [];
    
    if (updates.username) {
        fields.push('username = ?');
        values.push(updates.username);
    }
    if (updates.email) {
        fields.push('email = ?');
        values.push(updates.email);
    }
    if (updates.profile_image) {
        fields.push('profile_image = ?');
        values.push(updates.profile_image);
    }
    if (updates.phone) {
        fields.push('phone = ?');
        values.push(updates.phone);
    }
    if (updates.address) {
        fields.push('address = ?');
        values.push(updates.address);
    }
    
    if (fields.length === 0) return;
    
    values.push(user_id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
    await pool.execute(sql, values);
};

module.exports = { findUserByUsername, findUserById, createUser, updateUserProfile };
