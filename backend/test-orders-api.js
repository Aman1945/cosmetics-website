// Test Orders API Endpoint
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function testOrdersAPI() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        // Test what the API does
        console.log('📋 Testing Orders API Logic:\n');

        // 1. Count orders
        const totalOrders = await Order.countDocuments();
        console.log(`1. Total Orders: ${totalOrders}`);

        // 2. Try to fetch with populate
        try {
            const orders = await Order.find()
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            console.log(`2. Orders fetched with populate: ${orders.length}`);

            if (orders.length > 0) {
                console.log('\n📦 Sample Order:');
                const sample = orders[0];
                console.log(`   ID: ${sample._id}`);
                console.log(`   User: ${sample.user?.name || 'No user'}`);
                console.log(`   Status: ${sample.status}`);
                console.log(`   Total: ₹${sample.total}`);
                console.log(`   Items: ${sample.items?.length || 0}`);
            }
        } catch (populateError) {
            console.log('❌ Error with populate:', populateError.message);

            // Try without populate
            const ordersNoPopulate = await Order.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            console.log(`   Orders without populate: ${ordersNoPopulate.length}`);
        }

        // 3. Check if there are orders with missing user references
        const ordersWithoutUser = await Order.find({ user: null });
        console.log(`\n3. Orders without user: ${ordersWithoutUser.length}`);

        // 4. Check for invalid user references
        const allOrders = await Order.find().lean();
        let invalidRefs = 0;

        for (const order of allOrders) {
            if (order.user) {
                const userExists = await User.findById(order.user);
                if (!userExists) {
                    invalidRefs++;
                }
            }
        }

        console.log(`4. Orders with invalid user refs: ${invalidRefs}`);

        mongoose.connection.close();
        console.log('\n✅ Test Complete!');

        if (invalidRefs > 0) {
            console.log('\n⚠️  ISSUE FOUND: Some orders reference non-existent users!');
            console.log('   This will cause populate() to fail.');
            console.log('   Run fix-orders-refs.js to fix this.');
        } else {
            console.log('\n✅ All orders have valid user references!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testOrdersAPI();
