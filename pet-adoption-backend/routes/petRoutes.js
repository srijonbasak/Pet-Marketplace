const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const petController = require('../controllers/petController');
const { auth, isProvider } = require('../middleware/auth');

// @route   GET /api/pets
// @desc    Get all pets with filters
// @access  Public
router.get('/', petController.getPets);

// @route   GET /api/pets/:id
// @desc    Get a pet by ID
// @access  Public
router.get('/:id', petController.getPetById);

// @route   POST /api/pets
// @desc    Create a new pet listing
// @access  Private (Providers only)
router.post(
  '/',
  [
    auth,
    isProvider,
    check('name', 'Name is required').not().isEmpty(),
    check('species', 'Species is required').isIn(['dog', 'cat', 'bird', 'fish', 'small_animal', 'reptile', 'other']),
    check('breed', 'Breed is required').not().isEmpty(),
    check('age', 'Age must be a number').isNumeric(),
    check('ageUnit', 'Age unit is required').isIn(['days', 'months', 'years']),
    check('gender', 'Gender is required').isIn(['male', 'female', 'unknown']),
    check('size', 'Size is required').isIn(['small', 'medium', 'large', 'extra_large']),
    check('color', 'Color is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('adoptionFee', 'Adoption fee must be a number').isNumeric()
  ],
  petController.createPet
);

// @route   PUT /api/pets/:id
// @desc    Update a pet
// @access  Private (Owner or Admin)
router.put(
  '/:id',
  [
    auth,
    check('name', 'Name is required if provided').optional(),
    check('species', 'Species must be valid if provided').optional()
      .isIn(['dog', 'cat', 'bird', 'fish', 'small_animal', 'reptile', 'other']),
    check('breed', 'Breed is required if provided').optional(),
    check('age', 'Age must be a number if provided').optional().isNumeric(),
    check('ageUnit', 'Age unit must be valid if provided').optional()
      .isIn(['days', 'months', 'years']),
    check('gender', 'Gender must be valid if provided').optional()
      .isIn(['male', 'female', 'unknown']),
    check('size', 'Size must be valid if provided').optional()
      .isIn(['small', 'medium', 'large', 'extra_large']),
    check('status', 'Status must be valid if provided').optional()
      .isIn(['available', 'pending', 'adopted']),
    check('adoptionFee', 'Adoption fee must be a number if provided').optional().isNumeric()
  ],
  petController.updatePet
);

// @route   DELETE /api/pets/:id
// @desc    Delete a pet
// @access  Private (Owner or Admin)
router.delete('/:id', auth, petController.deletePet);

// @route   POST /api/pets/:id/images
// @desc    Upload images for a pet
// @access  Private (Owner or Admin)
router.post('/:id/images', auth, petController.uploadPetImages);

// @route   DELETE /api/pets/:id/images
// @desc    Remove an image from a pet
// @access  Private (Owner or Admin)
router.delete(
  '/:id/images',
  [
    auth,
    check('imageUrl', 'Image URL is required').not().isEmpty()
  ],
  petController.removePetImage
);

module.exports = router; 