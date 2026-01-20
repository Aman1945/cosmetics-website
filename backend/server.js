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

// Database Connection and Server Start
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://siddquicosmetic_db_user:K-QCjpar3_fx8c_@cosmetic.sdj1hwa.mongodb.net/cosmetics-db';

const startServer = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connected to MongoDB Atlas');

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('👉 Check list:');
        console.error('1. MongoDB Password (URL encoding might be needed)');
        console.error('2. Database User name (must match siddquicosmetic_db_user)');
        console.error('3. Network Access (0.0.0.0/0 allowed)');

        // Start server anyway so health checks don't fail, but log the error
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} (WITHOUT DATABASE)`);
        });
    }
};

startServer();

module.exports = app;
