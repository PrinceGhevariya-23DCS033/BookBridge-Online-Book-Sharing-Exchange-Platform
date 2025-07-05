const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const cartController = require('../controllers/cart.controller');

// All routes are protected with auth middleware
router.use(auth);

// Get cart
router.get('/', cartController.getCart);

// Add to cart
router.post('/', cartController.addToCart);

// Update quantity
router.put('/:id', cartController.updateQuantity);

// Remove from cart
router.delete('/:id', cartController.removeFromCart);

// Clear cart
router.delete('/', cartController.clearCart);

// Checkout
router.post('/checkout', cartController.checkout);

module.exports = router; 