const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    getAllOrders
} = require('../controllers/orderController');

// Admin routes (must come first!)
router.get('/', auth, adminAuth, getAllOrders);
router.put('/:id', auth, adminAuth, updateOrderStatus);

// User routes
router.post('/', auth, createOrder);
router.get('/my-orders', auth, getUserOrders);
router.get('/:id', auth, getOrderById);

module.exports = router;
