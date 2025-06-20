const { getAllItems, getItemsByUser } = require('../models/ItemModel');
const pool = require('../config/db'); 

// Get all items
const getItems = async (req, res) => {
    try {
        const items = await getAllItems();
        res.status(200).json(items);
    } catch (err) {
        console.error("Error fetching items:", err);
        res.status(500).json({ message: "Error fetching items" });
    }
};

// Get items by user ID
const getUserItems = async (req, res) => {
    const { user_id } = req.params; // Getting user_id from the URL parameter
    try {
        const items = await getItemsByUser(user_id); // Function to get items by user ID
        res.status(200).json(items); // Sending items as JSON
    } catch (err) {
        console.error("Error fetching user items:", err);
        res.status(500).json({ message: "Error fetching user items" });
    }
};

// Like an item
const toggleLike = async (req, res) => {
    const { item_id } = req.params; // Get the item ID from the URL parameter
    try {
        // Update the likes by incrementing or decrementing
        await pool.execute('UPDATE items SET likes = likes + 1 WHERE item_id = ?', [item_id]);

        res.status(200).json({ message: "Item liked successfully" });
    } catch (error) {
        console.error("Error liking item:", error);
        res.status(500).json({ message: "Error liking item", error: error.message });
    }
};

// Unlike an item
const unlikeItem = async (req, res) => {
    const { item_id } = req.params; // Get the item ID from the URL parameter
    try {
        // Update the likes by decrementing
        await pool.execute('UPDATE items SET likes = likes - 1 WHERE item_id = ?', [item_id]);

        res.status(200).json({ message: "Item unliked successfully" });
    } catch (error) {
        console.error("Error unliking item:", error);
        res.status(500).json({ message: "Error unliking item", error: error.message });
    }
};

// Inside createItem function
const createItem = async (req, res) => {
  const { item_name, item_price, item_category, user_id } = req.body;
  // const item_photo = req.file?.path; // Assuming multer is used, commented out as per the request

  // Check if all required fields are provided
  if (!item_name || !item_price || !item_category || !user_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Insert item into the database
  try {
    await pool.execute(
      'INSERT INTO items (item_photo, item_name, item_price, item_category, user_id, date, likes) VALUES (?, ?, ?, ?, ?, NOW(), 0)',
      [null, item_name, item_price, item_category, user_id] // item_photo is set to null
    );
    res.status(201).json({ message: 'Item added successfully' });
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).json({ message: 'Error adding item', error: err.message });
  }
};

module.exports = { getItems, getUserItems, createItem, toggleLike, unlikeItem };
