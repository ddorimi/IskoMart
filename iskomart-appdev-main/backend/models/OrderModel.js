const pool = require('../config/db');

// Create order from cart items
const createOrder = async (user_id, seller_id, total_amount, items, delivery_address = '', notes = '') => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Insert the order
        const [orderResult] = await connection.execute(
            "INSERT INTO orders (buyer_id, seller_id, total_amount, delivery_address, notes, status, order_date) VALUES (?, ?, ?, ?, ?, 'pending', NOW())",
            [user_id, seller_id, total_amount, delivery_address, notes]
        );
        
        const order_id = orderResult.insertId;
        
        // Insert order items
        for (const item of items) {
            await connection.execute(
                "INSERT INTO order_items (order_id, item_id, quantity, price_at_time) VALUES (?, ?, ?, ?)",
                [order_id, item.item_id, item.quantity, item.price_at_time]
            );
        }
        
        await connection.commit();
        return order_id;
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Get orders for a user (as buyer)
const getOrdersByBuyer = async (user_id) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                o.order_id,
                o.buyer_id,
                o.seller_id,
                o.total_amount,
                o.status,
                o.delivery_address,
                o.notes,
                o.order_date,
                u.username as seller_username,
                u.first_name as seller_first_name,
                u.last_name as seller_last_name
            FROM orders o
            JOIN users u ON o.seller_id = u.user_id
            WHERE o.buyer_id = ?
            ORDER BY o.order_date DESC
        `, [user_id]);
        
        return rows;
    } catch (error) {
        throw error;
    }
};

// Get orders for a user (as seller)
const getOrdersBySeller = async (user_id) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                o.order_id,
                o.buyer_id,
                o.seller_id,
                o.total_amount,
                o.status,
                o.delivery_address,
                o.notes,
                o.order_date,
                u.username as buyer_username,
                u.first_name as buyer_first_name,
                u.last_name as buyer_last_name
            FROM orders o
            JOIN users u ON o.buyer_id = u.user_id
            WHERE o.seller_id = ?
            ORDER BY o.order_date DESC
        `, [user_id]);
        
        return rows;
    } catch (error) {
        throw error;
    }
};

// Get order details with items
const getOrderDetails = async (order_id) => {
    try {
        // Get order info
        const [orderRows] = await pool.execute(`
            SELECT 
                o.order_id,
                o.buyer_id,
                o.seller_id,
                o.total_amount,
                o.status,
                o.delivery_address,
                o.notes,
                o.order_date,
                buyer.username as buyer_username,
                buyer.first_name as buyer_first_name,
                buyer.last_name as buyer_last_name,
                seller.username as seller_username,
                seller.first_name as seller_first_name,
                seller.last_name as seller_last_name
            FROM orders o
            JOIN users buyer ON o.buyer_id = buyer.user_id
            JOIN users seller ON o.seller_id = seller.user_id
            WHERE o.order_id = ?
        `, [order_id]);
        
        if (orderRows.length === 0) {
            return null;
        }
        
        // Get order items
        const [itemRows] = await pool.execute(`
            SELECT 
                oi.item_id,
                oi.quantity,
                oi.price_at_time,
                i.item_name,
                i.item_photo,
                i.item_category
            FROM order_items oi
            JOIN items i ON oi.item_id = i.item_id
            WHERE oi.order_id = ?
        `, [order_id]);
        
        return {
            ...orderRows[0],
            items: itemRows
        };
    } catch (error) {
        throw error;
    }
};

// Update order status
const updateOrderStatus = async (order_id, status) => {
    try {
        await pool.execute(
            "UPDATE orders SET status = ? WHERE order_id = ?",
            [status, order_id]
        );
        return { success: true, message: "Order status updated successfully" };
    } catch (error) {
        throw error;
    }
};

// Get orders between two users (for messaging/chat context)
const getOrdersBetweenUsers = async (user1_id, user2_id) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                o.order_id,
                o.buyer_id,
                o.seller_id,
                o.total_amount,
                o.status,
                o.order_date
            FROM orders o
            WHERE (o.buyer_id = ? AND o.seller_id = ?) 
               OR (o.buyer_id = ? AND o.seller_id = ?)
            ORDER BY o.order_date DESC
        `, [user1_id, user2_id, user2_id, user1_id]);
        
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createOrder,
    getOrdersByBuyer,
    getOrdersBySeller,
    getOrderDetails,
    updateOrderStatus,
    getOrdersBetweenUsers
};
