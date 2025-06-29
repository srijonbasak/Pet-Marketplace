const mongoose = require('mongoose');

const inventoryAdjustmentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  adjustedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Will be the seller/owner when approved
  },
  type: {
    type: String,
    enum: ['restock', 'adjustment', 'sale', 'damaged', 'expired'],
    required: true
  },
  quantityChange: {
    type: Number,
    required: true
  },
  damagedQuantity: {
    type: Number,
    default: 0
  },
  expiredQuantity: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  notes: {
    type: String
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  }
}, { timestamps: true });

const InventoryAdjustment = mongoose.model('InventoryAdjustment', inventoryAdjustmentSchema);

module.exports = InventoryAdjustment; 