// filepath: c:\Users\srijon\Documents\Pet-Marketplace\models\Pet.js
const mongoose = require('mongoose');

// Pet schema definition
const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  healthStatus: { type: String, required: true },
  adoptionStatus: { 
    type: String, 
    enum: ['available', 'adopted', 'pending'], 
    default: 'available' 
  },
  rescueStory: { type: String, required: true },
  photos: [String],  // Array of image URLs of the pet
  rescueOrg: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User (NGO or seller)
  createdAt: { type: Date, default: Date.now }
});

// Export the model
module.exports = mongoose.model('Pet', petSchema);