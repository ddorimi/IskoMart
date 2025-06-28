const { 
    createOrder, 
    getOrdersByBuyer, 
    getOrdersBySeller, 
    getOrderDetails, 
    updateOrderStatus,
    getOrdersBetweenUsers
} = require('../models/OrderModel');
const { getCartItemsByIds } = require('../models/CartModel');

// Create order from selected cart items
const placeOrder = async (req, res) => {
    try {
        const { user_id, selected_items, delivery_address, notes } = req.body;
        
        if (!user_id || !selected_items || selected_items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID and selected items are required' 
            });
        }
        
        // Get cart items by IDs
        const cartItems = await getCartItemsByIds(user_id, selected_items);
        
        if (cartItems.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No valid items found in cart' 
            });
        }
        
        // Group items by seller to create separate orders
        const ordersBySeller = {};
        
        cartItems.forEach(item => {
            const sellerId = item.seller_id;
            if (!ordersBySeller[sellerId]) {
                ordersBySeller[sellerId] = {
                    seller_id: sellerId,
                    seller_name: item.seller_name,
                    items: [],
                    total_amount: 0
                };
            }
            
            ordersBySeller[sellerId].items.push({
                item_id: item.item_id,
                quantity: item.quantity,
                price_at_time: item.item_price
            });
            ordersBySeller[sellerId].total_amount += (item.item_price * item.quantity);
        });
        
        const createdOrders = [];
        
        // Create separate orders for each seller
        for (const sellerId in ordersBySeller) {
            const orderData = ordersBySeller[sellerId];
            
            const order_id = await createOrder(
                user_id, 
                sellerId, 
                orderData.total_amount, 
                orderData.items,
                delivery_address,
                notes
            );
            
            createdOrders.push({
                order_id,
                seller_id: sellerId,
                seller_name: orderData.seller_name,
                total_amount: orderData.total_amount
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: 'Orders placed successfully', 
            orders: createdOrders 
        });
        
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to place order',
            error: error.message 
        });
    }
};

// Get orders for buyer
const getBuyerOrders = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const orders = await getOrdersByBuyer(user_id);
        
        res.status(200).json({ 
            success: true, 
            orders 
        });
        
    } catch (error) {
        console.error('Error fetching buyer orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders',
            error: error.message 
        });
    }
};

// Get orders for seller
const getSellerOrders = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const orders = await getOrdersBySeller(user_id);
        
        res.status(200).json({ 
            success: true, 
            orders 
        });
        
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders',
            error: error.message 
        });
    }
};

// Get order details by ID
const getOrderById = async (req, res) => {
    try {
        const { order_id } = req.params;
        
        const order = await getOrderDetails(order_id);
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            order 
        });
        
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch order details',
            error: error.message 
        });
    }
};

// Update order status
const updateOrder = async (req, res) => {
    try {
        const { order_id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid status' 
            });
        }
        
        await updateOrderStatus(order_id, status);
        
        res.status(200).json({ 
            success: true, 
            message: 'Order status updated successfully' 
        });
        
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update order status',
            error: error.message 
        });
    }
};

// Get orders between two users (for chat context)
const getOrdersBetween = async (req, res) => {
    try {
        const { user1_id, user2_id } = req.params;
        
        const orders = await getOrdersBetweenUsers(user1_id, user2_id);
        
        res.status(200).json({ 
            success: true, 
            orders 
        });
        
    } catch (error) {
        console.error('Error fetching orders between users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders',
            error: error.message 
        });
    }
};

module.exports = {
    placeOrder,
    getBuyerOrders,
    getSellerOrders,
    getOrderById,
    updateOrder,
    getOrdersBetween
};
