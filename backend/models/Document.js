const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  extractedText: { type: String, default: '' }, // Store extracted text from PDF or OCR
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Document', documentSchema);