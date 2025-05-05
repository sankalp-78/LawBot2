const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Admin authentication
router.post('/login', adminController.login);
router.get('/verify', auth, (req, res) => {
  res.json({ msg: 'Token is valid' });
});

// Protected routes
router.use(auth);
router.post('/users', adminController.createUser);
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/users/:userId/search-history', adminController.getUserSearchHistory);

module.exports = router; 