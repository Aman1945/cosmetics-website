const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Get analytics data for admin dashboard
router.get('/analytics', auth, adminAuth, async (req, res) => {
    try {
        // Get total revenue
        const revenueData = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalRevenue = revenueData[0]?.total || 0;

        // Get total orders
        const totalOrders = await Order.countDocuments();

        // Get pending orders
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        // Get total users
        const totalUsers = await User.countDocuments();

        // Get total products
        const totalProducts = await Product.countDocuments();

        // Get recent orders
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Calculate estimated profit (assuming 30% margin)
        const estimatedProfit = Math.round(totalRevenue * 0.3);

        const summary = {
            totalRevenue,
            totalOrders,
            pendingOrders,
            totalUsers,
            totalProducts,
            estimatedProfit
        };

        res.json({
            success: true,
            data: {
                summary,
                recentOrders
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
});

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: { users }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

module.exports = router;
