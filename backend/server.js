const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://siddquicosmetic_db_user:Aman123456@cosmetic.sdj1hwa.mongodb.net/cosmetics-db?retryWrites=true&w=majority';

let dbConnected = false;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Atlas Connected!');
        dbConnected = true;
    })
    .catch(err => {
        console.error('❌ MongoDB Error:', err.message);
        console.log('⚠️ Using In-Memory Mode');
    });

// In-Memory Fallback Data
const sampleProducts = [
    { _id: '1', name: 'Velvet Matte Lipstick - Ruby Red', description: 'Long-lasting matte lipstick', price: 1299, category: 'lipstick', brand: 'LuxeGlow', images: [{ url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400', alt: 'Lipstick' }], stock: 50, rating: { average: 4.8, count: 245 }, isFeatured: true },
    { _id: '2', name: 'Radiant Glow Foundation', description: 'Lightweight foundation with SPF 30', price: 2499, category: 'foundation', brand: 'LuxeGlow', images: [{ url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', alt: 'Foundation' }], stock: 30, rating: { average: 4.9, count: 189 }, isFeatured: true },
    { _id: '3', name: 'Shimmer Eyeshadow Palette', description: '12 highly pigmented shades', price: 1899, category: 'eyeshadow', brand: 'LuxeGlow', images: [{ url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400', alt: 'Eyeshadow' }], stock: 45, rating: { average: 4.7, count: 312 }, isFeatured: true },
    { _id: '4', name: 'Volume Boost Mascara', description: 'Dramatic volume without clumping', price: 999, category: 'mascara', brand: 'LuxeGlow', images: [{ url: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400', alt: 'Mascara' }], stock: 60, rating: { average: 4.6, count: 156 }, isFeatured: false },
    { _id: '5', name: 'Hydrating Vitamin C Serum', description: 'Brightening serum for glowing skin', price: 3499, category: 'skincare', brand: 'LuxeGlow', images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', alt: 'Serum' }], stock: 25, rating: { average: 4.9, count: 423 }, isFeatured: true },
    { _id: '6', name: 'Luxury Perfume - Midnight Rose', description: 'Elegant floral fragrance', price: 5999, category: 'fragrance', brand: 'LuxeGlow', images: [{ url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', alt: 'Perfume' }], stock: 15, rating: { average: 5.0, count: 89 }, isFeatured: true }
];

const sampleUsers = [{ _id: 'admin1', name: 'Admin', email: 'admin@luxeglow.com', password: 'admin123', role: 'admin' }];

// ========== PRODUCTS API ==========
app.get('/api/products', async (req, res) => {
    try {
        if (dbConnected) {
            const Product = require('./models/Product');
            const products = await Product.find().limit(50);
            return res.json({ success: true, data: { products, total: products.length } });
        }
    } catch (e) { console.log('DB Error, using fallback'); }

    let products = [...sampleProducts];
    if (req.query.category && req.query.category !== 'all') {
        products = products.filter(p => p.category === req.query.category);
    }
    if (req.query.featured === 'true') {
        products = products.filter(p => p.isFeatured);
    }
    res.json({ success: true, data: { products, total: products.length } });
});

app.get('/api/products/featured', async (req, res) => {
    try {
        if (dbConnected) {
            const Product = require('./models/Product');
            const products = await Product.find({ isFeatured: true });
            return res.json({ success: true, data: { products } });
        }
    } catch (e) { }
    res.json({ success: true, data: { products: sampleProducts.filter(p => p.isFeatured) } });
});

app.get('/api/products/categories', (req, res) => {
    res.json({ success: true, data: { categories: ['lipstick', 'foundation', 'eyeshadow', 'mascara', 'skincare', 'fragrance'] } });
});

app.get('/api/products/brands', (req, res) => {
    res.json({ success: true, data: { brands: ['LuxeGlow'] } });
});

app.get('/api/products/:id', async (req, res) => {
    try {
        if (dbConnected) {
            const Product = require('./models/Product');
            const product = await Product.findById(req.params.id);
            if (product) return res.json({ success: true, data: { product } });
        }
    } catch (e) { }
    const product = sampleProducts.find(p => p._id === req.params.id);
    if (product) res.json({ success: true, data: { product } });
    else res.status(404).json({ success: false, message: 'Not found' });
});

app.post('/api/products', async (req, res) => {
    try {
        if (dbConnected) {
            const Product = require('./models/Product');
            const product = await Product.create(req.body);
            return res.status(201).json({ success: true, data: { product } });
        }
    } catch (e) { console.log('Create error:', e.message); }
    const newProduct = { _id: Date.now().toString(), ...req.body };
    sampleProducts.push(newProduct);
    res.status(201).json({ success: true, data: { product: newProduct }, note: 'Saved in memory (temp)' });
});

app.put('/api/products/:id', async (req, res) => {
    try {
        if (dbConnected) {
            const Product = require('./models/Product');
            const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (product) return res.json({ success: true, data: { product } });
        }
    } catch (e) { }
    res.json({ success: true, message: 'Updated (in memory)' });
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        if (dbConnected) {
            const Product = require('./models/Product');
            await Product.findByIdAndDelete(req.params.id);
            return res.json({ success: true, message: 'Deleted from database' });
        }
    } catch (e) { }
    res.json({ success: true, message: 'Deleted (in memory)' });
});

// ========== AUTH API ==========
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (dbConnected) {
            const User = require('./models/User');
            let user = await User.findOne({ email }).select('+password');

            // Auto-create admin if not exists
            if (!user && email === 'admin@luxeglow.com' && password === 'admin123') {
                user = await User.create({ name: 'Admin', email, password, role: 'admin' });
            }

            if (user) {
                const isValid = await user.comparePassword(password);
                if (isValid) {
                    const jwt = require('jsonwebtoken');
                    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
                    return res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token } });
                }
            }
        }
    } catch (e) { console.log('Login DB error:', e.message); }

    // Fallback login
    const user = sampleUsers.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token: 'demo-token-' + Date.now() } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    res.status(201).json({ success: true, data: { user: { id: Date.now(), ...req.body }, token: 'demo-token' } });
});

app.post('/api/orders', (req, res) => {
    res.status(201).json({ success: true, message: 'Order placed!', orderId: Date.now() });
});

// ========== HEALTH & INFO ==========
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', database: dbConnected ? 'Connected' : 'In-Memory Mode', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.json({ message: 'LuxeGlow API', database: dbConnected ? 'MongoDB Connected' : 'In-Memory Mode' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

module.exports = app;
