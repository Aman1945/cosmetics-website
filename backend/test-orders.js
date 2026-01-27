// Test Orders API
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User'); // Need to load User model for populate

const MONGODB_URI = process.env.MONGODB_URI;

async function testOrders() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Get all orders
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        console.log(`\n📦 Total Orders in DB: ${await Order.countDocuments()}`);
        console.log(`\n📋 First 10 Orders:\n`);

        orders.forEach((order, index) => {
            console.log(`${index + 1}. Order ID: ${order._id}`);
            console.log(`   User: ${order.user?.name || 'Unknown'}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Total: ₹${order.total}`);
            console.log(`   Items: ${order.items?.length || 0}`);
            console.log(`   Date: ${new Date(order.createdAt).toLocaleDateString()}`);
            console.log('');
        });

        // Test status field
        const statusCounts = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('📊 Orders by Status:');
        statusCounts.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count} orders`);
        });

        mongoose.connection.close();
        console.log('\n✅ Test Complete!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testOrders();
