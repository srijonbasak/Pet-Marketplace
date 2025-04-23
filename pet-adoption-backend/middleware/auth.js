const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Middleware to check if user is a seller
const isSeller = (req, res, next) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Seller privileges required.' });
  }
  next();
};

// Middleware to check if user is an NGO
const isNGO = (req, res, next) => {
  if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. NGO privileges required.' });
  }
  next();
};

// Middleware to check if user is a provider (seller or NGO)
const isProvider = (req, res, next) => {
  if (req.user.role !== 'seller' && req.user.role !== 'ngo' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Provider privileges required.' });
  }
  next();
};

// Middleware to check if user is an employee
const isEmployee = (req, res, next) => {
  if (req.user.role !== 'employee' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Employee privileges required.' });
  }
  next();
};

module.exports = {
  auth,
  isAdmin,
  isSeller,
  isNGO,
  isProvider,
  isEmployee
}; 