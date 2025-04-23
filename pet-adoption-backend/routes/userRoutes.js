const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { auth, isAdmin } = require('../middleware/auth');

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

module.exports = router; 