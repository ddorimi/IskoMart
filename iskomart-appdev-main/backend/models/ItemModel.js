const pool = require('../config/db');

const getAllItems = async () => {
    const [rows] = await pool.execute(
      "SELECT items.item_id, items.item_name, items.item_price, items.likes, items.item_photo, items.user_id AS item_user_id, items.item_category, users.username FROM items JOIN users ON items.user_id = users.user_id ORDER BY items.date DESC"
    );
    console.log('Fetched Items:', rows); // Log the fetched data
    return rows;
};



// Get items by user_id (for Profile screen)
const getItemsByUser = async (user_id) => {
    const [rows] = await pool.execute("SELECT * FROM items WHERE user_id = ?", [user_id]);
    return rows;
};

// Add a new item (with an image)
const addItem = async (user_id, item_price, item_photo, item_category) => {
    const sql = "INSERT INTO items (user_id, date, item_price, item_photo, item_category, likes) VALUES (?, NOW(), ?, ?, ?, 0)";
    const [result] = await pool.execute(sql, [user_id, item_price, item_photo, item_category]);
    return result.insertId; // Return the new item ID
};

// Like an item
const likeItem = async (item_id) => {
    await pool.execute("UPDATE items SET likes = likes + 1 WHERE item_id = ?", [item_id]);
};

// Unlike an item
const unlikeItem = async (item_id) => {
    await pool.execute("UPDATE items SET likes = likes - 1 WHERE item_id = ?", [item_id]);
};

module.exports = { getAllItems, getItemsByUser, addItem, likeItem, unlikeItem };
