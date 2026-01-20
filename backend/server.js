const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-Memory Database (Works without MongoDB)
const inMemoryDB = {
    products: [
        {
            _id: '1',
            name: 'Velvet Matte Lipstick - Ruby Red',
            description: 'Long-lasting matte lipstick with rich, vibrant color.',
            price: 1299,
            category: 'lipstick',
            brand: 'LuxeGlow',
            images: [{ url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400', alt: 'Ruby Red Lipstick' }],
            stock: 50,
            rating: { average: 4.8, count: 245 },
            isFeatured: true
        },
        {
            _id: '2',
            name: 'Radiant Glow Foundation',
            description: 'Lightweight foundation with SPF 30 protection.',
            price: 2499,
            category: 'foundation',
            brand: 'LuxeGlow',
            images: [{ url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', alt: 'Foundation' }],
            stock: 30,
            rating: { average: 4.9, count: 189 },
            isFeatured: true
        },
        {
            _id: '3',
            name: 'Shimmer Eyeshadow Palette',
            description: '12 highly pigmented shades for day and night looks.',
            price: 1899,
            category: 'eyeshadow',
            brand: 'LuxeGlow',
            images: [{ url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400', alt: 'Eyeshadow' }],
            stock: 45,
            rating: { average: 4.7, count: 312 },
            isFeatured: true
        },
        {
            _id: '4',
            name: 'Volume Boost Mascara',
            description: 'Dramatic volume and length without clumping.',
            price: 999,
            category: 'mascara',
            brand: 'LuxeGlow',
            images: [{ url: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400', alt: 'Mascara' }],
            stock: 60,
            rating: { average: 4.6, count: 156 },
            isFeatured: false
        },
        {
            _id: '5',
            name: 'Hydrating Vitamin C Serum',
            description: 'Powerful antioxidant serum for brighter skin.',
            price: 3499,
            category: 'skincare',
            brand: 'LuxeGlow',
            images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', alt: 'Serum' }],
            stock: 25,
            rating: { average: 4.9, count: 423 },
            isFeatured: true
        },
        {
            _id: '6',
            name: 'Luxury Perfume - Midnight Rose',
            description: 'Sophisticated floral fragrance with rose and vanilla.',
            price: 5999,
            category: 'fragrance',
            brand: 'LuxeGlow',
            images: [{ url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', alt: 'Perfume' }],
            stock: 15,
            rating: { average: 5.0, count: 89 },
            isFeatured: true
        }
    ],
    users: [
        {
            _id: 'admin1',
            name: 'Admin User',
            email: 'admin@luxeglow.com',
            password: 'admin123',
            role: 'admin'
        }
    ]
};

// ============ PRODUCT ROUTES ============
app.get('/api/products', (req, res) => {
    const { category, featured, limit = 50 } = req.query;
    let products = [...inMemoryDB.products];

    if (category && category !== 'all') {
        products = products.filter(p => p.category === category);
    }
    if (featured === 'true') {
        products = products.filter(p => p.isFeatured);
    }

    res.json({
        success: true,
        data: {
            products: products.slice(0, parseInt(limit)),
            total: products.length
        }
    });
});

app.get('/api/products/featured', (req, res) => {
    const featured = inMemoryDB.products.filter(p => p.isFeatured);
    res.json({ success: true, data: { products: featured } });
});

app.get('/api/products/categories', (req, res) => {
    const categories = [...new Set(inMemoryDB.products.map(p => p.category))];
    res.json({ success: true, data: { categories } });
});

app.get('/api/products/brands', (req, res) => {
    const brands = [...new Set(inMemoryDB.products.map(p => p.brand))];
    res.json({ success: true, data: { brands } });
});

app.get('/api/products/:id', (req, res) => {
    const product = inMemoryDB.products.find(p => p._id === req.params.id);
    if (product) {
        res.json({ success: true, data: { product } });
    } else {
        res.status(404).json({ success: false, message: 'Product not found' });
    }
});

app.post('/api/products', (req, res) => {
    const newProduct = {
        _id: Date.now().toString(),
        ...req.body,
        rating: { average: 4.5, count: 0 }
    };
    inMemoryDB.products.push(newProduct);
    res.status(201).json({ success: true, data: { product: newProduct } });
});

app.put('/api/products/:id', (req, res) => {
    const index = inMemoryDB.products.findIndex(p => p._id === req.params.id);
    if (index !== -1) {
        inMemoryDB.products[index] = { ...inMemoryDB.products[index], ...req.body };
        res.json({ success: true, data: { product: inMemoryDB.products[index] } });
    } else {
        res.status(404).json({ success: false, message: 'Product not found' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    const index = inMemoryDB.products.findIndex(p => p._id === req.params.id);
    if (index !== -1) {
        inMemoryDB.products.splice(index, 1);
        res.json({ success: true, message: 'Product deleted' });
    } else {
        res.status(404).json({ success: false, message: 'Product not found' });
    }
});

// ============ AUTH ROUTES ============
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = inMemoryDB.users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
                token: 'demo-token-' + Date.now()
            }
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    const newUser = { _id: Date.now().toString(), name, email, password, role: 'user' };
    inMemoryDB.users.push(newUser);
    res.status(201).json({
        success: true,
        data: {
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
            token: 'demo-token-' + Date.now()
        }
    });
});

// ============ ORDER ROUTES ============
app.post('/api/orders', (req, res) => {
    res.status(201).json({ success: true, message: 'Order placed successfully (Demo)', orderId: Date.now() });
});

// ============ HEALTH & INFO ============
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API running in In-Memory Mode', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.json({
        message: 'LuxeGlow Cosmetics API (In-Memory Mode)',
        version: '1.0.0',
        note: 'Database-free mode - data resets on server restart',
        endpoints: { products: '/api/products', auth: '/api/auth', orders: '/api/orders' }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`✅ In-Memory Mode Active - No Database Required`);
});

module.exports = app;
