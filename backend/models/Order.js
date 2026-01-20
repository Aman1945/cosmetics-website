const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: [{
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    shippingAddress: {
        name: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        altPhone: String
    },
    paymentMethod: { type: String, required: true },
    subtotal: Number,
    shipping: Number,
    tax: Number,
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
