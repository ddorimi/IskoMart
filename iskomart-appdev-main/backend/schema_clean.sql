-- Complete Database Schema for IskoMart Application

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS iskomart;
USE iskomart;

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS user_likes;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS item_views;

-- Users table with profile image support
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) DEFAULT NULL,
    last_name VARCHAR(100) DEFAULT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(500) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Items table with image support
CREATE TABLE items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    item_price DECIMAL(10, 2) NOT NULL,
    item_photo VARCHAR(500) DEFAULT NULL,
    item_category ENUM('Foods', 'Supplies', 'Gadgets', 'Others') NOT NULL,
    likes INT DEFAULT 0,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Cart table
CREATE TABLE cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_item (user_id, item_id)
);

-- Orders table
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- Messages table for chat functionality
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    order_id INT DEFAULT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User likes table to track which items users have liked
CREATE TABLE user_likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_like (user_id, item_id)
);

-- Additional tables for enhanced functionality

-- Notifications table for user notifications
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('order', 'message', 'like', 'system') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    related_id INT DEFAULT NULL, -- Can reference order_id, message_id, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Reviews/Ratings table for items and sellers
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id INT NOT NULL,
    reviewed_user_id INT NOT NULL, -- The seller being reviewed
    order_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (reviewer_id, order_id)
);

