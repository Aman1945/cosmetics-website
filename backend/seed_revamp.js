const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const Offer = require('./models/Offer');

dotenv.config();

const categories = ['lipstick', 'foundation', 'eyeshadow', 'skincare', 'fragrance', 'mascara'];
const brands = ['AS³Cosmetic', 'LuxeGlow', 'Ethereal', 'SilkTouch', 'VelvetBloom'];
const adjectives = ['Velvet', 'Midnight', 'Radiant', 'Pure', 'Silk', 'Luminous', 'Golden', 'Satin', 'Eternal', 'Divine'];
const subjects = ['Glow', 'Rose', 'Ocean', 'Forest', 'Sun', 'Moon', 'Star', 'Petal', 'Honey', 'Lavender'];
const types = ['Lipstick', 'Foundation', 'Serum', 'Cream', 'Palette', 'Perfume', 'Mascara', 'Oil', 'Gel', 'Cushion'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://siddquicosmetic_db_user:Aman123456@cosmetic.sdjlhwa.mongodb.net/cosmetics-db?retryWrites=true&w=majority';

async function seedRevamp() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});
        await Offer.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create Admin
        const admin = new User({
            name: 'Aman Admin',
            email: 'admin@as3cosmetic.com',
            password: 'admin123',
            role: 'admin',
            isVerified: true
        });
        await admin.save();
        console.log('✅ Added admin user: admin@as3cosmetic.com / admin123');

        // Create 10 Users
        const users = [];
        for (let i = 1; i <= 10; i++) {
            const user = new User({
                name: `User ${i} Fullname`,
                email: `user${i}@example.com`,
                password: 'user123',
                isVerified: true
            });
            await user.save();
            users.push(user);
        }
        console.log('✅ Added 10 dummy users');

        // Create 500 Products
        const products = [];
        for (let i = 1; i <= 500; i++) {
            const category = getRandom(categories);
            const brand = getRandom(brands);
            const adj = getRandom(adjectives);
            const sub = getRandom(subjects);
            const type = getRandom(types);

            const name = `${adj} ${sub} ${type} - #${i}`;
            const price = Math.floor(Math.random() * (5000 - 500) + 500);
            const stock = Math.floor(Math.random() * 200) + 20;

            let imgUrl = 'https://images.unsplash.com/photo-1596462502278-27bfad450526?w=400';
            if (category === 'lipstick') imgUrl = `https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&sig=${i}`;
            if (category === 'foundation') imgUrl = `https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&sig=${i}`;
            if (category === 'eyeshadow') imgUrl = `https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&sig=${i}`;
            if (category === 'skincare') imgUrl = `https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&sig=${i}`;
            if (category === 'fragrance') imgUrl = `https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&sig=${i}`;
            if (category === 'mascara') imgUrl = `https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&sig=${i}`;

            const product = new Product({
                name,
                description: `Experience the luxury of ${name}. Highly recommended by experts.`,
                price,
                category,
                brand,
                images: [{ url: imgUrl, alt: name }],
                stock,
                rating: { average: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), count: Math.floor(Math.random() * 1000) + 50 },
                isFeatured: i <= 20
            });
            await product.save();
            products.push(product);
        }
        console.log('✅ Added 500 dummy products');

        // Create 50+ Orders
        for (let k = 0; k < 50; k++) {
            const user = getRandom(users);
            const item1 = getRandom(products);
            const item2 = getRandom(products);

            const items = [
                { productId: item1._id, name: item1.name, price: item1.price, quantity: 1, image: item1.images[0].url },
                { productId: item2._id, name: item2.name, price: item2.price, quantity: 1, image: item2.images[0].url }
            ];

            const subtotal = items.reduce((sum, item) => sum + item.price, 0);
            const total = subtotal + 99;

            const order = new Order({
                userId: user._id.toString(),
                items,
                shippingAddress: { name: user.name, email: user.email, phone: '9123456789', address: 'Plot 4, Civil Lines', city: 'Delhi', state: 'Delhi', pincode: '110001' },
                paymentMethod: 'UPI',
                subtotal,
                total,
                status: getRandom(['pending', 'processing', 'shipped', 'delivered']),
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) // Random date in last 30 days
            });
            await order.save();
        }
        console.log('✅ Created 50 random orders');

        // Seed 3 Offers
        const offer1 = new Offer({
            title: 'Flat 50% OFF',
            subtitle: 'On All Lipsticks & Lip Care',
            badge: 'MEGA SALE',
            discount: 50,
            image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600',
            targetProductId: products.find(p => p.category === 'lipstick')._id,
            isLarge: true
        });
        await offer1.save();

        const offer2 = new Offer({
            title: 'Buy 2 Get 1 Free',
            subtitle: 'On Skincare Range',
            badge: 'NEW',
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
            targetProductId: products.find(p => p.category === 'skincare')._id,
            isLarge: false
        });
        await offer2.save();

        const offer3 = new Offer({
            title: 'Free Shipping',
            subtitle: 'On Orders Above ₹999',
            badge: 'HOT',
            image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
            isLarge: false
        });
        await offer3.save();
        console.log('✅ Seeded 3 trending offers');

        console.log('\n🎉 Revamp Seeding Complete!');
        console.log('\nSummary:');
        console.log('1 Admin: admin@as3cosmetic.com / admin123');
        console.log('4 Users (All pass: user123):');
        console.log('  - Priya Sharma (priya@example.com)');
        console.log('  - Rahul Verma (rahul@example.com)');
        console.log('  - Anita Gupta (anita@example.com)');
        console.log('  - Kevin Dsouza (kevin@example.com)');
        console.log('200 Products Created');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding revamp data:', error);
        process.exit(1);
    }
}

seedRevamp();
