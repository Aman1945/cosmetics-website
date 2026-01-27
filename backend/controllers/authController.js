const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Register new user (sends OTP)
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

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create new user (unverified)
        const user = new User({
            name,
            email,
            password,
            emailOTP: otp,
            otpExpires: otpExpires,
            isVerified: false
        });

        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, name);
        } catch (emailError) {
            // Delete user if email fails
            await User.findByIdAndDelete(user._id);
            throw new Error('Failed to send OTP email. Please try again.');
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email for OTP verification.',
            data: {
                email: user.email,
                userId: user._id
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error registering user',
            error: error.message
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Check OTP expiry
        if (!user.otpExpires || user.otpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Verify OTP
        if (user.emailOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Mark user as verified and clear OTP
        user.isVerified = true;
        user.emailOTP = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Send welcome email
        await sendWelcomeEmail(email, user.name);

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Email verified successfully! Welcome to AS³Cosmetic! 🎉',
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
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP',
            error: error.message
        });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with new OTP
        user.emailOTP = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP email
        await sendOTPEmail(email, otp, user.name);

        res.json({
            success: true,
            message: 'OTP resent successfully! Please check your email.'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resending OTP',
            error: error.message
        });
    }
};

// Login user (requires verified email)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Auto-create admin for first-time use
        if (email === 'admin@as3cosmetic.com' && password === 'admin123') {
            let admin = await User.findOne({ email });
            if (!admin) {
                console.log('Creating initial admin user...');
                admin = new User({
                    name: 'Admin User',
                    email: 'admin@as3cosmetic.com',
                    password: 'admin123',
                    role: 'admin',
                    isVerified: true // Auto-verify admin
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

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email first. Check your inbox for the OTP.'
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
