const express = require('express');
const router = express.Router();
const { getItems, getUserItems, createItem, toggleLike, unlikeItem } = require('../controllers/itemController'); // Ensure the correct import

// Routes
router.get('/get_items', getItems); // Get all items
router.get('/items/:user_id', getUserItems); // Get user's items
router.post('/items', createItem); // Create a new item
router.post('/items/:item_id/like', toggleLike);

router.post('/items/:item_id/unlike', unlikeItem); // Unlike an item


module.exports = router;
