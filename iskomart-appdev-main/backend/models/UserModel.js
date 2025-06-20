const pool = require('../config/db'); // Import DB connection
const bcrypt = require('bcrypt');

// Find user by username
const findUserByUsername = async (username) => {
    const [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
    return rows[0]; // Return the first match
};

// Register a new user
const createUser = async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    await pool.execute(sql, [username, email, hashedPassword]);
};

module.exports = { findUserByUsername, createUser };
