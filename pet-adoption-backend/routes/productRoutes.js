const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, isSeller, isAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const Employee = require('../models/Employee');
const Shop = require('../models/Shop');

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
// @access  Private - Sellers or Employees with canAddProducts permission
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is a seller
    if (req.user.role === 'seller') {
      const product = new Product({
        ...req.body,
        seller: req.user.id
      });
      await product.save();
      return res.status(201).json(product);
    } 
    // Check if user is an employee with proper permissions
    else if (req.user.role === 'employee') {
      const employee = await Employee.findById(req.user.id);
      
      if (!employee || !employee.isActive) {
        return res.status(403).json({ message: 'Your employee account is not active' });
      }
      
      if (!employee.permissions.canAddProducts) {
        return res.status(403).json({ message: 'You do not have permission to add products' });
      }
      
      // The seller ID should come from the request body since employees add products on behalf of the shop owner
      if (!req.body.seller || !req.body.shop) {
        return res.status(400).json({ message: 'Missing seller or shop information' });
      }
      
      // Verify the employee's shop matches the provided shop
      if (employee.shop.toString() !== req.body.shop) {
        return res.status(403).json({ message: 'You can only add products to your assigned shop' });
      }
      
      const product = new Product({
        ...req.body
      });
      
      await product.save();
      return res.status(201).json(product);
    } else {
      return res.status(403).json({ message: 'You are not authorized to add products' });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private - Owner or Admin
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user is the seller or an admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Fields that can be updated
    const {
      name,
      description,
      category,
      buyPrice,
      price,
      stock,
      images
    } = req.body;

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (buyPrice !== undefined) product.buyPrice = buyPrice;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (images) product.images = images;

    // Save the updated product
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
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