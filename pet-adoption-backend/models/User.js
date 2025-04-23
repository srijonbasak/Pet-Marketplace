const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },
  role: { 
    type: String, 
    enum: ['buyer', 'seller', 'admin', 'ngo', 'employee'], 
    required: true 
  },
  phone: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  profileImage: {
    type: String
  },
  bio: {
    type: String
  },
  // Fields specific to NGOs
  ngoDetails: {
    registrationNumber: String,
    foundationDate: Date,
    mission: String,
    website: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  // For favorite pets and products
  favorites: {
    pets: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet'
    }],
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Password hashing before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);  // Hash password
  }
  next();
});

// Compare entered password with the stored password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 