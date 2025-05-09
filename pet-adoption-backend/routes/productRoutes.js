const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, isSeller, isAdmin } = require('../middleware/auth');
const Product = require('../models/Product');

// Placeholder for product controller
// Since we don't have a full implementation yet, we'll create simple placeholders
// This will be replaced with actual controller functions later

// @route   GET /api/products
// @desc    Get all products (optionally filter by shop)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.shop) {
      filter.shop = req.query.shop;
    }
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'name')
      .populate('seller', 'firstName lastName');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private - Sellers only
router.post('/', [auth, isSeller], async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      seller: req.user.id // or owner, depending on your model
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private - Owner or Admin
router.put('/:id', auth, (req, res) => {
  res.json({ message: `Update product with ID: ${req.params.id}` });
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private - Owner or Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user is the seller or an admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 