const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const sampleProducts = [
    {
        name: 'Velvet Matte Lipstick - Ruby Red',
        description: 'Long-lasting matte lipstick with rich, vibrant color. Infused with vitamin E for soft, smooth lips.',
        price: 1299,
        category: 'lipstick',
        brand: 'LuxeGlow',
        images: [
            { url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400', alt: 'Ruby Red Lipstick' }
        ],
        stock: 50,
        rating: { average: 4.8, count: 245 },
        features: ['Long-lasting', 'Matte finish', 'Vitamin E enriched', 'Cruelty-free'],
        ingredients: ['Vitamin E', 'Jojoba Oil', 'Shea Butter'],
        shades: [
            { name: 'Ruby Red', color: '#DC143C', stock: 50 },
            { name: 'Rose Pink', color: '#FF69B4', stock: 45 },
            { name: 'Coral Bliss', color: '#FF7F50', stock: 40 }
        ],
        isFeatured: true
    },
    {
        name: 'Radiant Glow Foundation',
        description: 'Lightweight foundation that provides buildable coverage with a natural, radiant finish. SPF 30 protection.',
        price: 2499,
        category: 'foundation',
        brand: 'LuxeGlow',
        images: [
            { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', alt: 'Foundation' }
        ],
        stock: 30,
        rating: { average: 4.9, count: 189 },
        features: ['SPF 30', 'Buildable coverage', 'Natural finish', 'All-day wear'],
        ingredients: ['Hyaluronic Acid', 'Vitamin C', 'SPF 30'],
        shades: [
            { name: 'Fair', color: '#F5D7C3', stock: 30 },
            { name: 'Medium', color: '#D4A574', stock: 35 },
            { name: 'Deep', color: '#8D5524', stock: 25 }
        ],
        isFeatured: true
    },
    {
        name: 'Shimmer Eyeshadow Palette - Sunset Dreams',
        description: '12 highly pigmented shades ranging from warm neutrals to vibrant sunset hues. Perfect for day and night looks.',
        price: 1899,
        category: 'eyeshadow',
        brand: 'LuxeGlow',
        images: [
            { url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400', alt: 'Eyeshadow Palette' }
        ],
        stock: 45,
        rating: { average: 4.7, count: 312 },
        features: ['12 shades', 'Highly pigmented', 'Blendable', 'Long-lasting'],
        ingredients: ['Mica', 'Vitamin E', 'Natural Minerals'],
        isFeatured: true
    },
    {
        name: 'Volume Boost Mascara',
        description: 'Dramatic volume and length without clumping. Smudge-proof formula lasts all day.',
        price: 999,
        category: 'mascara',
        brand: 'LuxeGlow',
        images: [
            { url: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400', alt: 'Mascara' }
        ],
        stock: 60,
        rating: { average: 4.6, count: 156 },
        features: ['Volumizing', 'Lengthening', 'Smudge-proof', 'Easy removal'],
        ingredients: ['Beeswax', 'Carnauba Wax', 'Vitamin B5'],
        isFeatured: false
    },
    {
        name: 'Hydrating Vitamin C Serum',
        description: 'Powerful antioxidant serum that brightens skin and reduces signs of aging. Suitable for all skin types.',
        price: 3499,
        category: 'skincare',
        brand: 'LuxeGlow',
        images: [
            { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', alt: 'Vitamin C Serum' }
        ],
        stock: 25,
        rating: { average: 4.9, count: 423 },
        features: ['Brightening', 'Anti-aging', 'Hydrating', 'Dermatologist tested'],
        ingredients: ['Vitamin C', 'Hyaluronic Acid', 'Vitamin E', 'Ferulic Acid'],
        isFeatured: true
    },
    {
        name: 'Luxury Eau de Parfum - Midnight Rose',
        description: 'Sophisticated floral fragrance with notes of rose, jasmine, and vanilla. Long-lasting scent.',
        price: 5999,
        category: 'fragrance',
        brand: 'LuxeGlow',
        images: [
            { url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', alt: 'Perfume' }
        ],
        stock: 15,
        rating: { average: 5.0, count: 89 },
        features: ['Long-lasting', 'Floral notes', 'Luxury packaging', 'Gift-ready'],
        ingredients: ['Rose Extract', 'Jasmine', 'Vanilla', 'Amber'],
        isFeatured: true
    },
    {
        name: 'Matte Finish Setting Powder',
        description: 'Translucent setting powder that controls shine and sets makeup for all-day wear.',
        price: 1599,
        category: 'foundation',
        brand: 'LuxeGlow',
        images: [
            { url: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400', alt: 'Setting Powder' }
        ],
        stock: 40,
        rating: { average: 4.7, count: 178 },
        features: ['Oil control', 'Translucent', 'Lightweight', 'Blurs pores'],
        ingredients: ['Silica', 'Mica', 'Vitamin E'],
        isFeatured: false
    },
    {
        name: 'Nourishing Night Cream',
        description: 'Rich night cream that deeply hydrates and repairs skin while you sleep. Wake up to glowing skin.',
        price: 2899,
        category: 'skincare',
        brand: 'LuxeGlow',
        images: [
            { url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', alt: 'Night Cream' }
        ],
        stock: 35,
        rating: { average: 4.8, count: 267 },
        features: ['Deep hydration', 'Anti-aging', 'Repairs skin', 'Non-greasy'],
        ingredients: ['Retinol', 'Peptides', 'Shea Butter', 'Vitamin E'],
        isFeatured: false
    }
];

const sampleAdmin = {
    name: 'Admin User',
    email: 'admin@luxeglow.com',
    password: 'admin123',
    role: 'admin'
};

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert products
        const products = await Product.insertMany(sampleProducts);
        console.log(`✅ Added ${products.length} products`);

        // Insert admin user
        const admin = new User(sampleAdmin);
        await admin.save();
        console.log('✅ Added admin user');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\nAdmin credentials:');
        console.log('Email: admin@luxeglow.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
