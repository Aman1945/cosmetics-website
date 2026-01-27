const Product = require('../models/Product');
const NodeCache = require('node-cache');
const productCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Get all products with filtering and pagination
exports.getAllProducts = async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;

        // Create a unique cache key based on query parameters
        const cacheKey = `products_${JSON.stringify(req.query)}`;
        const cachedData = productCache.get(cacheKey);

        if (cachedData) {
            console.log('Serving from cache:', cacheKey);
            return res.json(cachedData);
        }

        // Build query
        const query = { isActive: true };

        if (category) query.category = category;
        if (brand) query.brand = brand;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.$text = { $search: search };
        }

        // Build sort
        let sortOption = {};
        switch (sort) {
            case 'price-asc':
                sortOption = { price: 1 };
                break;
            case 'price-desc':
                sortOption = { price: -1 };
                break;
            case 'rating':
                sortOption = { 'rating.average': -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const products = await Product.find(query)
            .sort(sortOption)
            .limit(Number(limit))
            .skip(skip)
            .lean();

        const total = await Product.countDocuments(query);

        const responseData = {
            success: true,
            data: {
                products,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        };

        // Store in cache
        productCache.set(cacheKey, responseData);

        res.json(responseData);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true })
            .limit(8)
            .sort({ 'rating.average': -1 });

        res.json({
            success: true,
            data: { products }
        });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured products',
            error: error.message
        });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: { product }
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();

        productCache.flushAll(); // Clear cache for new data
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        productCache.flushAll(); // Clear cache for updated data
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        productCache.flushAll(); // Clear cache for deleted data
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

// Get categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });

        res.json({
            success: true,
            data: { categories }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// Get brands
exports.getBrands = async (req, res) => {
    try {
        const brands = await Product.distinct('brand', { isActive: true });

        res.json({
            success: true,
            data: { brands }
        });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching brands',
            error: error.message
        });
    }
};
