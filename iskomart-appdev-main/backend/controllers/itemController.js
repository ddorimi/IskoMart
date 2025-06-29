const { 
    getAllItems, 
    getItemsByUser, 
    addItem, 
    likeItem, 
    unlikeItem, 
    hasUserLikedItem,
    getItemsByCategory,
    getItemById 
} = require('../models/ItemModel');

// Get all items with like status for user
const getItems = async (req, res) => {
    try {
        const { user_id } = req.query;
        const items = await getAllItems();
        
        // If user_id is provided, check which items the user has liked
        if (user_id) {
            for (let item of items) {
                item.liked = await hasUserLikedItem(user_id, item.item_id);
            }
        }
        
        res.status(200).json(items);
    } catch (err) {
        console.error("Error fetching items:", err);
        res.status(500).json({ message: "Error fetching items" });
    }
};

// Get items by category
const getItemsByCategory_Controller = async (req, res) => {
    const { category } = req.params;
    const { user_id } = req.query;
    
    try {
        const items = await getItemsByCategory(category);
        
        // If user_id is provided, check which items the user has liked
        if (user_id) {
            for (let item of items) {
                item.liked = await hasUserLikedItem(user_id, item.item_id);
            }
        }
        
        res.status(200).json(items);
    } catch (err) {
        console.error("Error fetching items by category:", err);
        res.status(500).json({ message: "Error fetching items by category" });
    }
};

// Get items by user ID
const getUserItems = async (req, res) => {
    const { user_id } = req.params;
    try {
        const items = await getItemsByUser(user_id);
        res.status(200).json(items);
    } catch (err) {
        console.error("Error fetching user items:", err);
        res.status(500).json({ message: "Error fetching user items" });
    }
};

// Add new item
const createItem = async (req, res) => {
    const { user_id, item_name, item_description, item_price, item_photo, item_category } = req.body;
    
    try {
        if (!user_id || !item_name || !item_price || !item_category) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        const item_id = await addItem(user_id, item_name, item_description || item_name, item_price, item_photo, item_category);
        
        res.status(201).json({ 
            message: "Item created successfully", 
            item_id: item_id 
        });
    } catch (err) {
        console.error("Error creating item:", err);
        res.status(500).json({ message: "Error creating item" });
    }
};

// Like an item
const toggleLike = async (req, res) => {
    const { item_id } = req.params;
    const { user_id } = req.body;
    
    try {
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const success = await likeItem(item_id, user_id);
        
        if (success) {
            res.status(200).json({ message: "Item liked successfully" });
        } else {
            res.status(400).json({ message: "Item already liked by user" });
        }
    } catch (error) {
        console.error("Error liking item:", error);
        res.status(500).json({ message: "Error liking item", error: error.message });
    }
};

// Unlike an item
const toggleUnlike = async (req, res) => {
    const { item_id } = req.params;
    const { user_id } = req.body;
    
    try {
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const success = await unlikeItem(item_id, user_id);
        
        if (success) {
            res.status(200).json({ message: "Item unliked successfully" });
        } else {
            res.status(400).json({ message: "Item not liked by user" });
        }
    } catch (error) {
        console.error("Error unliking item:", error);
        res.status(500).json({ message: "Error unliking item", error: error.message });
    }
};

module.exports = { 
    getItems, 
    getUserItems, 
    createItem, 
    toggleLike, 
    toggleUnlike,
    getItemsByCategory_Controller
};
