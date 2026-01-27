const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            subtotal += product.price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                shade: item.shade,
                image: product.images[0]?.url
            });

            // Update product stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Calculate tax and shipping
        const tax = subtotal * 0.18; // 18% GST
        const shippingCost = subtotal > 999 ? 0 : 50;
        const totalAmount = subtotal + tax + shippingCost;

        // Create order
        const order = new Order({
            user: req.userId,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            tax,
            shippingCost,
            totalAmount
        });

        await order.save();

        // Clear user cart
        await User.findByIdAndUpdate(req.userId, { cart: [] });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: { order }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: { orders }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order or is admin
        if (order.user._id.toString() !== req.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: { order }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, orderStatus, trackingNumber } = req.body;

        // Accept either 'status' or 'orderStatus'
        const newStatus = status || orderStatus;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: newStatus,
                trackingNumber
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated',
            data: { order }
        });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order',
            error: error.message
        });
    }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 100 } = req.query;

        const query = {};
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('items.product')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)
            .lean();

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};
