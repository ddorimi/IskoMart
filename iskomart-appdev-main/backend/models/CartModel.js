const pool = require('../config/db');

// Add item to cart
const addToCart = async (user_id, item_id, quantity = 1) => {
    try {
        // Check if item already exists in cart
        const [existingItem] = await pool.execute(
            "SELECT * FROM cart WHERE user_id = ? AND item_id = ?", 
            [user_id, item_id]
        );

        if (existingItem.length > 0) {
            // Update quantity if item exists
            await pool.execute(
                "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND item_id = ?",
                [quantity, user_id, item_id]
            );
            return { success: true, message: "Cart updated successfully" };
        } else {
            // Add new item to cart
            const sql = "INSERT INTO cart (user_id, item_id, quantity, added_at) VALUES (?, ?, ?, NOW())";
            await pool.execute(sql, [user_id, item_id, quantity]);
            return { success: true, message: "Item added to cart successfully" };
        }
    } catch (error) {
        throw error;
    }
};

// Get cart items for a user
const getCartItems = async (user_id) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                c.cart_id,
                c.user_id,
                c.item_id,
                c.quantity,
                c.added_at,
                i.item_name,
                i.item_price,
                i.item_photo,
                i.item_category,
                u.username as seller_username,
                i.user_id as seller_id
            FROM cart c
            JOIN items i ON c.item_id = i.item_id
            JOIN users u ON i.user_id = u.user_id
            WHERE c.user_id = ?
            ORDER BY c.added_at DESC
        `, [user_id]);
        
        return rows;
    } catch (error) {
        throw error;
    }
};

// Update cart item quantity
const updateCartQuantity = async (cart_id, quantity) => {
    try {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            await pool.execute("DELETE FROM cart WHERE cart_id = ?", [cart_id]);
            return { success: true, message: "Item removed from cart" };
        } else {
            // Update quantity
            await pool.execute(
                "UPDATE cart SET quantity = ? WHERE cart_id = ?",
                [quantity, cart_id]
            );
            return { success: true, message: "Cart quantity updated" };
        }
    } catch (error) {
        throw error;
    }
};

// Remove item from cart
const removeFromCart = async (cart_id) => {
    try {
        await pool.execute("DELETE FROM cart WHERE cart_id = ?", [cart_id]);
        return { success: true, message: "Item removed from cart" };
    } catch (error) {
        throw error;
    }
};

// Clear entire cart for user
const clearCart = async (user_id) => {
    try {
        await pool.execute("DELETE FROM cart WHERE user_id = ?", [user_id]);
        return { success: true, message: "Cart cleared successfully" };
    } catch (error) {
        throw error;
    }
};

// Get specific cart items by IDs for order placement
const getCartItemsByIds = async (user_id, item_ids) => {
    try {
        if (!item_ids || item_ids.length === 0) {
            return [];
        }
        
        // Create placeholders for the IN clause
        const placeholders = item_ids.map(() => '?').join(',');
        
        const [rows] = await pool.execute(`
            SELECT 
                c.cart_id,
                c.user_id,
                c.item_id,
                c.quantity,
                c.added_at,
                i.item_name,
                i.item_price,
                i.item_photo,
                i.item_category,
                u.username as seller_name,
                i.user_id as seller_id
            FROM cart c
            JOIN items i ON c.item_id = i.item_id
            JOIN users u ON i.user_id = u.user_id
            WHERE c.user_id = ? AND c.cart_id IN (${placeholders})
            ORDER BY c.added_at DESC
        `, [user_id, ...item_ids]);
        
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    addToCart,
    getCartItems,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartItemsByIds
};
