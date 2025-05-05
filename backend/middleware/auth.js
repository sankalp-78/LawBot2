const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Try to get token from Authorization header first
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If not found, try x-auth-token header
    if (!token) {
      token = req.header('x-auth-token');
    }
    
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the user has admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin role required.' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth; 