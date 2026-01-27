// Simulate Admin Orders API Call
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product'); // Needed for populate
const jwt = require('jsonwebtoken');

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

async function simulateOrdersAPI() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        // 1. Get admin user
        const admin = await User.findOne({ email: 'admin@as3cosmetic.com' });
        if (!admin) {
            console.log('❌ Admin not found!');
            return;
        }

        console.log('✅ Admin found:', admin.email);
        console.log(`   Role: ${admin.role}`);

        // 2. Generate token (like login does)
        const token = jwt.sign({ userId: admin._id }, JWT_SECRET, { expiresIn: '7d' });
        console.log(`\n🔑 Generated Token: ${token.substring(0, 20)}...`);

        // 3. Verify token (like auth middleware does)
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log(`✅ Token verified! User ID: ${decoded.userId}`);
        } catch (err) {
            console.log('❌ Token verification failed:', err.message);
            return;
        }

        // 4. Check if user is admin (like adminAuth middleware does)
        if (admin.role !== 'admin') {
            console.log('❌ User is not admin!');
            return;
        }
        console.log('✅ User is admin!');

        // 5. Fetch orders (like getAllOrders controller does)
        console.log('\n📦 Fetching orders...');

        const query = {};
        const page = 1;
        const limit = 100;
        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('items.product')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)
            .lean();

        const total = await Order.countDocuments(query);

        console.log(`✅ Orders fetched: ${orders.length}`);
        console.log(`   Total in DB: ${total}`);

        if (orders.length > 0) {
            console.log('\n📋 Sample Orders:');
            orders.slice(0, 3).forEach((order, i) => {
                console.log(`   ${i + 1}. ID: ${order._id}`);
                console.log(`      User: ${order.user?.name || 'Unknown'}`);
                console.log(`      Status: ${order.status}`);
                console.log(`      Total: ₹${order.total}`);
            });
        }

        // 6. Format response (like controller does)
        const response = {
            success: true,
            data: {
                orders,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        };

        console.log('\n✅ API Response would be:');
        console.log(`   success: ${response.success}`);
        console.log(`   orders count: ${response.data.orders.length}`);
        console.log(`   total: ${response.data.pagination.total}`);

        mongoose.connection.close();
        console.log('\n✅ Simulation Complete!');
        console.log('\n💡 The API should work fine!');
        console.log('   If it\'s still failing, check:');
        console.log('   1. Backend server is running');
        console.log('   2. Token is being sent correctly');
        console.log('   3. CORS is enabled');

    } catch (error) {
        console.error('\n❌ Error:', error);
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
        process.exit(1);
    }
}

simulateOrdersAPI();
