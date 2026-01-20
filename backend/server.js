const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all for now
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://siddquicosmetic_db_user:dh1Uq9gX1u4V0h5e@cosmetic.sdj1hwa.mongodb.net/cosmetics-db';

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // 5 second mein fail ho jaye agar connect na ho
    bufferCommands: false, // Wait mat karo agar connection nahi hai
})
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        if (err.message.includes('authentication failed')) {
            console.error('👉 Kripya apna MongoDB Password check karein Atlas mein.');
        }
    });

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Cosmetics API is running', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'LuxeGlow Cosmetics API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            products: '/api/products',
            auth: '/api/auth',
            orders: '/api/orders'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
