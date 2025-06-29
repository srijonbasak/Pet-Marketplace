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

  const { username, firstName, lastName, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    user = new User({
      username,
      firstName,
      lastName,
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

    // Prepare user object for response (exclude password)
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage ? true : false,
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: userResponse });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Forgot password - send reset code
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    // We don't want to reveal if email exists for security reasons
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account with this email exists, a password reset code has been sent.' 
      });
    }

    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set reset code and expiration (1 hour from now)
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();

    // In a real application, you would send an email with the code here
    // For development, we'll just log it to the console
    console.log(`Reset code for ${email}: ${resetCode}`);

    // Return success message
    res.status(200).json({ 
      message: 'If an account with this email exists, a password reset code has been sent.' 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Reset password with code
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, resetCode, newPassword } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ 
      email, 
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: Date.now() } // Make sure code hasn't expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Set new password and clear reset fields
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    console.log('Getting user profile for user ID:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log profile image details if it exists
    if (user.profileImage && user.profileImage.data) {
      console.log('User has profile image:', {
        contentType: user.profileImage.contentType,
        dataSize: user.profileImage.data.length || 'unknown'
      });
      
      // Convert buffer to base64 for immediate use in frontend
      try {
        const imageBase64 = user.profileImage.data.toString('base64');
        
        // Create a user response with enhanced profile image
        const userResponse = user.toObject();
        
        // Replace the profile image data with the base64 preview
        userResponse.profileImage = {
          ...userResponse.profileImage,
          preview: `data:${user.profileImage.contentType};base64,${imageBase64}`
        };
        
        console.log('Returning user profile with image preview successfully');
        return res.json(userResponse);
      } catch (err) {
        console.error('Error converting profile image to base64:', err);
      }
    } else {
      console.log('User has no profile image');
    }
    
    console.log('Returning user profile successfully');
    res.json(user);
  } catch (err) {
    console.error('Error in getCurrentUser:', err);
    res.status(500).json({ message: 'Server error retrieving user profile' });
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
    firstName,
    lastName,
    email,
    phone,
    address,
    bio,
    petPreferences,
    ngoDetails
  } = req.body;

  try {
    // Build update object
    const userFields = {};
    if (username) userFields.username = username;
    if (firstName) userFields.firstName = firstName;
    if (lastName) userFields.lastName = lastName;
    if (email) userFields.email = email;
    if (phone) userFields.phone = phone;
    if (address) userFields.address = address;
    if (bio) userFields.bio = bio;
    if (petPreferences) userFields.petPreferences = petPreferences;
    
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

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    console.log('Received profile image upload request');
    console.log('Request headers:', req.headers);
    console.log('Files in request:', req.files ? 'yes' : 'no');
    console.log('Single file in request:', req.file ? 'yes' : 'no');
    
    // Check if file exists
    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    
    console.log('File details:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'present' : 'missing'
    });
    
    // If no buffer is present, we can't process the image
    if (!req.file.buffer) {
      return res.status(400).json({ message: 'No image data found in uploaded file' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found, updating profile image');
    
    // Store image directly in MongoDB
    user.profileImage = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
    
    // Save the user with the new image
    await user.save();
    console.log('Profile image saved successfully');
    
    // Convert the image to base64 for immediate display in frontend
    // This avoids the need for a separate image fetch
    const imageBase64 = req.file.buffer.toString('base64');
    
    // Return the updated user (excluding password) with the image preview
    const updatedUser = await User.findById(req.user.id).select('-password');
    
    // Create a simplified response that's easier for the frontend to use
    res.json({ 
      message: 'Profile image uploaded successfully',
      user: {
        ...updatedUser.toObject(),
        profileImage: {
          ...updatedUser.profileImage,
          // Add the base64 encoded image for immediate display
          preview: `data:${req.file.mimetype};base64,${imageBase64}`
        }
      }
    });
  } catch (err) {
    console.error('Error uploading profile image:', err);
    res.status(500).json({ message: 'Server error uploading image' });
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

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('cart.items.product', 'name price images stock');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate total
    const total = user.cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // Update total in user's cart
    user.cart.total = total;
    await user.save();

    res.json(user.cart);
  } catch (err) {
    console.error('Error in getCart:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user's cart
exports.setCart = async (req, res) => {
  try {
    const { cart } = req.body;
    console.log('setCart called for user:', req.user.id, 'with cart:', JSON.stringify(cart));

    // Validate cart structure
    if (!cart || !Array.isArray(cart.items)) {
      return res.status(400).json({ message: 'Invalid cart format' });
    }

    // Validate each item
    for (const item of cart.items) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: 'Invalid cart item format' });
      }
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update cart
    user.cart = cart;

    // Calculate total
    const populatedUser = await user.populate('cart.items.product', 'price');
    const total = populatedUser.cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // Update total
    user.cart.total = total;
    await user.save();

    res.json(user.cart);
  } catch (err) {
    console.error('Error in setCart:', err);
    res.status(500).json({ message: 'Server error' });
  }
};