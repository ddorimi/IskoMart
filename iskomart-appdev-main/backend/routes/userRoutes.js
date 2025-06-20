const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', (req, res) => loginUser(req, res));
router.post('/register', (req, res) => registerUser(req, res));
router.get('/users', (req, res) => getUsers(req, res));

module.exports = router;
