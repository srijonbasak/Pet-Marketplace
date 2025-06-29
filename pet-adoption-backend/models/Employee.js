const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  role: {
    type: String,
    enum: ['employee'],
    default: 'employee'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    canAddProducts: {
      type: Boolean,
      default: true
    },
    canCreateInvoices: {
      type: Boolean,
      default: true
    },
    canManageInventory: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee; 