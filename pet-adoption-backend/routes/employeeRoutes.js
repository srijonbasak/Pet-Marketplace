const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth, isSeller } = require('../middleware/auth');
const Employee = require('../models/Employee');
const Shop = require('../models/Shop');

// Register new employee (shop owner only)
router.post('/register', auth, isSeller, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, shopId } = req.body;

    // Check if shop exists and user is the owner
    const shop = await Shop.findOne({ _id: shopId, owner: req.user.id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found or unauthorized' });
    }

    // Check if employee already exists
    let employee = await Employee.findOne({ email });
    if (employee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    // Create new employee
    employee = new Employee({
      firstName,
      lastName,
      email,
      password,
      phone,
      shop: shopId
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(password, salt);

    await employee.save();

    res.status(201).json({ message: 'Employee registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Employee login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if employee exists
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if employee is active
    if (!employee.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: employee._id,
        role: 'employee',
        shop: employee.shop
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all employees for a shop (shop owner only)
router.get('/shop/:shopId', auth, isSeller, async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.shopId, owner: req.user.id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found or unauthorized' });
    }

    const employees = await Employee.find({ shop: req.params.shopId })
      .select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update employee status (shop owner only)
router.put('/:employeeId/status', auth, isSeller, async (req, res) => {
  try {
    const { isActive } = req.body;
    const employee = await Employee.findById(req.params.employeeId);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Verify shop ownership
    const shop = await Shop.findOne({ _id: employee.shop, owner: req.user.id });
    if (!shop) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    employee.isActive = isActive;
    await employee.save();

    res.json({ message: 'Employee status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update employee permissions (shop owner only)
router.put('/:employeeId/permissions', auth, isSeller, async (req, res) => {
  try {
    const { permissions } = req.body;
    const employee = await Employee.findById(req.params.employeeId);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Verify shop ownership
    const shop = await Shop.findOne({ _id: employee.shop, owner: req.user.id });
    if (!shop) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    employee.permissions = permissions;
    await employee.save();

    res.json({ message: 'Employee permissions updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee profile
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Not an employee account' });
    }
    
    const employee = await Employee.findById(req.user.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Get shop data
    const shop = await Shop.findById(employee.shop).select('name');
    
    res.json({
      ...employee.toObject(),
      shopName: shop ? shop.name : 'Unknown Shop'
    });
  } catch (error) {
    console.error('Error getting employee profile:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 