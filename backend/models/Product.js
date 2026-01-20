const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['lipstick', 'foundation', 'eyeshadow', 'mascara', 'skincare', 'fragrance', 'other']
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: String
    }],
    model3D: {
        url: String,
        format: {
            type: String,
            enum: ['gltf', 'glb', 'obj', 'fbx']
        }
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    features: [String],
    ingredients: [String],
    shades: [{
        name: String,
        color: String,
        stock: Number
    }],
    isFeatured: {
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

// Index for search optimization
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
