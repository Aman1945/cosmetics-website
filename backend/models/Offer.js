const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    badge: {
        type: String, // e.g., 'MEGA SALE', 'NEW', 'HOT'
        required: true
    },
    discount: {
        type: Number, // Percentage or fixed
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    targetProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    isLarge: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);
