const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const Chat = require('../models/Chat');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const router = express.Router();
const jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDFs and images (PNG, JPG, JPEG) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('files', 10);

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

router.post('/upload', auth, upload, async (req, res) => {
  let { chatId } = req.body;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded or invalid file types' });
    }

    let chat;
    if (chatId) {
      chatId = chatId.trim().replace(/^"|"$/g, '');
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ msg: 'Invalid chatId format' });
      }
      chat = await Chat.findOne({ _id: chatId, userId: req.user });
      if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    } else {
      chat = new Chat({ userId: req.user, messages: [] });
      await chat.save();
    }

    const documents = [];
    for (const file of req.files) {
      let extractedText = '';
      if (file.mimetype === 'application/pdf') {
        try {
          const pdfBuffer = fs.readFileSync(file.path);
          const pdfData = await pdfParse(pdfBuffer);
          extractedText = pdfData.text;
        } catch (error) {
          extractedText = 'Unable to extract text from PDF';
        }
      } else if (['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype)) {
        try {
          const { data: { text } } = await Tesseract.recognize(file.path, 'eng');
          extractedText = text;
        } catch (error) {
          extractedText = 'Unable to extract text from image';
        }
      }

      const document = new Document({
        userId: req.user,
        chatId: chat._id,
        fileName: file.originalname,
        filePath: file.path,
        extractedText,
      });
      await document.save();
      documents.push(document);

      chat.messages.push({
        sender: 'user',
        content: `Uploaded file: ${file.originalname}`,
      });
    }
    await chat.save();

    res.json({
      msg: `${req.files.length} file(s) uploaded successfully`,
      chatId: chat._id.toString(),
      messages: chat.messages, // Return messages instead of documents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;