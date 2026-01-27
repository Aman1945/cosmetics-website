// Create Fake Orders for Testing
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI;

async function createFakeOrders() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Get some users and products
        const users = await User.find().limit(5);
        const products = await Product.find().limit(20);

        if (users.length === 0 || products.length === 0) {
            console.log('❌ No users or products found. Run seed_revamp.js first!');
            process.exit(1);
        }

        console.log(`Found ${users.length} users and ${products.length} products`);

        // Create 20 fake orders
        const fakeOrders = [];
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        for (let i = 0; i < 20; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
            const orderItems = [];
            let subtotal = 0;

            for (let j = 0; j < numItems; j++) {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
                const itemTotal = randomProduct.price * quantity;

                orderItems.push({
                    product: randomProduct._id,
                    name: randomProduct.name,
                    price: randomProduct.price,
                    quantity: quantity,
                    image: randomProduct.images[0]?.url || 'https://via.placeholder.com/100'
                });

                subtotal += itemTotal;
            }

            const tax = Math.round(subtotal * 0.18); // 18% GST
            const total = subtotal + tax;

            const order = {
                user: randomUser._id,
                items: orderItems,
                shippingAddress: {
                    name: randomUser.name,
                    phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                    address: `${Math.floor(Math.random() * 999) + 1}, MG Road`,
                    city: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'][Math.floor(Math.random() * 5)],
                    state: ['Maharashtra', 'Delhi', 'Karnataka', 'Maharashtra', 'Telangana'][Math.floor(Math.random() * 5)],
                    pincode: `${Math.floor(Math.random() * 900000) + 100000}`
                },
                paymentMethod: ['COD', 'Online'][Math.floor(Math.random() * 2)],
                paymentStatus: ['pending', 'paid'][Math.floor(Math.random() * 2)],
                subtotal: subtotal,
                tax: tax,
                total: total,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in last 30 days
            };

            fakeOrders.push(order);
        }

        // Insert all orders
        await Order.insertMany(fakeOrders);
        console.log(`✅ Created ${fakeOrders.length} fake orders!`);

        // Show summary
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$total' }
                }
            }
        ]);

        console.log('\n📊 Order Statistics:');
        orderStats.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count} orders, ₹${stat.totalRevenue.toLocaleString()}`);
        });

        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        console.log(`\n💰 Total Orders: ${totalOrders}`);
        console.log(`💰 Total Revenue: ₹${totalRevenue[0]?.total.toLocaleString() || 0}`);

        mongoose.connection.close();
        console.log('\n✅ Done! Orders created successfully!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createFakeOrders();
