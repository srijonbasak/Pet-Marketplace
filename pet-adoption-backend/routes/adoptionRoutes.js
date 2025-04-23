const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const adoptionController = require('../controllers/adoptionController');
const { auth, isAdmin } = require('../middleware/auth');

// @route   GET /api/adoptions
// @desc    Get all adoptions with filters (role-based access)
// @access  Private
router.get('/', auth, adoptionController.getAdoptions);

// @route   GET /api/adoptions/:id
// @desc    Get a single adoption by ID
// @access  Private (Owner, Provider, or Admin)
router.get('/:id', auth, adoptionController.getAdoptionById);

// @route   POST /api/adoptions
// @desc    Create a new adoption application
// @access  Private (Any authenticated user)
router.post(
  '/',
  [
    auth,
    check('petId', 'Pet ID is required').not().isEmpty(),
    check('applicationDetails.livingArrangement', 'Living arrangement is required')
      .isIn(['house', 'apartment', 'condo', 'other']),
    check('applicationDetails.hasYard', 'Yard information is required').isBoolean(),
    check('applicationDetails.hasChildren', 'Children information is required').isBoolean(),
    check('applicationDetails.hasOtherPets', 'Other pets information is required').isBoolean(),
    check('applicationDetails.workSchedule', 'Work schedule information is required').not().isEmpty(),
    check('applicationDetails.experience', 'Pet experience information is required').not().isEmpty(),
    check('applicationDetails.reasonForAdoption', 'Reason for adoption is required').not().isEmpty()
  ],
  adoptionController.createAdoption
);

// @route   PUT /api/adoptions/:id/status
// @desc    Update adoption status
// @access  Private (Provider or Admin)
router.put(
  '/:id/status',
  [
    auth,
    check('status', 'Status is required').isIn(['pending', 'approved', 'rejected', 'completed', 'cancelled'])
  ],
  adoptionController.updateAdoptionStatus
);

// @route   POST /api/adoptions/:id/messages
// @desc    Add a message to the adoption communication
// @access  Private (Owner, Provider, or Admin)
router.post(
  '/:id/messages',
  [
    auth,
    check('message', 'Message is required').not().isEmpty()
  ],
  adoptionController.addMessage
);

// @route   POST /api/adoptions/:id/follow-up
// @desc    Add a follow-up entry after adoption
// @access  Private (Provider or Admin)
router.post(
  '/:id/follow-up',
  [
    auth,
    check('notes', 'Notes are required').not().isEmpty()
  ],
  adoptionController.addFollowUp
);

module.exports = router; 