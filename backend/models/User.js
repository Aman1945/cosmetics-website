const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true }, // Made optional
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    address: {
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    isVerified: { type: Boolean, default: false },
    emailOTP: { type: String }, // Store OTP for email verification
    otpExpires: { type: Date }, // OTP expiration time
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
