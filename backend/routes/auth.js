const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    register,
    login,
    getProfile,
    updateProfile,
    addToCart,
    removeFromCart
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/cart', auth, addToCart);
router.delete('/cart/:productId', auth, removeFromCart);

module.exports = router;
