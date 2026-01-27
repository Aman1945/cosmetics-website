// Test Admin Login
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

async function testLogin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        const email = 'admin@as3cosmetic.com';
        const password = 'admin123';

        // Find user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ User not found!');
            mongoose.connection.close();
            return;
        }

        console.log('✅ User found!');
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   isVerified: ${user.isVerified}`);
        console.log(`   isActive: ${user.isActive}`);
        console.log(`   Password hash exists: ${user.password ? 'Yes' : 'No'}`);

        // Test password
        if (user.password) {
            const isValid = await user.comparePassword(password);
            console.log(`\n🔑 Password 'admin123' test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

            if (!isValid) {
                console.log('\n🔧 Fixing password...');
                user.password = password; // Will be hashed by pre-save hook
                await user.save();
                console.log('✅ Password updated!');

                // Test again
                const userUpdated = await User.findOne({ email }).select('+password');
                const isValidNow = await userUpdated.comparePassword(password);
                console.log(`🔑 Password test after fix: ${isValidNow ? '✅ VALID' : '❌ INVALID'}`);
            }
        } else {
            console.log('\n❌ No password set! Setting password...');
            user.password = password;
            await user.save();
            console.log('✅ Password set!');
        }

        mongoose.connection.close();
        console.log('\n✅ Done!');
        console.log('\n🔐 Try logging in now:');
        console.log('   Email: admin@as3cosmetic.com');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testLogin();
