// Quick Email Test Script
require('dotenv').config();
const { generateOTP, sendOTPEmail } = require('./utils/emailService');

async function testEmail() {
    console.log('📧 Testing Email Service...\n');

    console.log('Email Config:');
    console.log('- EMAIL_USER:', process.env.EMAIL_USER);
    console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
    console.log('');

    try {
        const otp = generateOTP();
        console.log('Generated OTP:', otp);
        console.log('Sending email...\n');

        await sendOTPEmail(
            process.env.EMAIL_USER, // Send to same email for testing
            otp,
            'Test User'
        );

        console.log('✅ SUCCESS! Email sent successfully!');
        console.log('📧 Check your inbox:', process.env.EMAIL_USER);
        console.log('🔢 OTP Code:', otp);

    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }

    process.exit();
}

testEmail();
