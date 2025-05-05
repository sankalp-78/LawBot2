const User = require('../models/User');
const Admin = require('../models/Admin');
const SearchHistory = require('../models/SearchHistory');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin authentication
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    
    const updateData = { name, email };
    
    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Also delete user's search history
    await SearchHistory.deleteMany({ userId: id });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user search history
exports.getUserSearchHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching search history for user:', userId);

    // First verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch search history
    const history = await SearchHistory.find({ userId })
      .sort({ timestamp: -1 })
      .limit(100);

    console.log('Found search history entries:', history.length);

    // Format the history for better display
    const formattedHistory = history.map(entry => ({
      _id: entry._id,
      user: {
        name: user.name,
        email: user.email
      },
      searchQuery: entry.searchQuery,
      timestamp: entry.timestamp,
      resultCount: entry.resultCount,
      results: entry.results
    }));

    console.log('Formatted history:', formattedHistory);
    res.json(formattedHistory);
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 