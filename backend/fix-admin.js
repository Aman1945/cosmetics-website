// Fix Admin Password
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

async function fixAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        // Find admin
        const admin = await User.findOne({ email: 'admin@as3cosmetic.com' });

        if (!admin) {
            console.log('❌ Admin not found! Creating new admin...');

            const hashedPassword = await bcrypt.hash('admin123', 10);
            const newAdmin = await User.create({
                name: 'Aman Admin',
                email: 'admin@as3cosmetic.com',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                isVerified: true
            });

            console.log('✅ New admin created!');
            console.log(`   Email: ${newAdmin.email}`);
            console.log(`   Password: admin123`);
        } else {
            console.log('✅ Admin found! Updating password...');

            // Hash new password
            const hashedPassword = await bcrypt.hash('admin123', 10);

            // Update admin
            admin.password = hashedPassword;
            admin.role = 'admin';
            admin.isActive = true;
            admin.isVerified = true;
            await admin.save();

            console.log('✅ Admin password updated!');
            console.log(`   Email: ${admin.email}`);
            console.log(`   Password: admin123`);
            console.log(`   Role: ${admin.role}`);
        }

        mongoose.connection.close();
        console.log('\n✅ Admin is ready to use!');
        console.log('\n🔐 LOGIN CREDENTIALS:');
        console.log('   Email: admin@as3cosmetic.com');
        console.log('   Password: admin123');
        console.log('\n🌐 URL: http://localhost:8000/admin.html');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixAdmin();
