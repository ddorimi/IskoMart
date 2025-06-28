const pool = require('../config/db');

const getAllItems = async () => {
    const [rows] = await pool.execute(`
        SELECT 
            items.item_id, 
            items.item_name, 
            items.item_description,
            items.item_price, 
            items.likes, 
            items.item_photo, 
            items.user_id AS item_user_id, 
            items.item_category,
            items.date,
            items.is_available,
            users.username,
            users.profile_image
        FROM items 
        JOIN users ON items.user_id = users.user_id 
        WHERE items.is_available = TRUE
        ORDER BY items.date DESC
    `);
    console.log('Fetched Items:', rows); // Log the fetched data
    return rows;
};

// Get items by category
const getItemsByCategory = async (category) => {
    const [rows] = await pool.execute(`
        SELECT 
            items.item_id, 
            items.item_name, 
            items.item_description,
            items.item_price, 
            items.likes, 
            items.item_photo, 
            items.user_id AS item_user_id, 
            items.item_category,
            items.date,
            users.username,
            users.profile_image
        FROM items 
        JOIN users ON items.user_id = users.user_id 
        WHERE items.item_category = ? AND items.is_available = TRUE
        ORDER BY items.date DESC
    `, [category]);
    return rows;
};

// Get items by user_id (for Profile screen)
const getItemsByUser = async (user_id) => {
    const [rows] = await pool.execute("SELECT * FROM items WHERE user_id = ? ORDER BY date DESC", [user_id]);
    return rows;
};

// Add a new item (with an image)
const addItem = async (user_id, item_name, item_description, item_price, item_photo, item_category) => {
    const sql = "INSERT INTO items (user_id, item_name, item_description, date, item_price, item_photo, item_category, likes) VALUES (?, ?, ?, NOW(), ?, ?, ?, 0)";
    const [result] = await pool.execute(sql, [user_id, item_name, item_description, item_price, item_photo, item_category]);
    return result.insertId; // Return the new item ID
};

// Like an item
const likeItem = async (item_id, user_id) => {
    // First check if user already liked this item
    const [existingLike] = await pool.execute("SELECT * FROM user_likes WHERE user_id = ? AND item_id = ?", [user_id, item_id]);
    
    if (existingLike.length === 0) {
        // Add like record and increment likes count
        await pool.execute("INSERT INTO user_likes (user_id, item_id) VALUES (?, ?)", [user_id, item_id]);
        await pool.execute("UPDATE items SET likes = likes + 1 WHERE item_id = ?", [item_id]);
        return true;
    }
    return false;
};

// Unlike an item
const unlikeItem = async (item_id, user_id) => {
    // Remove like record and decrement likes count
    const [result] = await pool.execute("DELETE FROM user_likes WHERE user_id = ? AND item_id = ?", [user_id, item_id]);
    if (result.affectedRows > 0) {
        await pool.execute("UPDATE items SET likes = likes - 1 WHERE item_id = ?", [item_id]);
        return true;
    }
    return false;
};

// Check if user has liked an item
const hasUserLikedItem = async (user_id, item_id) => {
    const [rows] = await pool.execute("SELECT * FROM user_likes WHERE user_id = ? AND item_id = ?", [user_id, item_id]);
    return rows.length > 0;
};

// Get item by ID
const getItemById = async (item_id) => {
    const [rows] = await pool.execute(`
        SELECT 
            items.*, 
            users.username,
            users.profile_image
        FROM items 
        JOIN users ON items.user_id = users.user_id 
        WHERE items.item_id = ?
    `, [item_id]);
    return rows[0];
};

module.exports = { 
    getAllItems, 
    getItemsByCategory,
    getItemsByUser, 
    addItem, 
    likeItem, 
    unlikeItem, 
    hasUserLikedItem,
    getItemById
};
