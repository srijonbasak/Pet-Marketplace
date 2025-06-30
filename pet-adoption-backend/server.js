const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Hardcoded JWT secret (alternative to .env)
// process.env.JWT_SECRET = 'petshopSecretToken';

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://srijon:cse471Project@cse470.mpfhi.mongodb.net/pet-marketplace?retryWrites=true&w=majority';
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/adoptions', require('./routes/adoptionRoutes'));
app.use('/api/rescues', require('./routes/rescueRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/shops', require('./routes/shopRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Removed serving React build: frontend is now deployed separately as a static site

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 