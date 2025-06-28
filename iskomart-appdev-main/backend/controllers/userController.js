// controllers/userController.js
const bcrypt = require('bcryptjs');
const { createUser, findUserByUsername, findUserById } = require('../models/UserModel');

// Register user function
const registerUser = async (req, res) => {
  const { username, first_name, last_name, email, password, phone, address } = req.body;

  try {
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check if username already exists
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create the user using the UserModel
    await createUser(username, email, password, first_name, last_name, phone, address);

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
    // Find user by username
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Return success message with user data
    res.status(200).json({
      message: 'Login successful',
      userData: {
        user_id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
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
    // Get user by ID using UserModel
    const user = await findUserById(user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user info
    res.status(200).json({
      message: 'User info retrieved successfully',
      userInfo: {
        user_id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        address: user.address
      },
    });
  } catch (err) {
    console.error('Error retrieving user info:', err);
    res.status(500).json({ message: 'Error retrieving user info', error: err.message });
  }
};

module.exports = { registerUser, loginUser, getUsers };

