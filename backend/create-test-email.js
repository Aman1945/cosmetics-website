const nodemailer = require('nodemailer');

// For testing - creates a test account
async function createTestEmailConfig() {
    try {
        // Create test account
        const testAccount = await nodemailer.createTestAccount();

        console.log('📧 Test Email Account Created!');
        console.log('');
        console.log('Add these to your .env file:');
        console.log('EMAIL_USER=' + testAccount.user);
        console.log('EMAIL_PASSWORD=' + testAccount.pass);
        console.log('');
        console.log('View emails at: https://ethereal.email/messages');

    } catch (error) {
        console.error('Error:', error);
    }
}

createTestEmailConfig();
