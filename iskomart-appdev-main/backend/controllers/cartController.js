const { 
    addToCart, 
    getCartItems, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart 
} = require('../models/CartModel');

// Add item to cart
const addItemToCart = async (req, res) => {
    try {
        const { user_id, item_id, quantity } = req.body;
        
        if (!user_id || !item_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID and Item ID are required' 
            });
        }
        
        const result = await addToCart(user_id, item_id, quantity || 1);
        res.status(200).json(result);
        
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add item to cart',
            error: error.message 
        });
    }
};

// Get cart items for user
const getUserCart = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        if (!user_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID is required' 
            });
        }
        
        const cartItems = await getCartItems(user_id);
        res.status(200).json({ 
            success: true, 
            cartItems: cartItems,
            total_items: cartItems.length,
            total_amount: cartItems.reduce((sum, item) => sum + (item.item_price * item.quantity), 0)
        });
        
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch cart items',
            error: error.message 
        });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const { user_id, item_id, quantity } = req.body;
        
        if (!user_id || !item_id || quantity === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID, Item ID and quantity are required' 
            });
        }
        
        // Find cart item by user_id and item_id, then update
        const cartItems = await getCartItems(user_id);
        const cartItem = cartItems.find(item => item.item_id === item_id);
        
        if (!cartItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart item not found' 
            });
        }
        
        const result = await updateCartQuantity(cartItem.cart_id, quantity);
        res.status(200).json(result);
        
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update cart item',
            error: error.message 
        });
    }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
    try {
        const { user_id, item_id } = req.body;
        
        if (!user_id || !item_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID and Item ID are required' 
            });
        }
        
        // Find cart item by user_id and item_id, then remove
        const cartItems = await getCartItems(user_id);
        const cartItem = cartItems.find(item => item.item_id === item_id);
        
        if (!cartItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart item not found' 
            });
        }
        
        const result = await removeFromCart(cartItem.cart_id);
        res.status(200).json(result);
        
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to remove cart item',
            error: error.message 
        });
    }
};

// Clear entire cart
const clearUserCart = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        if (!user_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID is required' 
            });
        }
        
        const result = await clearCart(user_id);
        res.status(200).json(result);
        
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to clear cart',
            error: error.message 
        });
    }
};

module.exports = {
    addItemToCart,
    getUserCart,
    updateCartItem,
    removeCartItem,
    clearUserCart
};
