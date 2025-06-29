# IskoMart App Setup Guide

## Overview
IskoMart is a React Native marketplace app with a Node.js backend and MySQL database. This guide will help you set up and run the complete application.

## Prerequisites

### Required Software
1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MySQL Server** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
3. **Android Studio** (for Android emulator) - [Download](https://developer.android.com/studio)
4. **Expo CLI** (for React Native development)
5. **Git** (for version control)

### Development Tools (Optional but Recommended)
- **VS Code** with extensions:
  - SQLTools
  - MySQL
  - React Native Tools
  - ES7+ React/Redux/React-Native snippets

## Setup Instructions

### 1. Database Setup

#### Install and Configure MySQL
1. Install MySQL Server on your system
2. Start MySQL service
3. Connect to MySQL as root user:
   ```bash
   mysql -u root -p
   ```

#### Create the Database
1. Navigate to the backend directory:
   ```bash
   cd c:\IskoMart\iskomart-appdev-main\backend
   ```

2. Run the schema file to create the database:
   ```bash
   mysql -u root -p < schema_clean.sql
   ```

3. Verify the database was created:
   ```sql
   mysql -u root -p
   USE iskomart;
   SHOW TABLES;
   SELECT * FROM users;
   ```

#### Configure Database Connection
1. Check the `.env` file in the backend directory:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=root  # Change this to your MySQL root password
   DB_NAME=iskomart
   DB_PORT=3306
   PORT=3001
   ```

2. Update the `DB_PASS` value to match your MySQL root password

### 2. Backend Setup

#### Install Dependencies
1. Navigate to the backend directory:
   ```bash
   cd c:\IskoMart\iskomart-appdev-main\backend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

#### Start the Backend Server
```bash
npm run dev
```

The server should start on port 3001. You should see:
```
Server running on port 3001
Database connected successfully
```

### 3. Frontend Setup

#### Install Dependencies
1. Navigate to the main project directory:
   ```bash
   cd c:\IskoMart\iskomart-appdev-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

#### Install Expo CLI (if not already installed)
```bash
npm install -g @expo/cli
```

#### Start the React Native App
```bash
npm start
# or
expo start
```

This will start the Metro bundler and show a QR code.

### 4. Running on Android

#### Option A: Android Emulator (Recommended)
1. Open Android Studio
2. Go to Tools > AVD Manager
3. Create a new Virtual Device (if you don't have one)
4. Start the emulator
5. In the Expo terminal, press 'a' to open on Android emulator

#### Option B: Physical Device
1. Install Expo Go app from Google Play Store
2. Scan the QR code from the Expo terminal
3. Make sure your phone and computer are on the same WiFi network

### 5. Testing the App

#### Backend API Testing
Test the backend endpoints using a tool like Postman or curl:

1. **Get all users:**
   ```
   GET http://localhost:3001/api/users
   ```

2. **Get all items:**
   ```
   GET http://localhost:3001/api/items
   ```

3. **Register a new user:**
   ```
   POST http://localhost:3001/api/users/register
   Content-Type: application/json
   
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

#### Frontend Testing
1. Open the app on your device/emulator
2. Test user registration and login
3. Browse items on the Home screen
4. Add items to cart
5. Post new items
6. Test the messaging feature

## Database Schema Features

The database includes the following tables:
- **users** - User accounts and profiles
- **items** - Marketplace items with images
- **cart** - Shopping cart functionality
- **orders** - Order management
- **order_items** - Order details
- **messages** - Chat/messaging system
- **user_likes** - Item likes tracking
- **notifications** - User notifications
- **reviews** - Rating and review system
- **user_sessions** - Authentication sessions
- **item_views** - Analytics tracking

### Advanced Features
- Automatic notifications via database triggers
- User statistics and dashboard views
- Search functionality with stored procedures
- Performance optimized with indexes

## Troubleshooting

### Common Issues

#### Backend Issues
1. **Database Connection Error:**
   - Check if MySQL is running
   - Verify credentials in `.env` file
   - Ensure the `iskomart` database exists

2. **Port Already in Use:**
   - Change the PORT in `.env` file
   - Kill any process using port 3001

3. **Module Not Found:**
   - Run `npm install` in the backend directory
   - Check if all dependencies are listed in `package.json`

#### Frontend Issues
1. **Metro Bundler Issues:**
   - Clear cache: `expo start --clear`
   - Reset Metro: `npx react-native start --reset-cache`

2. **Android Emulator Connection:**
   - Ensure emulator is running
   - Check if adb can see the device: `adb devices`

3. **Network Issues:**
   - Make sure backend is running on the correct port
   - Update the API base URL in `frontend/src/config.js`

#### Database Issues
1. **Schema Import Fails:**
   - Check MySQL user permissions
   - Ensure MySQL service is running
   - Try importing tables one by one

2. **Sample Data Issues:**
   - Verify foreign key constraints
   - Check if all required tables exist

## Development Workflow

### Making Changes
1. **Backend Changes:**
   - Edit files in `/backend`
   - Server auto-restarts with nodemon
   - Test API endpoints

2. **Frontend Changes:**
   - Edit files in `/frontend`
   - Metro bundler hot-reloads changes
   - Test on device/emulator

3. **Database Changes:**
   - Update schema in `schema_clean.sql`
   - Re-import the schema
   - Update backend models if needed

### Production Deployment
1. **Database:**
   - Use a production MySQL server
   - Update connection credentials
   - Import the schema

2. **Backend:**
   - Deploy to a cloud service (Heroku, AWS, etc.)
   - Set environment variables
   - Use PM2 for process management

3. **Frontend:**
   - Build for production: `expo build:android`
   - Upload to Google Play Store
   - Or use Expo's publishing service

## API Documentation

### Authentication Endpoints
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/:id` - Get user profile

### Item Endpoints
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get single item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/like` - Like/unlike item

### Cart Endpoints
- `GET /api/cart/:userId` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### Order Endpoints
- `POST /api/orders` - Place order
- `GET /api/orders/buyer/:userId` - Get orders as buyer
- `GET /api/orders/seller/:userId` - Get orders as seller
- `PUT /api/orders/:id/status` - Update order status

### Message Endpoints
- `GET /api/messages/:userId` - Get user's messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

## Support

For issues or questions:
1. Check this guide first
2. Look at error logs in terminal
3. Check the database connection
4. Verify all services are running
5. Test API endpoints individually

## Next Steps

### Feature Enhancements
1. **Image Upload:** Implement cloud storage (AWS S3, Cloudinary)
2. **Push Notifications:** Add Firebase notifications
3. **Payment Integration:** Add payment gateway
4. **Advanced Search:** Implement full-text search
5. **Admin Dashboard:** Create admin interface
6. **Analytics:** Add user behavior tracking

### Performance Optimizations
1. **Database:** Add more indexes for frequently queried fields
2. **Backend:** Implement caching (Redis)
3. **Frontend:** Add lazy loading and image optimization
4. **API:** Implement pagination for large datasets

---

**Happy coding! 🚀**
