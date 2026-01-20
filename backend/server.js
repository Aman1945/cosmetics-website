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
    .then(() => console.log('✅ MongoDB Atlas Connected!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

const otpStore = {}; // Temporary OTP storage (In-memory is fine for OTP as they expire quickly)

// ========== OTP SYSTEM ==========
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/api/auth/send-otp', (req, res) => {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ success: false, message: 'Valid 10-digit phone required' });

    const otp = generateOTP();
    otpStore[phone] = { otp, expires: Date.now() + 5 * 60 * 1000, verified: false };

    console.log(`📱 OTP for ${phone}: ${otp}`);
    res.json({ success: true, message: 'OTP sent!', demo_otp: otp });
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, otp } = req.body;
    const stored = otpStore[phone];
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    stored.verified = true;
    res.json({ success: true, message: 'OTP verified!' });
});

// ========== AUTH API ==========
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Auto-create admin if matches credentials
        if (email === 'admin@as3cosmetic.com' && password === 'admin123') {
            let admin = await User.findOne({ email });
            if (!admin) {
                admin = await User.create({ name: 'Admin', email, phone: '0000000000', password, role: 'admin' });
            }
            return res.json({ success: true, data: { user: admin, token: 'admin_token' } });
        }

        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        res.json({ success: true, data: { user, token: 'user_token_' + user._id } });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { name, email, phone, password, address } = req.body;
    if (!otpStore[phone] || !otpStore[phone].verified) {
        return res.status(400).json({ success: false, message: 'Verify phone first' });
    }
    try {
        const user = await User.create({ name, email, phone, password, address });
        delete otpStore[phone];
        res.status(201).json({ success: true, data: { user, token: 'user_token_' + user._id } });
    } catch (e) {
        res.status(400).json({ success: false, message: 'Registration failed (Email/Phone might exist)' });
    }
});

// ========== PRODUCTS API ==========
app.get('/api/products', async (req, res) => {
    try {
        let query = {};
        if (req.query.category && req.query.category !== 'all') query.category = req.query.category;
        if (req.query.featured === 'true') query.isFeatured = true;

        const products = await Product.find(query).limit(50);
        res.json({ success: true, data: { products, total: products.length } });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: { product } });
    } catch (e) { res.status(400).json({ success: false, message: 'Invalid ID' }); }
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
        res.json({ success: true, message: 'Product deleted' });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// ========== ORDERS API ==========
app.post('/api/orders', async (req, res) => {
    try {
        const order = await Order.create(req.body);
        console.log(`🛒 New Order: ${order._id} for ₹${order.total}`);
        res.status(201).json({ success: true, data: { order } });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, data: { orders, total: orders.length } });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: { order } });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// ========== ADMIN ANALYTICS ==========
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const orders = await Order.find();
        const users = await User.countDocuments({ role: 'user' });
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);
        const profit = revenue * 0.4; // Sample 40% profit margin

        res.json({
            success: true,
            data: {
                summary: {
                    totalOrders: orders.length,
                    totalRevenue: revenue,
                    totalUsers: users,
                    estimatedProfit: profit,
                    pendingOrders: orders.filter(o => o.status === 'pending').length
                },
                recentOrders: orders.slice(-5).reverse()
            }
        });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/', (req, res) => res.json({ message: 'AS³Cosmetic API - Database Connected' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