-- User sessions table for authentication
CREATE TABLE user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Item views/analytics table
CREATE TABLE item_views (
    view_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    user_id INT DEFAULT NULL, -- NULL for anonymous views
    ip_address VARCHAR(45),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_item_id ON cart(item_id);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category ON items(item_category);
CREATE INDEX idx_items_date ON items(date);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_item_id ON order_items(item_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX idx_user_likes_item_id ON user_likes(item_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX idx_reviews_order_id ON reviews(order_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_item_views_item_id ON item_views(item_id);
CREATE INDEX idx_item_views_user_id ON item_views(user_id);
CREATE INDEX idx_item_views_viewed_at ON item_views(viewed_at);

-- Insert sample data for testing
INSERT INTO users (username, first_name, last_name, email, password, profile_image) VALUES 
('john_doe', 'John', 'Doe', 'john@example.com', '$2b$10$example_hash1', 'https://via.placeholder.com/150'),
('jane_smith', 'Jane', 'Smith', 'jane@example.com', '$2b$10$example_hash2', 'https://via.placeholder.com/150'),
('seller_user', 'Seller', 'User', 'seller@example.com', '$2b$10$example_hash3', 'https://via.placeholder.com/150');

INSERT INTO items (user_id, item_name, item_description, item_price, item_photo, item_category, likes) VALUES 
(2, 'Fresh Apple Pie', 'Homemade apple pie with fresh ingredients', 150.00, 'https://via.placeholder.com/300x200', 'Foods', 5),
(2, 'Notebook Set', 'High-quality notebooks for students', 75.00, 'https://via.placeholder.com/300x200', 'Supplies', 3),
(3, 'Wireless Headphones', 'Bluetooth wireless headphones', 2500.00, 'https://via.placeholder.com/300x200', 'Gadgets', 12),
(3, 'Coffee Mug', 'Beautiful ceramic coffee mug', 250.00, 'https://via.placeholder.com/300x200', 'Others', 2);

INSERT INTO notifications (user_id, title, message, type) VALUES 
(1, 'Welcome to IskoMart!', 'Thank you for joining our marketplace community.', 'system'),
(2, 'New Order Received', 'You have received a new order for Fresh Apple Pie.', 'order'),
(3, 'Item Liked', 'Someone liked your Wireless Headphones!', 'like');

-- Sample reviews
INSERT INTO reviews (reviewer_id, reviewed_user_id, order_id, rating, review_text) VALUES 
(1, 2, 1, 5, 'Excellent seller! Fast delivery and great product quality.'),
(1, 3, 2, 4, 'Good product, but packaging could be better.');

-- Add some sample item views
INSERT INTO item_views (item_id, user_id, ip_address) VALUES 
(1, 1, '192.168.1.100'),
(1, 3, '192.168.1.101'),
(2, 1, '192.168.1.100'),
(3, 2, '192.168.1.102');

-- Add triggers for automatic notifications
DELIMITER //

CREATE TRIGGER after_order_insert
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (NEW.seller_id, 'New Order Received', 
            CONCAT('You have received a new order #', NEW.order_id), 'order', NEW.order_id);
    
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (NEW.buyer_id, 'Order Placed Successfully', 
            CONCAT('Your order #', NEW.order_id, ' has been placed successfully'), 'order', NEW.order_id);
END//

CREATE TRIGGER after_message_insert
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (NEW.receiver_id, 'New Message', 
            CONCAT('You have received a new message'), 'message', NEW.message_id);
END//

CREATE TRIGGER after_like_insert
AFTER INSERT ON user_likes
FOR EACH ROW
BEGIN
    DECLARE item_owner_id INT;
    SELECT user_id INTO item_owner_id FROM items WHERE item_id = NEW.item_id;
    
    IF item_owner_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES (item_owner_id, 'Item Liked', 
                'Someone liked your item!', 'like', NEW.item_id);
    END IF;
END//

DELIMITER ;

-- Create views for common queries
CREATE VIEW user_stats AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    COUNT(DISTINCT i.item_id) as total_items_posted,
    COUNT(DISTINCT o_buyer.order_id) as total_orders_made,
    COUNT(DISTINCT o_seller.order_id) as total_orders_received,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(DISTINCT r.review_id) as total_reviews_received,
    u.created_at as member_since
FROM users u
LEFT JOIN items i ON u.user_id = i.user_id
LEFT JOIN orders o_buyer ON u.user_id = o_buyer.buyer_id
LEFT JOIN orders o_seller ON u.user_id = o_seller.seller_id
LEFT JOIN reviews r ON u.user_id = r.reviewed_user_id
GROUP BY u.user_id, u.username, u.email, u.created_at;

CREATE VIEW popular_items AS
SELECT 
    i.*,
    u.username as seller_name,
    COUNT(DISTINCT ul.user_id) as total_likes,
    COUNT(DISTINCT iv.view_id) as total_views,
    COUNT(DISTINCT oi.order_item_id) as total_orders
FROM items i
JOIN users u ON i.user_id = u.user_id
LEFT JOIN user_likes ul ON i.item_id = ul.item_id
LEFT JOIN item_views iv ON i.item_id = iv.item_id
LEFT JOIN order_items oi ON i.item_id = oi.item_id
WHERE i.is_available = TRUE
GROUP BY i.item_id
ORDER BY total_likes DESC, total_views DESC, total_orders DESC;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE GetUserDashboard(IN p_user_id INT)
BEGIN
    -- Get user info with stats
    SELECT * FROM user_stats WHERE user_id = p_user_id;
    
    -- Get recent orders as buyer
    SELECT o.*, u.username as seller_name 
    FROM orders o 
    JOIN users u ON o.seller_id = u.user_id 
    WHERE o.buyer_id = p_user_id 
    ORDER BY o.order_date DESC 
    LIMIT 5;
    
    -- Get recent orders as seller
    SELECT o.*, u.username as buyer_name 
    FROM orders o 
    JOIN users u ON o.buyer_id = u.user_id 
    WHERE o.seller_id = p_user_id 
    ORDER BY o.order_date DESC 
    LIMIT 5;
    
    -- Get unread notifications
    SELECT * FROM notifications 
    WHERE user_id = p_user_id AND is_read = FALSE 
    ORDER BY created_at DESC 
    LIMIT 10;
END//

CREATE PROCEDURE SearchItems(
    IN p_search_term VARCHAR(255),
    IN p_category VARCHAR(50),
    IN p_min_price DECIMAL(10,2),
    IN p_max_price DECIMAL(10,2),
    IN p_sort_by VARCHAR(20)
)
BEGIN
    SET @sql = 'SELECT i.*, u.username as seller_name, 
                       COUNT(DISTINCT ul.user_id) as like_count,
                       COUNT(DISTINCT iv.view_id) as view_count
                FROM items i 
                JOIN users u ON i.user_id = u.user_id 
                LEFT JOIN user_likes ul ON i.item_id = ul.item_id
                LEFT JOIN item_views iv ON i.item_id = iv.item_id
                WHERE i.is_available = TRUE';
    
    IF p_search_term IS NOT NULL AND p_search_term != '' THEN
        SET @sql = CONCAT(@sql, ' AND (i.item_name LIKE "%', p_search_term, '%" OR i.item_description LIKE "%', p_search_term, '%")');
    END IF;
    
    IF p_category IS NOT NULL AND p_category != '' THEN
        SET @sql = CONCAT(@sql, ' AND i.item_category = "', p_category, '"');
    END IF;
    
    IF p_min_price IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND i.item_price >= ', p_min_price);
    END IF;
    
    IF p_max_price IS NOT NULL THEN
        SET @sql = CONCAT(@sql, ' AND i.item_price <= ', p_max_price);
    END IF;
    
    SET @sql = CONCAT(@sql, ' GROUP BY i.item_id');
    
    IF p_sort_by = 'price_low' THEN
        SET @sql = CONCAT(@sql, ' ORDER BY i.item_price ASC');
    ELSEIF p_sort_by = 'price_high' THEN
        SET @sql = CONCAT(@sql, ' ORDER BY i.item_price DESC');
    ELSEIF p_sort_by = 'popular' THEN
        SET @sql = CONCAT(@sql, ' ORDER BY like_count DESC, view_count DESC');
    ELSEIF p_sort_by = 'newest' THEN
        SET @sql = CONCAT(@sql, ' ORDER BY i.created_at DESC');
    ELSE
        SET @sql = CONCAT(@sql, ' ORDER BY i.created_at DESC');
    END IF;
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END//

DELIMITER ;

-- Final verification queries
SELECT 'Database schema created successfully!' as Status;
SELECT 'Total tables created:' as Info, COUNT(*) as Count FROM information_schema.tables WHERE table_schema = 'iskomart';
SELECT 'Sample data inserted' as Status, 
       (SELECT COUNT(*) FROM users) as Users,
       (SELECT COUNT(*) FROM items) as Items,
       (SELECT COUNT(*) FROM notifications) as Notifications;
