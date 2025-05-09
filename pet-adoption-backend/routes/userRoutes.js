const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { auth, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    // Accept images only - use a more permissive check
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    
    console.log('File accepted:', file.originalname, file.mimetype);
    cb(null, true);
  }
});

// Add custom auth middleware for form data uploads
const formAuth = (req, res, next) => {
  console.log('formAuth middleware processing request');
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Body token present:', req.body && req.body.token ? 'yes' : 'no');
  
  // Check for token in request body (for form uploads), headers, or query
  let token = req.body?.token || 
              req.header('x-auth-token') || 
              req.header('Authorization') ||
              req.query?.token;

  // Check if token is in Bearer format
  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.split(' ')[1];
    console.log('Extracted token from Bearer format');
  }

  console.log('Token found:', token ? 'yes' : 'no');

  // Check if no token
  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    console.log('Verifying token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user to request object
    req.user = decoded.user;
    console.log('User ID from token:', req.user.id);
    console.log('User role from token:', req.user.role);
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Improved file upload middleware
const uploadMiddleware = (req, res, next) => {
  console.log('Upload middleware processing request');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Request body keys:', req.body ? Object.keys(req.body) : 'none');
  
  const uploadSingle = upload.single('profileImage');
  
  uploadSingle(req, res, function(err) {
    if (err) {
      console.error('Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else {
        // Custom error (e.g., file type)
        return res.status(400).json({ message: err.message });
      }
    }
    
    // After file processing
    console.log('Multer processed the request');
    console.log('File in request:', req.file ? 'yes' : 'no');
    
    // If no file was uploaded, just log a warning but proceed
    if (!req.file) {
      console.warn('No file uploaded in the request');
    } else {
      console.log('File details:', {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    }
    
    next();
  });
};

// @route   POST /api/users/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role is required').isIn(['buyer', 'seller', 'ngo', 'admin', 'employee'])
  ],
  userController.registerUser
);

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  userController.loginUser
);

// @route   POST /api/users/forgot-password
// @desc    Send password reset email with code
// @access  Public
router.post(
  '/forgot-password',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  userController.forgotPassword
);

// @route   POST /api/users/reset-password
// @desc    Reset password with code
// @access  Public
router.post(
  '/reset-password',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('resetCode', 'Reset code is required').not().isEmpty(),
    check('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  userController.resetPassword
);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, userController.getCurrentUser);

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put(
  '/me',
  [
    auth,
    check('username', 'Username is required if provided').optional(),
    check('email', 'Please include a valid email if provided').optional().isEmail()
  ],
  userController.updateUserProfile
);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put(
  '/change-password',
  [
    auth,
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  userController.changePassword
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', userController.getUserById);

// @route   POST /api/users/favorites
// @desc    Add to favorites
// @access  Private
router.post(
  '/favorites',
  [
    auth,
    check('type', 'Type must be either pet or product').isIn(['pet', 'product']),
    check('id', 'Item ID is required').not().isEmpty()
  ],
  userController.addToFavorites
);

// @route   DELETE /api/users/favorites
// @desc    Remove from favorites
// @access  Private
router.delete(
  '/favorites',
  [
    auth,
    check('type', 'Type must be either pet or product').isIn(['pet', 'product']),
    check('id', 'Item ID is required').not().isEmpty()
  ],
  userController.removeFromFavorites
);

// @route   POST /api/users/profile-image
// @desc    Upload profile image
// @access  Private
router.post(
  '/profile-image',
  [formAuth, uploadMiddleware],
  userController.uploadProfileImage
);

// @route   GET /api/users/cart
// @desc    Get current user's cart
// @access  Private
router.get('/cart', auth, (req, res, next) => {
  console.log('GET /api/users/cart route hit');
  next();
}, userController.getCart);

// @route   POST /api/users/cart
// @desc    Update current user's cart
// @access  Private
router.post('/cart', auth, (req, res, next) => {
  console.log('POST /api/users/cart route hit');
  next();
}, userController.setCart);

module.exports = router; 