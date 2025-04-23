const User = require('../models/User');
const Pet = require('../models/Pet');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register a new user
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    user = new User({
      username,
      email,
      password,
      role: role || 'buyer' // Default role is buyer
    });

    // Save the user
    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    username,
    email,
    phone,
    address,
    bio,
    profileImage,
    ngoDetails
  } = req.body;

  try {
    // Build update object
    const userFields = {};
    if (username) userFields.username = username;
    if (email) userFields.email = email;
    if (phone) userFields.phone = phone;
    if (address) userFields.address = address;
    if (bio) userFields.bio = bio;
    if (profileImage) userFields.profileImage = profileImage;
    
    // Only update NGO details if the user is an NGO
    const user = await User.findById(req.user.id);
    if (user.role === 'ngo' && ngoDetails) {
      userFields.ngoDetails = ngoDetails;
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    // Get user
    const user = await User.findById(req.user.id);

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user by ID (for public profile)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email -phone')
      .populate('favorites.pets', 'name images species breed status')
      .populate('favorites.products', 'name images price category');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's pets (if seller or NGO)
    let pets = [];
    if (['seller', 'ngo'].includes(user.role)) {
      pets = await Pet.find({ 
        provider: req.params.id,
        status: 'available'
      }).select('name images species breed status');
    }

    // Get user's products (if seller)
    let products = [];
    if (user.role === 'seller') {
      products = await Product.find({
        seller: req.params.id
      }).select('name images price category');
    }

    res.json({
      user,
      listings: {
        pets,
        products
      }
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};

// Add to favorites
exports.addToFavorites = async (req, res) => {
  const { type, id } = req.body;

  // Validate type
  if (!['pet', 'product'].includes(type)) {
    return res.status(400).json({ message: 'Invalid favorite type' });
  }

  try {
    let user = await User.findById(req.user.id);

    // Check if already in favorites
    const favoritesField = `favorites.${type}s`;
    const isAlreadyFavorite = user.favorites[`${type}s`].some(
      item => item.toString() === id
    );

    if (isAlreadyFavorite) {
      return res.status(400).json({ message: `${type} already in favorites` });
    }

    // Add to favorites
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { [favoritesField]: id } },
      { new: true }
    ).select('-password');

    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Remove from favorites
exports.removeFromFavorites = async (req, res) => {
  const { type, id } = req.body;

  // Validate type
  if (!['pet', 'product'].includes(type)) {
    return res.status(400).json({ message: 'Invalid favorite type' });
  }

  try {
    // Remove from favorites
    const favoritesField = `favorites.${type}s`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { [favoritesField]: id } },
      { new: true }
    ).select('-password');

    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
