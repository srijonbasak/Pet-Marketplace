const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const rescueController = require('../controllers/rescueController');
const { auth, isNGO, isAdmin } = require('../middleware/auth');

// @route   GET /api/rescues
// @desc    Get all rescue operations with filters
// @access  Public
router.get('/', rescueController.getRescues);

// @route   GET /api/rescues/:id
// @desc    Get a single rescue operation by ID
// @access  Public
router.get('/:id', rescueController.getRescueById);

// @route   POST /api/rescues
// @desc    Create a new rescue operation
// @access  Private (NGO or Admin)
router.post(
  '/',
  [
    auth,
    isNGO,
    check('title', 'Title is required').not().isEmpty(),
    check('location.city', 'City is required').not().isEmpty(),
    check('location.state', 'State is required').not().isEmpty(),
    check('location.country', 'Country is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('rescueDate.planned', 'Planned rescue date is required').not().isEmpty(),
    check('animals', 'At least one animal type must be included').isArray().notEmpty(),
    check('animals.*.species', 'Species is required for each animal').not().isEmpty(),
    check('animals.*.count', 'Count is required for each animal').isNumeric()
  ],
  rescueController.createRescue
);

// @route   PUT /api/rescues/:id
// @desc    Update a rescue operation
// @access  Private (Owner NGO or Admin)
router.put(
  '/:id',
  [
    auth,
    check('title', 'Title is required if provided').optional().not().isEmpty(),
    check('description', 'Description is required if provided').optional().not().isEmpty()
  ],
  rescueController.updateRescue
);

// @route   PUT /api/rescues/:id/status
// @desc    Update rescue status
// @access  Private (Owner NGO or Admin)
router.put(
  '/:id/status',
  [
    auth,
    check('status', 'Status is required').isIn(['planning', 'in_progress', 'completed', 'cancelled'])
  ],
  rescueController.updateRescueStatus
);

// @route   POST /api/rescues/:id/team
// @desc    Add team members to a rescue operation
// @access  Private (Owner NGO or Admin)
router.post(
  '/:id/team',
  [
    auth,
    check('members', 'Members array is required').isArray().notEmpty(),
    check('members.*.member', 'Member ID is required for each team member').not().isEmpty(),
    check('members.*.role', 'Role is required for each team member').not().isEmpty()
  ],
  rescueController.addTeamMembers
);

// @route   POST /api/rescues/:id/updates
// @desc    Add an update to a rescue operation
// @access  Private (Team member, Owner NGO, or Admin)
router.post(
  '/:id/updates',
  [
    auth,
    check('content', 'Update content is required').not().isEmpty()
  ],
  rescueController.addUpdate
);

// @route   POST /api/rescues/:id/donate
// @desc    Add a donation to a rescue operation
// @access  Private (for authenticated donation) or Public (for anonymous)
router.post(
  '/:id/donate',
  [
    check('amount', 'Amount is required and must be a number').isNumeric(),
    check('anonymous', 'Anonymous flag is required').isBoolean(),
    check('anonymousDonor.name', 'Name is required for anonymous donor')
      .if(check('anonymous').equals('true'))
      .not()
      .isEmpty()
  ],
  rescueController.addDonation
);

// @route   PUT /api/rescues/:id/outcomes
// @desc    Update rescue outcomes
// @access  Private (Owner NGO or Admin)
router.put(
  '/:id/outcomes',
  [
    auth,
    check('outcomes', 'Outcomes object is required').not().isEmpty()
  ],
  rescueController.updateOutcomes
);

module.exports = router; 