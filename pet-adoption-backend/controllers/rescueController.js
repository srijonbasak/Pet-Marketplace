const Rescue = require('../models/Rescue');
const { validationResult } = require('express-validator');

// Get all rescue operations with filters
exports.getRescues = async (req, res) => {
  try {
    const {
      status,
      ngo,
      location,
      sort,
      limit = 10,
      page = 1
    } = req.query;
    
    // Build query based on filters
    const query = {};
    
    // Filter by status if provided
    if (status) query.status = status;
    
    // Filter by NGO ID if provided
    if (ngo) query.ngo = ngo;
    
    // Filter by location (city, state, country)
    if (location) {
      if (location.city) query['location.city'] = { $regex: location.city, $options: 'i' };
      if (location.state) query['location.state'] = { $regex: location.state, $options: 'i' };
      if (location.country) query['location.country'] = { $regex: location.country, $options: 'i' };
    }
    
    // Default sort by creation date (newest first)
    const sortOption = sort ? sort : '-createdAt';
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find rescue operations that match the query
    const rescues = await Rescue.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('ngo', 'username email role ngoDetails')
      .populate('team.member', 'username');
    
    // Get total count for pagination
    const totalRescues = await Rescue.countDocuments(query);
    
    res.json({
      rescues,
      pagination: {
        total: totalRescues,
        pages: Math.ceil(totalRescues / parseInt(limit)),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single rescue operation by ID
exports.getRescueById = async (req, res) => {
  try {
    const rescue = await Rescue.findById(req.params.id)
      .populate('ngo', 'username email role ngoDetails')
      .populate('team.member', 'username')
      .populate('funding.donations.donor', 'username')
      .populate('updates.author', 'username');
    
    if (!rescue) {
      return res.status(404).json({ message: 'Rescue operation not found' });
    }
    
    res.json(rescue);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Rescue operation not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new rescue operation
exports.createRescue = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Only NGOs and admins can create rescue operations
    if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized. Only NGOs can create rescue operations' });
    }
    
    // Set the NGO to the current user if they are an NGO, otherwise use the provided NGO ID
    const ngoId = req.user.role === 'ngo' ? req.user.id : req.body.ngo;
    
    // Create new rescue operation
    const newRescue = new Rescue({
      ...req.body,
      ngo: ngoId
    });
    
    const rescue = await newRescue.save();
    
    res.status(201).json(rescue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a rescue operation
exports.updateRescue = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const rescue = await Rescue.findById(req.params.id);
    
    if (!rescue) {
      return res.status(404).json({ message: 'Rescue operation not found' });
    }
    
    // Check authorization - only the NGO that created the rescue or an admin can update it
    if (rescue.ngo.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Don't allow changing the NGO
    const { ngo, ...updateData } = req.body;
    
    const updatedRescue = await Rescue.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    res.json(updatedRescue);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Rescue operation not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update rescue status
exports.updateRescueStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { status } = req.body;
  
  try {
    const rescue = await Rescue.findById(req.params.id);
    
    if (!rescue) {
      return res.status(404).json({ message: 'Rescue operation not found' });
    }
    
    // Check authorization - only the NGO that created the rescue or an admin can update it
    if (rescue.ngo.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Handle status-specific logic
    if (status === 'completed') {
      rescue.rescueDate.actual = Date.now();
    }
    
    // Update status
    rescue.status = status;
    await rescue.save();
    
    res.json(rescue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add team members to a rescue operation
exports.addTeamMembers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { members } = req.body;
  
  try {
    const rescue = await Rescue.findById(req.params.id);
    
    if (!rescue) {
      return res.status(404).json({ message: 'Rescue operation not found' });
    }
    
    // Check authorization - only the NGO that created the rescue or an admin can update it
    if (rescue.ngo.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Add all new team members
    rescue.team.push(...members);
    await rescue.save();
    
    res.json(rescue.team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add an update to a rescue operation
exports.addUpdate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { content, images } = req.body;
  
  try {
    const rescue = await Rescue.findById(req.params.id);
    
    if (!rescue) {
      return res.status(404).json({ message: 'Rescue operation not found' });
    }
    
    // Check if user is part of the rescue team or is the NGO or an admin
    const isTeamMember = rescue.team.some(member => 
      member.member && member.member.toString() === req.user.id
    );
    
    if (!isTeamMember && 
        rescue.ngo.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Add update
    rescue.updates.push({
      content,
      author: req.user.id,
      images: images || []
    });
    
    await rescue.save();
    
    res.json(rescue.updates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a donation to a rescue operation
exports.addDonation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { amount, message, anonymous, anonymousDonor } = req.body;
  
  try {
    const rescue = await Rescue.findById(req.params.id);
    
    if (!rescue) {
      return res.status(404).json({ message: 'Rescue operation not found' });
    }
    
    // Create donation object
    const donation = {
      amount,
      message
    };
    
    // Handle anonymous vs. authenticated donations
    if (anonymous) {
      donation.anonymousDonor = anonymousDonor;
    } else {
      donation.donor = req.user.id;
    }
    
    // Add donation to the rescue
    rescue.funding.donations.push(donation);
    
    // Update total raised amount
    rescue.funding.raised += amount;
    
    await rescue.save();
    
    res.json(rescue.funding);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update rescue outcomes
exports.updateOutcomes = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { outcomes } = req.body;
  
  try {
    const rescue = await Rescue.findById(req.params.id);
    
    if (!rescue) {
      return res.status(404).json({ message: 'Rescue operation not found' });
    }
    
    // Check authorization - only the NGO that created the rescue or an admin can update it
    if (rescue.ngo.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update outcomes
    rescue.outcomes = {
      ...rescue.outcomes,
      ...outcomes
    };
    
    await rescue.save();
    
    res.json(rescue.outcomes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 