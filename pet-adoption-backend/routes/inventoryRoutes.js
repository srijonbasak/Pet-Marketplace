const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const InventoryAdjustment = require('../models/InventoryAdjustment');
const Product = require('../models/Product');
const Employee = require('../models/Employee');
const Shop = require('../models/Shop');
const User = require('../models/User');

// Create inventory adjustment (employee only)
router.post('/adjustments', auth, async (req, res) => {
  try {
    console.log('Creating inventory adjustment:', req.body);
    // Check if user is an employee
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Only employees can create inventory adjustments' });
    }
    
    const employee = await Employee.findById(req.user.id);
    if (!employee || !employee.isActive) {
      return res.status(403).json({ message: 'Employee account is not active' });
    }
    
    if (!employee.permissions.canManageInventory) {
      return res.status(403).json({ message: 'You do not have permission to manage inventory' });
    }
    
    // Validate the product exists and belongs to the employee's shop
    const product = await Product.findOne({
      _id: req.body.product,
      shop: employee.shop
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not part of your shop' });
    }
    
    // Create the adjustment record
    const adjustment = new InventoryAdjustment({
      ...req.body,
      adjustedBy: req.user.id,
      shop: employee.shop,
      // Ensure these are set correctly
      previousStock: product.stock,
      requiresApproval: req.body.requiresApproval || 
        (req.body.damagedQuantity > 0 || req.body.expiredQuantity > 0),
      status: (req.body.damagedQuantity > 0 || req.body.expiredQuantity > 0) ? 'pending' : 'approved'
    });
    
    // Save the adjustment
    await adjustment.save();
    
    // If no approval required, update the product stock immediately
    if (adjustment.status === 'approved') {
      product.stock = adjustment.newStock;
      await product.save();
    }
    
    res.status(201).json(adjustment);
  } catch (error) {
    console.error('Error creating inventory adjustment:', error);
    res.status(500).json({ 
      message: error.message,
      error: error.toString() 
    });
  }
});

// Get all pending adjustments for a shop (seller only)
router.get('/adjustments/pending', auth, async (req, res) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can view pending adjustments' });
    }
    
    // Find the seller's shop
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    // Get all pending adjustments for this shop
    const adjustments = await InventoryAdjustment.find({
      shop: shop._id,
      status: 'pending'
    })
    .populate('product', 'name images category price')
    .populate('adjustedBy', 'firstName lastName email')
    .sort({ createdAt: -1 });
    
    res.json(adjustments);
  } catch (error) {
    console.error('Error fetching pending adjustments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get adjustment history for a shop (seller or employee)
router.get('/adjustments', auth, async (req, res) => {
  try {
    let shopId;
    
    if (req.user.role === 'seller') {
      // Find the seller's shop
      const shop = await Shop.findOne({ owner: req.user.id });
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      shopId = shop._id;
    } else if (req.user.role === 'employee') {
      // Get employee's shop
      const employee = await Employee.findById(req.user.id);
      if (!employee || !employee.isActive) {
        return res.status(403).json({ message: 'Employee account is not active' });
      }
      shopId = employee.shop;
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Apply filters
    const filter = { shop: shopId };
    
    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Type filter
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Product filter
    if (req.query.product) {
      filter.product = req.query.product;
    }
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setDate(endDate.getDate() + 1); // Include the end date
        filter.createdAt.$lt = endDate;
      }
    }
    
    const adjustments = await InventoryAdjustment.find(filter)
      .populate('product', 'name images category price')
      .populate('adjustedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(adjustments);
  } catch (error) {
    console.error('Error fetching adjustments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Approve/reject an adjustment (seller only)
router.put('/adjustments/:id/status', auth, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ message: 'Status must be "approved" or "rejected"' });
    }
    
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can approve/reject adjustments' });
    }
    
    // Find the seller's shop
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    // Find the adjustment
    const adjustment = await InventoryAdjustment.findOne({
      _id: req.params.id,
      shop: shop._id,
      status: 'pending'
    });
    
    if (!adjustment) {
      return res.status(404).json({ message: 'Adjustment not found or not pending' });
    }
    
    // Update the adjustment status
    adjustment.status = status;
    adjustment.approvedBy = req.user.id;
    
    if (status === 'rejected') {
      if (!rejectionReason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }
      adjustment.rejectionReason = rejectionReason;
    } else if (status === 'approved') {
      // Update the product stock
      const product = await Product.findById(adjustment.product);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      product.stock = adjustment.newStock;
      await product.save();
    }
    
    await adjustment.save();
    
    res.json(adjustment);
  } catch (error) {
    console.error('Error updating adjustment status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get stock update endpoint for direct stock updates (for regular adjustments)
router.put('/products/:id/stock', auth, async (req, res) => {
  try {
    const { stock } = req.body;
    
    if (stock === undefined) {
      return res.status(400).json({ message: 'Stock value is required' });
    }
    
    let shopId;
    
    if (req.user.role === 'seller') {
      // Find the seller's shop
      const shop = await Shop.findOne({ owner: req.user.id });
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      shopId = shop._id;
    } else if (req.user.role === 'employee') {
      // Get employee's shop
      const employee = await Employee.findById(req.user.id);
      if (!employee || !employee.isActive) {
        return res.status(403).json({ message: 'Employee account is not active' });
      }
      if (!employee.permissions.canManageInventory) {
        return res.status(403).json({ message: 'You do not have permission to manage inventory' });
      }
      shopId = employee.shop;
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Find the product
    const product = await Product.findOne({
      _id: req.params.id,
      shop: shopId
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found or not part of your shop' });
    }
    
    // Update stock
    product.stock = Math.max(0, stock); // Ensure stock is not negative
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 