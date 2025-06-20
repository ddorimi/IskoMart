// controllers/userController.js
const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Import the db connection

// Register user function
const registerUser = async (req, res) => {
  const { first_name, last_name, username, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if username or email already exists
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);

    if (rows.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Insert the user into the database
    await db.query(
      'INSERT INTO users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, username, email, hashedPassword]
    );

    // Return success message
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};

// Login user function
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query the database to find the user
    const [result] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, result[0].password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Return success message with user_id
    res.status(200).json({
      message: 'Login successful',
      userData: {
        user_id: result[0].user_id, // Include user_id in the response
        username: result[0].username,
      },
    });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ message: 'Error logging in user', error: err.message });
  }
};

// Get user info function
const getUsers = async (req, res) => {
  const { user_id } = req.params; // Expect user_id as a parameter in the URL

  try {
    // Query the database to get the user's info by user_id
    const [result] = await db.query('SELECT first_name, last_name, username, email FROM users WHERE user_id = ?', [user_id]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user info
    res.status(200).json({
      message: 'User info retrieved successfully',
      userInfo: result[0],
    });
  } catch (err) {
    console.error('Error retrieving user info:', err);
    res.status(500).json({ message: 'Error retrieving user info', error: err.message });
  }
};

module.exports = { registerUser, loginUser, getUsers };

