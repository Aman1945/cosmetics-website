const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// Load Models
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://siddquicosmetic_db_user:Aman123456@cosmetic.sdjlhwa.mongodb.net/cosmetics-db?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB Atlas Connected!');
        // Seed initial products if DB is empty
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('🌱 Seeding sample products...');
            await Product.create([
                { name: 'Velvet Matte Lipstick', description: 'Long-lasting matte lipstick', price: 1299, category: 'lipstick', brand: 'AS³Cosmetic', images: [{ url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400', alt: 'Lipstick' }], stock: 50, rating: { average: 4.8, count: 245 }, isFeatured: true },
                { name: 'Radiant Glow Foundation', description: 'Lightweight foundation', price: 2499, category: 'foundation', brand: 'AS³Cosmetic', images: [{ url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', alt: 'Foundation' }], stock: 30, rating: { average: 4.9, count: 189 }, isFeatured: true }
            ]);
        }
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Additional Admin Routes (if not in modular routes)
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const orders = await Order.find();
        const users = await User.countDocuments({ role: 'user' });
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);
        res.json({
            success: true,
            data: {
                summary: {
                    totalOrders: orders.length,
                    totalRevenue: revenue,
                    totalUsers: users,
                    pendingOrders: 0,
                    estimatedProfit: revenue * 0.4
                },
                recentOrders: orders.slice(-5)
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Admin User Management (if not in modular routes)
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
        res.json({ success: true, data: { users, total: users.length } });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.put('/api/admin/users/:id', async (req, res) => {
    try {
        const { name, email, phone, isVerified } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, isVerified },
            { new: true }
        );
        res.json({ success: true, data: { user }, message: 'User updated successfully' });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
});

app.get('/', (req, res) => res.json({ message: 'AS³Cosmetic API Running' }));

// Health check and Self-ping route
app.get('/ping', (req, res) => res.send('Pong! Server is awake. 🚀'));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server on ${PORT}`);

    // Self-pinging script to keep server awake on Render
    const SERVER_URL = `https://cosmetics-website-1.onrender.com/ping`;
    setInterval(() => {
        require('https').get(SERVER_URL, (res) => {
            console.log(`Self-ping sent to ${SERVER_URL} - Status: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error('Self-ping failed:', err.message);
        });
    }, 10 * 60 * 1000); // Ping every 10 minutes
});
