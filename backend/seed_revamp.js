const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

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

        // Create 4 Users
        const usersData = [
            { name: 'Priya Sharma', email: 'priya@example.com', password: 'user123', isVerified: true },
            { name: 'Rahul Verma', email: 'rahul@example.com', password: 'user123', isVerified: true },
            { name: 'Anita Gupta', email: 'anita@example.com', password: 'user123', isVerified: true },
            { name: 'Kevin Dsouza', email: 'kevin@example.com', password: 'user123', isVerified: true }
        ];

        const users = [];
        for (const u of usersData) {
            const user = new User(u);
            await user.save();
            users.push(user);
        }
        console.log('✅ Added 4 dummy users');

        // Create 200 Products
        const products = [];
        for (let i = 1; i <= 200; i++) {
            const category = getRandom(categories);
            const brand = getRandom(brands);
            const adj = getRandom(adjectives);
            const sub = getRandom(subjects);
            const type = getRandom(types);

            const name = `${adj} ${sub} ${type} - #${i}`;
            const price = Math.floor(Math.random() * (5000 - 500) + 500);
            const stock = Math.floor(Math.random() * 100) + 10;

            // Random Unsplash image based on category
            let imgUrl = 'https://images.unsplash.com/photo-1596462502278-27bfad450526?w=400';
            if (category === 'lipstick') imgUrl = 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400';
            if (category === 'foundation') imgUrl = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400';
            if (category === 'eyeshadow') imgUrl = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400';
            if (category === 'skincare') imgUrl = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400';
            if (category === 'fragrance') imgUrl = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400';
            if (category === 'mascara') imgUrl = 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400';

            const product = new Product({
                name,
                description: `Experience the luxury of ${name}. This ${category} from ${brand} is designed for premium skincare and beauty routines. Long-lasting and highly pigmented.`,
                price,
                category,
                brand,
                images: [{ url: imgUrl, alt: name }],
                stock,
                rating: { average: (Math.random() * (5 - 4) + 4).toFixed(1), count: Math.floor(Math.random() * 500) + 50 },
                features: ['Long-lasting', 'Premium quality', 'Dermatologist tested', 'Cruelty-free'],
                ingredients: ['Natural Extracts', 'Vitamin E', 'Essential Oils'],
                isFeatured: i <= 10 // first 10 products are featured
            });
            await product.save();
            products.push(product);
        }
        console.log('✅ Added 200 dummy products');

        // Create Purchase History (Orders) for users
        for (const user of users) {
            const orderCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 orders per user
            for (let j = 0; j < orderCount; j++) {
                const item1 = getRandom(products);
                const item2 = getRandom(products);

                const items = [
                    { productId: item1._id, name: item1.name, price: item1.price, quantity: 1, image: item1.images[0].url },
                    { productId: item2._id, name: item2.name, price: item2.price, quantity: 1, image: item2.images[0].url }
                ];

                const subtotal = items.reduce((sum, item) => sum + item.price, 0);
                const shipping = 100;
                const total = subtotal + shipping;

                const order = new Order({
                    userId: user._id.toString(),
                    items,
                    shippingAddress: {
                        name: user.name,
                        email: user.email,
                        phone: '9876543210',
                        address: '123 Beauty Street',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        pincode: '400001'
                    },
                    paymentMethod: 'COD',
                    subtotal,
                    shipping,
                    tax: 0,
                    total,
                    status: getRandom(['pending', 'processing', 'shipped', 'delivered']),
                    paymentStatus: 'pending'
                });
                await order.save();
            }
        }
        console.log('✅ Created purchase history for 4 users');

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
