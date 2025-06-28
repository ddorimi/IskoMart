const express = require('express');
const router = express.Router();
const { 
    getItems, 
    getUserItems, 
    createItem, 
    toggleLike, 
    toggleUnlike,
    getItemsByCategory_Controller
} = require('../controllers/itemController');

// Routes
router.get('/get_items', getItems); // Get all items with optional user_id query param
router.get('/items/category/:category', getItemsByCategory_Controller); // Get items by category
router.get('/items/user/:user_id', getUserItems); // Get user's items
router.post('/items', createItem); // Create a new item
router.post('/items/:item_id/like', toggleLike); // Like an item
router.post('/items/:item_id/unlike', toggleUnlike); // Unlike an item

module.exports = router;
