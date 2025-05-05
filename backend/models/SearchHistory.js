const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  searchQuery: { 
    type: String, 
    required: true,
    trim: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  resultCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  results: { 
    type: [String], 
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'Results must be an array'
    }
  }
});

// Create compound index for faster queries
searchHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema); 