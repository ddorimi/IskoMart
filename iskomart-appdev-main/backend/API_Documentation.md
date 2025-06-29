# IskoMart Backend API Documentation

## Cart Functionality

### Add Item to Cart
- **POST** `/api/cart/add`
- **Body**: 
  ```json
  {
    "user_id": 1,
    "item_id": 5,
    "quantity": 2
  }
  ```
- **Response**: Success message with cart update status

### Get User's Cart
- **GET** `/api/cart/:user_id`
- **Response**: 
  ```json
  {
    "success": true,
    "cart": [...],
    "total_items": 3,
    "total_amount": 150.00
  }
  ```

### Update Cart Item Quantity
- **PUT** `/api/cart/item/:cart_id`
- **Body**: 
  ```json
  {
    "quantity": 3
  }
  ```

### Remove Item from Cart
- **DELETE** `/api/cart/item/:cart_id`

### Clear Entire Cart
- **DELETE** `/api/cart/:user_id`

## Order Functionality

### Proceed to Order (Create Orders from Cart)
- **POST** `/api/orders/create`
- **Body**: 
  ```json
  {
    "user_id": 1
  }
  ```
- **Response**: Creates separate orders for each seller and returns order details

### Get Buyer's Orders
- **GET** `/api/orders/buyer/:user_id`
- **Response**: List of orders placed by the user

### Get Seller's Orders
- **GET** `/api/orders/seller/:seller_id`
- **Response**: List of orders received by the seller

### Get Order Details
- **GET** `/api/orders/:order_id`
- **Response**: Detailed order information with items

### Update Order Status
- **PUT** `/api/orders/:order_id/status`
- **Body**: 
  ```json
  {
    "status": "confirmed"
  }
  ```
- **Valid statuses**: pending, confirmed, shipped, delivered, cancelled

### Get Chat Partner for Order
- **GET** `/api/orders/:order_id/chat/:user_id`
- **Response**: Returns the other party's info for messaging
  ```json
  {
    "success": true,
    "chat_partner": {
      "user_id": 2,
      "username": "seller_username",
      "role": "seller"
    },
    "order_id": 5
  }
  ```

## Database Schema

### Cart Table
- cart_id (PRIMARY KEY)
- user_id (FOREIGN KEY to users)
- item_id (FOREIGN KEY to items)
- quantity
- added_at (TIMESTAMP)

### Orders Table
- order_id (PRIMARY KEY)
- buyer_id (FOREIGN KEY to users)
- seller_id (FOREIGN KEY to users)
- total_amount
- status (ENUM: pending, confirmed, shipped, delivered, cancelled)
- order_date (TIMESTAMP)

### Order Items Table
- order_item_id (PRIMARY KEY)
- order_id (FOREIGN KEY to orders)
- item_id (FOREIGN KEY to items)
- quantity
- price_at_time

## Frontend Integration Flow

1. **Add to Cart**: User clicks "Add to Cart" → POST to `/api/cart/add`
2. **View Cart**: User opens cart → GET `/api/cart/:user_id`
3. **Proceed to Order**: User clicks "Proceed to Order" → POST `/api/orders/create`
4. **View Orders**: User can see their orders → GET `/api/orders/buyer/:user_id`
5. **Chat with Seller**: User clicks order → GET `/api/orders/:order_id/chat/:user_id` → Navigate to chat with returned user info

## Key Features

- **Multi-seller Support**: Automatically creates separate orders for each seller
- **Cart Persistence**: Cart items are saved in database
- **Order Status Tracking**: Orders can be tracked through different statuses
- **Integrated Messaging**: Direct connection between orders and messaging system
- **Transaction Safety**: Uses database transactions for order creation
