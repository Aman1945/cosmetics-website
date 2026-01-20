# LuxeGlow - Premium 3D Cosmetics Website 🌟

![Status](https://img.shields.io/badge/status-ready%20to%20deploy-success)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

Premium cosmetics e-commerce website with stunning 3D visualizations, built with Node.js, Express, MongoDB, Three.js, and modern web technologies.

## 🎯 Features

- 🎨 **Premium UI/UX** - Glassmorphism effects, gradients, smooth animations
- 🌟 **3D Product Visualization** - Interactive 3D models using Three.js
- 🛒 **Shopping Cart** - Full cart functionality with local storage
- 🔐 **Authentication** - JWT-based user authentication
- 📱 **Fully Responsive** - Works perfectly on all devices
- 🎭 **Smooth Animations** - GSAP-powered animations
- 💳 **Order Management** - Complete order processing system
- 🔍 **Product Filtering** - Filter by category, search, and sort

## 🚀 Live Demo

**Frontend**: [Your Render URL]
**Backend API**: [Your Render API URL]

## 📸 Screenshots

[Screenshots will be added after deployment]

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Three.js for 3D graphics
- GSAP for animations
- Vite for build tooling
- Glassmorphism design

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Atlas or local)
- npm or yarn

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/cosmetics-website.git
cd cosmetics-website
```

2. **Backend Setup**
```bash
cd backend
npm install
# Create .env file and add MongoDB URI
cp .env.example .env
# Seed database with sample data
node seed.js
# Start backend
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install
# Start development server
npm run dev
```

4. **Access the app**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to Render.

### Quick Deploy Steps:
1. Create MongoDB Atlas database (free)
2. Push code to GitHub
3. Deploy backend to Render
4. Deploy frontend to Render
5. Update API URLs
6. Share with friends! 🎉

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders/my-orders` - Get user orders (protected)
- `GET /api/orders/:id` - Get order by ID (protected)

### Cart
- `POST /api/auth/cart` - Add to cart (protected)
- `DELETE /api/auth/cart/:productId` - Remove from cart (protected)

## 📁 Project Structure

```
cosmetics-website/
├── backend/
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── models/           # MongoDB schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── orders.js
│   ├── middleware/       # Custom middleware
│   │   └── auth.js
│   ├── server.js         # Express server
│   ├── seed.js           # Database seeder
│   └── package.json
│
├── frontend/
│   ├── js/
│   │   └── main.js       # Main JavaScript with 3D
│   ├── styles/
│   │   └── main.css      # Premium styles
│   ├── index.html        # Main HTML
│   ├── vite.config.js    # Vite configuration
│   └── package.json
│
├── README.md
└── DEPLOYMENT.md
```

## 🎨 Design Features

- **Glassmorphism Effects** - Modern frosted glass UI elements
- **Gradient Backgrounds** - Beautiful pink-purple-blue gradients
- **3D Hero Animation** - Rotating cosmetic bottle with particles
- **Smooth Transitions** - GSAP-powered animations
- **Responsive Grid** - Adaptive product layouts
- **Dark Theme** - Premium dark color scheme
- **Floating Cards** - Animated feature cards

## 🔐 Default Credentials

**Admin Account:**
- Email: admin@luxeglow.com
- Password: admin123

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB connection string in `.env`
- Ensure MongoDB is running
- Verify all dependencies are installed

**Frontend won't connect to backend:**
- Update `API_URL` in `frontend/js/main.js`
- Check CORS settings in backend
- Verify backend is running

**3D animations not working:**
- Check browser WebGL support
- Open browser console for errors
- Try Chrome/Firefox (recommended)

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

Created with ❤️ by LuxeGlow Team

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if you like this project!

---

**Happy Coding! 🚀**
