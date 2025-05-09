const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Get all orders for a seller's shop
router.get('/', auth, orderController.getOrdersBySeller);

// Create a new order
router.post('/', auth, orderController.createOrder);

// Update order status
router.put('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router; 