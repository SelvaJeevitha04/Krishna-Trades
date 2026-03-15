# Krishna Trades - Wholesale Consultancy Platform

A full-stack real-time wholesale consultancy web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin / User)
- Secure password hashing (bcrypt)
- Protected routes
- Automatic token refresh

### User Panel Features
- User Registration & Login
- Browse Products with real-time stock availability
- Search & filter options
- Category-wise product listing
- Add to Cart functionality
- Order placement with stock validation
- Order History Tracking
- Order Status Updates (Pending, Confirmed, Shipped, Delivered)

### Admin Panel Features
- Admin Dashboard with analytics
- Product Management (CRUD operations)
- Category Management
- Order Management with status updates
- User Management
- Real-time inventory management
- Low stock alerts
- Sales analytics

### Real-Time Features
- Socket.io for instant stock updates
- Real-time order status updates
- Admin notifications
- Live inventory tracking

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Joi** - Input validation

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates
- **Heroicons** - Icons

## 📁 Project Structure

```
KrishnaTrades/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth, error handling
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Socket.io services
│   │   ├── utils/         # Utility functions
│   │   └── validators/    # Input validation
│   ├── package.json
│   └── .env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React contexts
│   │   ├── layouts/      # Page layouts
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KrishnaTrades
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Backend:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```
   
   Required environment variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/krishna-trades
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   ```

5. **Start the applications**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 📱 Usage

### Demo Accounts

**Admin Account:**
- Email: admin@example.com
- Password: admin123

**User Account:**
- Email: user@example.com
- Password: user123

### Navigation

**User Panel:**
- Dashboard - Overview of orders and cart
- Products - Browse and search products
- Cart - Manage shopping cart
- Orders - View order history
- Profile - User settings

**Admin Panel:**
- Dashboard - Analytics and overview
- Products - Product management
- Categories - Category management
- Orders - Order management
- Users - User management
- Inventory - Stock management

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm run dev      # Start development server
npm run start    # Start production server
npm run prod     # Start in production mode
```

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### API Documentation

#### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Product Endpoints
- `GET /api/products` - Get products (with pagination)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

#### Order Endpoints
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (Admin only)

## 🔄 Real-Time Events

### Client Events
- `join-user-room` - Join user-specific room
- `join-admin-room` - Join admin room
- `check-stock` - Check product stock

### Server Events
- `stock-updated` - Product stock updated
- `order-status-updated` - Order status changed
- `new-order` - New order received
- `low-stock-alert` - Product low stock warning
- `notification` - User notification

## 🚀 Deployment

### Backend (Render/Railway)
1. Set environment variables
2. Deploy to Render/Railway
3. Configure MongoDB Atlas connection

### Frontend (Vercel)
1. Build the application
2. Deploy to Vercel
3. Configure environment variables

### Database (MongoDB Atlas)
1. Create cluster
2. Configure network access
3. Create database user
4. Update connection string

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository.
