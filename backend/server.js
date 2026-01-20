const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load Models
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

dotenv.config();

const app = express();

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

// ========== AUTH API ==========

// Register User
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Basic Validation
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
        }

        const newUser = await User.create({ name, email, phone, password, role: 'user' });

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
                token: 'user_token_' + newUser._id
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Hardcoded Admin
        if (email === 'admin@as3cosmetic.com' && password === 'admin123') {
            let admin = await User.findOne({ email });
            if (!admin) admin = await User.create({ name: 'Admin', email, phone: '0000000000', password, role: 'admin' });
            return res.json({ success: true, data: { user: admin, token: 'admin_token_' + admin._id } });
        }

        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        res.json({
            success: true,
            message: 'Login successful!',
            data: {
                user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
                token: 'user_token_' + user._id
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ========== PRODUCTS API ==========
app.get('/api/products', async (req, res) => {
    try {
        let query = {};
        if (req.query.category && req.query.category !== 'all') query.category = req.query.category;
        const products = await Product.find(query);
        res.json({ success: true, data: { products, total: products.length } });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: { product } });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Deleted' });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// ========== ORDERS API ==========
app.post('/api/orders', async (req, res) => {
    try {
        const order = await Order.create(req.body);
        res.status(201).json({ success: true, data: { order } });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, data: { orders } });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/admin/analytics', async (req, res) => {
    try {
        const orders = await Order.find();
        const users = await User.countDocuments({ role: 'user' });
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);
        res.json({ success: true, data: { summary: { totalOrders: orders.length, totalRevenue: revenue, totalUsers: users, pendingOrders: 0, estimatedProfit: revenue * 0.4 }, recentOrders: orders.slice(-5) } });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/', (req, res) => res.json({ message: 'AS³Cosmetic API Running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
