const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Shop = require('../models/Shop');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/shops')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Create a new shop
router.post('/', auth, async (req, res) => {
  try {
    const shop = new Shop({
      ...req.body,
      owner: req.user.id
    });
    await shop.save();
    res.status(201).json(shop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get seller's shop
router.get('/my-shop', auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update shop
router.put('/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, owner: req.user.id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    Object.assign(shop, req.body);
    await shop.save();
    res.json(shop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload shop logo
router.post('/:id/logo', auth, upload.single('logo'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, owner: req.user.id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    shop.logo = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
    await shop.save();
    res.json({ message: 'Logo uploaded successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload shop banner
router.post('/:id/banner', auth, upload.single('banner'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, owner: req.user.id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    shop.banner = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
    await shop.save();
    res.json({ message: 'Banner uploaded successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get shop by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('owner', 'firstName lastName email');
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 