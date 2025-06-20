const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import the registerUser, loginUser, and getUsers functions
const { registerUser, loginUser, getUsers } = require('./controllers/userController');
const messageRoutes = require('./routes/messageRoutes'); // Import message routes

// Import item-related functions
const itemRoutes = require('./routes/itemRoutes'); // Import item routes

const app = express();
app.use(express.json());

app.use(cors()); // Enable CORS for all origins

// Login and register routes
app.post('/login', (req, res) => loginUser(req, res));
app.post('/register', (req, res) => registerUser(req, res));
app.get('/users/:user_id', (req, res) => getUsers(req, res)); // Changed this to use user_id as a param

app.use('/api', itemRoutes); // Add item-related routes with the '/api' prefix

app.use('/text', messageRoutes); // Use message-related routes

// Set up the server to listen on a specified port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
