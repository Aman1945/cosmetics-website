const express = require('express');
const compression = require('compression');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const offerRoutes = require('./routes/offers');

// Load Models
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { auth, adminAuth } = require('./middleware/auth');
const NodeCache = require('node-cache');
const analyticsCache = new NodeCache({ stdTTL: 60 });
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Security Headers
/*
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", "https://cosmetics-website-1.onrender.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://via.placeholder.com", "https://*.unsplash.com"],
            connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000", "https://cosmetics-website-1.onrender.com", "ws://localhost:*"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
        },
    }
}));
*/

// Restricted CORS
const allowedOrigins = [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:3000', // Vite Dev Server
    'http://127.0.0.1:3000',
    'http://localhost:5500', // VS Code Live Server
    'http://127.0.0.1:5500',
    'https://cosmetics-website-1.onrender.com', // Production
    'https://luxeglow-cosmetic.netlify.app',
    'https://aman-cosmetic.vercel.app'
];

const path = require('path');
// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(cors({
    origin: true,
    credentials: true
}));

// Body Parser with limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit login/register attempts
    message: { success: false, message: 'Too many login attempts, please try again in an hour.' },
});

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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
app.use('/api/offers', offerRoutes);

// Additional Admin Routes (if not in modular routes)
app.get('/api/admin/analytics', auth, adminAuth, async (req, res) => {
    try {
        const cachedAnalytics = analyticsCache.get('admin_stats');
        if (cachedAnalytics) return res.json({ success: true, data: cachedAnalytics });

        const orders = await Order.find();
        const users = await User.countDocuments({ role: 'user' });
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);

        const analyticsData = {
            summary: {
                totalOrders: orders.length,
                totalRevenue: revenue,
                totalUsers: users,
                pendingOrders: orders.filter(o => o.status === 'pending').length,
                estimatedProfit: revenue * 0.4
            },
            recentOrders: orders.slice(-5)
        };

        analyticsCache.set('admin_stats', analyticsData);
        res.json({
            success: true,
            data: analyticsData
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Admin User Management (if not in modular routes)
app.get('/api/admin/users', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
        res.json({ success: true, data: { users, total: users.length } });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.put('/api/admin/users/:id', auth, adminAuth, async (req, res) => {
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

// app.get('/', (req, res) => res.json({ message: 'AS³Cosmetic API Running' }));

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
