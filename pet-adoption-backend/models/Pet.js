const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    enum: ['dog', 'cat', 'bird', 'fish', 'small_animal', 'reptile', 'other']
  },
  breed: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  ageUnit: {
    type: String,
    required: true,
    enum: ['days', 'months', 'years']
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'unknown']
  },
  size: {
    type: String,
    required: true,
    enum: ['small', 'medium', 'large', 'extra_large']
  },
  color: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  medicalHistory: {
    type: String
  },
  vaccinated: {
    type: Boolean,
    default: false
  },
  neutered: {
    type: Boolean,
    default: false
  },
  trained: {
    type: Boolean,
    default: false
  },
  temperament: [{
    type: String
  }],
  images: [{
    type: String
  }],
  adoptionFee: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'pending', 'adopted'],
    default: 'available'
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adoptionDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet; 