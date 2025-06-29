const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile_banking'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'cancelled'],
    default: 'paid'
  },
  notes: String
}, { timestamps: true });

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
  try {
    if (!this.invoiceNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const count = await this.constructor.countDocuments() + 1;
      this.invoiceNumber = `INV-${year}${month}-${count.toString().padStart(4, '0')}`;
      console.log("Generated invoice number:", this.invoiceNumber);
    }
    next();
  } catch (error) {
    console.error("Error generating invoice number:", error);
    // Fallback to timestamp if generation fails
    if (!this.invoiceNumber) {
      this.invoiceNumber = `INV-${Date.now()}`;
    }
    next();
  }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice; 