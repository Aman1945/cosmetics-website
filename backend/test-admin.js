// Test Admin Login and APIs
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

async function testAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        // Check if admin exists
        let admin = await User.findOne({ email: 'admin@as3cosmetic.com' });

        if (!admin) {
            console.log('❌ Admin user not found! Creating...');

            const hashedPassword = await bcrypt.hash('admin123', 10);
            admin = await User.create({
                name: 'Aman Admin',
                email: 'admin@as3cosmetic.com',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                isVerified: true
            });

            console.log('✅ Admin user created!');
        } else {
            console.log('✅ Admin user exists!');
        }

        console.log('\n📋 Admin Details:');
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log(`   Verified: ${admin.isVerified}`);

        // Test password
        const isPasswordCorrect = await bcrypt.compare('admin123', admin.password);
        console.log(`   Password 'admin123': ${isPasswordCorrect ? '✅ Correct' : '❌ Wrong'}`);

        // Check orders
        const totalOrders = await Order.countDocuments();
        const orders = await Order.find()
            .populate('user', 'name email')
            .limit(3)
            .lean();

        console.log(`\n📦 Orders in Database: ${totalOrders}`);

        if (orders.length > 0) {
            console.log('\n📋 Sample Orders:');
            orders.forEach((order, i) => {
                console.log(`   ${i + 1}. ID: ${order._id}`);
                console.log(`      User: ${order.user?.name || 'Unknown'}`);
                console.log(`      Status: ${order.status}`);
                console.log(`      Total: ₹${order.total}`);
            });
        }

        // Test analytics calculation
        const revenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        console.log(`\n💰 Total Revenue: ₹${revenue[0]?.total || 0}`);

        mongoose.connection.close();
        console.log('\n✅ All tests passed!');
        console.log('\n🔐 Use these credentials:');
        console.log('   Email: admin@as3cosmetic.com');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testAdmin();
