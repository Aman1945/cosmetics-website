const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Auto-create admin for first-time use if it matches demo credentials
        if (email === 'admin@luxeglow.com' && password === 'admin123') {
            let admin = await User.findOne({ email });
            if (!admin) {
                console.log('Creating initial admin user...');
                admin = new User({
                    name: 'Admin User',
                    email: 'admin@luxeglow.com',
                    password: 'admin123',
                    role: 'admin'
                });
                await admin.save();
            }
        }

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Database Connection Error. Please ensure MongoDB whitelist (0.0.0.0/0) is enabled in Atlas.',
            error: error.message
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password')
            .populate('cart.product')
            .populate('wishlist');

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, addresses } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { name, addresses },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, shade } = req.body;

        const user = await User.findById(req.userId);

        // Check if product already in cart
        const existingItem = user.cart.find(
            item => item.product.toString() === productId && item.shade === shade
        );

        if (existingItem) {
            existingItem.quantity += quantity || 1;
        } else {
            user.cart.push({ product: productId, quantity: quantity || 1, shade });
        }

        await user.save();
        await user.populate('cart.product');

        res.json({
            success: true,
            message: 'Product added to cart',
            data: { cart: user.cart }
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding to cart',
            error: error.message
        });
    }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.userId);
        user.cart = user.cart.filter(item => item.product.toString() !== productId);

        await user.save();
        await user.populate('cart.product');

        res.json({
            success: true,
            message: 'Product removed from cart',
            data: { cart: user.cart }
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing from cart',
            error: error.message
        });
    }
};
