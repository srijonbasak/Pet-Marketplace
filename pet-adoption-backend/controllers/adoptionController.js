const Adoption = require('../models/Adoption');
const Pet = require('../models/Pet');
const { validationResult } = require('express-validator');

// Get all adoption applications with filters
exports.getAdoptions = async (req, res) => {
  try {
    const {
      status,
      pet,
      applicant,
      provider,
      sort,
      limit = 10,
      page = 1
    } = req.query;

    // Build query based on user role
    const query = {};
    
    // Filter by status if provided
    if (status) query.status = status;
    
    // Filter by specific pet if provided
    if (pet) query.pet = pet;
    
    // Users can only see their own applications, unless they're an admin
    if (req.user.role === 'admin') {
      // Admins can see all applications, or filter by specific user
      if (applicant) query.applicant = applicant;
      if (provider) query.provider = provider;
    } else if (req.user.role === 'ngo' || req.user.role === 'seller') {
      // Providers can only see applications for their pets
      query.provider = req.user.id;
    } else {
      // Regular users can only see their own applications
      query.applicant = req.user.id;
    }

    // Default sort by application date (newest first)
    const sortOption = sort ? sort : '-applicationDate';
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const adoptions = await Adoption.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('pet', 'name species breed images status')
      .populate('applicant', 'username')
      .populate('provider', 'username');
    
    // Get total count for pagination
    const totalAdoptions = await Adoption.countDocuments(query);
    
    res.json({
      adoptions,
      pagination: {
        total: totalAdoptions,
        pages: Math.ceil(totalAdoptions / parseInt(limit)),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single adoption by ID
exports.getAdoptionById = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id)
      .populate('pet', 'name species breed images status provider')
      .populate('applicant', 'username email phone')
      .populate('provider', 'username email phone');
    
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption application not found' });
    }
    
    // Check if user is allowed to view this adoption
    if (
      req.user.role !== 'admin' &&
      adoption.applicant._id.toString() !== req.user.id &&
      adoption.provider._id.toString() !== req.user.id
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(adoption);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Adoption application not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new adoption application
exports.createAdoption = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { petId, applicationDetails } = req.body;
  
  try {
    // Check if pet exists and is available
    const pet = await Pet.findById(petId);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    if (pet.status !== 'available') {
      return res.status(400).json({ message: 'Pet is not available for adoption' });
    }
    
    // Check if user already has a pending application for this pet
    const existingApplication = await Adoption.findOne({
      pet: petId,
      applicant: req.user.id,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You already have a pending application for this pet' 
      });
    }
    
    // Create new adoption application
    const newAdoption = new Adoption({
      pet: petId,
      applicant: req.user.id,
      provider: pet.provider,
      applicationDetails
    });
    
    const adoption = await newAdoption.save();
    
    // Update pet status to pending
    await Pet.findByIdAndUpdate(petId, { status: 'pending' });
    
    res.status(201).json(adoption);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update adoption status
exports.updateAdoptionStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { status, notes } = req.body;
  
  try {
    let adoption = await Adoption.findById(req.params.id);
    
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption application not found' });
    }
    
    // Only provider or admin can update status
    if (
      req.user.role !== 'admin' &&
      adoption.provider.toString() !== req.user.id
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Handle different status updates
    if (status === 'approved') {
      // Can only approve if current status is pending
      if (adoption.status !== 'pending') {
        return res.status(400).json({ 
          message: 'Can only approve applications that are pending' 
        });
      }
    } else if (status === 'rejected') {
      // Can only reject if current status is pending
      if (adoption.status !== 'pending') {
        return res.status(400).json({ 
          message: 'Can only reject applications that are pending' 
        });
      }
      
      // Make pet available again
      await Pet.findByIdAndUpdate(adoption.pet, { status: 'available' });
    } else if (status === 'completed') {
      // Can only complete if current status is approved
      if (adoption.status !== 'approved') {
        return res.status(400).json({ 
          message: 'Can only complete applications that are approved' 
        });
      }
      
      // Update pet as adopted and set the adopter
      await Pet.findByIdAndUpdate(adoption.pet, { 
        status: 'adopted',
        adoptedBy: adoption.applicant,
        adoptionDate: Date.now()
      });
      
      // Set completion date
      adoption.completionDate = Date.now();
    } else if (status === 'cancelled') {
      // Applicant can cancel their own application, or provider/admin can cancel it
      if (
        req.user.role !== 'admin' &&
        adoption.provider.toString() !== req.user.id &&
        adoption.applicant.toString() !== req.user.id
      ) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      if (!['pending', 'approved'].includes(adoption.status)) {
        return res.status(400).json({ 
          message: 'Can only cancel applications that are pending or approved' 
        });
      }
      
      // Make pet available again
      await Pet.findByIdAndUpdate(adoption.pet, { status: 'available' });
    }
    
    // Update status
    adoption.status = status;
    
    // Add note if provided
    if (notes) {
      adoption.notes.push({
        author: req.user.id,
        content: notes
      });
    }
    
    await adoption.save();
    
    // Populate the response
    adoption = await Adoption.findById(req.params.id)
      .populate('pet', 'name species breed images status')
      .populate('applicant', 'username')
      .populate('provider', 'username');
    
    res.json(adoption);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a message to the adoption communication
exports.addMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { message } = req.body;
  
  try {
    const adoption = await Adoption.findById(req.params.id);
    
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption application not found' });
    }
    
    // Check if user is part of this adoption process
    if (
      req.user.role !== 'admin' &&
      adoption.applicant.toString() !== req.user.id &&
      adoption.provider.toString() !== req.user.id
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Add message
    adoption.messages.push({
      sender: req.user.id,
      message
    });
    
    await adoption.save();
    
    res.json(adoption.messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a follow-up entry after adoption
exports.addFollowUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { notes, images } = req.body;
  
  try {
    let adoption = await Adoption.findById(req.params.id);
    
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption application not found' });
    }
    
    // Only provider, admin or applicant can add follow-ups
    if (
      req.user.role !== 'admin' &&
      adoption.provider.toString() !== req.user.id &&
      adoption.applicant.toString() !== req.user.id
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Can only add follow-ups for completed adoptions
    if (adoption.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Can only add follow-ups for completed adoptions' 
      });
    }
    
    // Add follow-up entry
    adoption.followUp.push({
      date: Date.now(),
      notes,
      images: images || [],
      conductedBy: req.user.id
    });
    
    await adoption.save();
    
    res.json(adoption.followUp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 