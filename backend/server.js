const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env
dotenv.config();

// Verify environment variables
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Present' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json()); // Parse JSON requests

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Define Routes
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/chat', require('./routes/chatRoutes'));
  app.use('/api/files', require('./routes/fileRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
} catch (err) {
  console.error('Error setting up routes:', err);
  process.exit(1);
}

const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
}).on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});