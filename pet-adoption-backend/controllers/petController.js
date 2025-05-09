const Pet = require('../models/Pet');
const Adoption = require('../models/Adoption');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Get all pets with filters
exports.getPets = async (req, res) => {
  try {
    const { 
      species, breed, minAge, maxAge, gender, size, 
      status, provider, sort, limit = 10, page = 1 
    } = req.query;
    
    const query = {};
    
    // Apply filters if they exist
    if (species) query.species = species;
    if (breed) query.breed = { $regex: breed, $options: 'i' };
    if (gender) query.gender = gender;
    if (size) query.size = size;
    if (status) query.status = status;
    if (provider) query.provider = provider;
    
    // Age range filter
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }
    
    // Default sort by creation date (newest first)
    const sortOption = sort ? sort : '-createdAt';
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const pets = await Pet.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('provider', 'username email role');
    
    // Get total count for pagination
    const totalPets = await Pet.countDocuments(query);
    
    res.json({
      pets,
      pagination: {
        total: totalPets,
        pages: Math.ceil(totalPets / parseInt(limit)),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single pet by ID
exports.getPetById = async (req, res) => {
  try {
    // Check if the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const pet = await Pet.findById(req.params.id)
      .populate('provider', 'username email role phone');
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    res.json(pet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new pet
exports.createPet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Set the provider to the current user
    const newPet = new Pet({
      ...req.body,
      provider: req.user.id
    });
    
    const pet = await newPet.save();
    res.status(201).json(pet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a pet
exports.updatePet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // Check if user owns the pet or is an admin
    if (pet.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Don't allow changing provider
    const { provider, ...updateData } = req.body;
    
    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    res.json(updatedPet);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a pet
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // Check if user owns the pet or is an admin
    if (pet.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Check if pet has active adoption applications
    const activeAdoptions = await Adoption.findOne({ 
      pet: req.params.id,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (activeAdoptions) {
      return res.status(400).json({ 
        message: 'Cannot delete pet with active adoption applications' 
      });
    }
    
    await pet.remove();
    
    res.json({ message: 'Pet removed' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload pet images
exports.uploadPetImages = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // Check if user owns the pet or is an admin
    if (pet.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // req.files should be an array of uploaded files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    // Process file paths (these would be saved after upload)
    const imagePaths = req.files.map(file => file.path);
    
    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: imagePaths } } },
      { new: true }
    );
    
    res.json(updatedPet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove a pet image
exports.removePetImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }
    
    const pet = await Pet.findById(id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // Check if user owns the pet or is an admin
    if (pet.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      { $pull: { images: imageUrl } },
      { new: true }
    );
    
    res.json(updatedPet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get stats for the current NGO
exports.getNgoPetStats = async (req, res) => {
  try {
    const ngoId = req.user.id;
    const totalPets = await Pet.countDocuments({ provider: ngoId });
    const availablePets = await Pet.countDocuments({ provider: ngoId, status: 'available' });
    const adoptedPets = await Pet.countDocuments({ provider: ngoId, status: 'adopted' });
    const pendingAdoptions = await Pet.countDocuments({ provider: ngoId, status: 'pending' });
    res.json({ totalPets, availablePets, adoptedPets, pendingAdoptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent pets for the current NGO
exports.getNgoRecentPets = async (req, res) => {
  try {
    const ngoId = req.user.id;
    const recentPets = await Pet.find({ provider: ngoId })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(recentPets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
