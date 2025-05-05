const express = require('express');
const { OpenAI } = require('openai');
const Document = require('../models/Document');
const Chat = require('../models/Chat');
const SearchHistory = require('../models/SearchHistory');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const router = express.Router();
const jwt = require('jsonwebtoken');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

router.post('/new', auth, async (req, res) => {
  try {
    const chat = new Chat({ userId: req.user, messages: [] });
    await chat.save();
    res.json({ chatId: chat._id, msg: 'New chat created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/list', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user }).sort({ createdAt: -1 });
    const chatSummaries = chats.map(chat => ({
      chatId: chat._id,
      createdAt: chat.createdAt,
      lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content.slice(0, 50) : 'No messages yet',
    }));
    res.json(chatSummaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/message', auth, async (req, res) => {
  const { message, chatId, mode = 'legal' } = req.body;
  try {
    let chat = await Chat.findOne({ _id: chatId, userId: req.user });
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });

    console.log('User ID:', req.user);
    console.log('Message:', message);

    // Save user message to chat
    chat.messages.push({ sender: 'user', content: message });
    await chat.save();

    // Create search history entry
    const searchHistory = new SearchHistory({
      userId: req.user,
      searchQuery: message,
      timestamp: new Date(),
      resultCount: 0,
      results: []
    });
    
    console.log('Creating search history entry:', searchHistory);
    await searchHistory.save();
    console.log('Search history created successfully');

    const documents = await Document.find({ chatId: chat._id });
    let context = 'Chat history:\n';
    chat.messages.forEach((msg) => {
      context += `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.content}\n`;
    });
    context += '\nUploaded documents:\n';
    if (documents.length > 0) {
      for (const doc of documents) {
        context += `${doc.fileName}:\n${doc.extractedText || 'No text extracted'}\n\n`;
      }
    } else {
      context += 'No documents uploaded yet.\n';
    }

    const maxContextLength = 8000;
    if (context.length > maxContextLength) {
      context = context.substring(0, maxContextLength) + '\n[Content truncated]';
    }

    const systemPrompt =
      mode === 'financial'
        ? 'You are a financial advisor. Provide accurate financial advice based on the chat history and uploaded documents. Use markdown (e.g., **bold**, *italics*, - lists, ```code blocks```) for clarity.'
        : 'You are a legal assistant. Provide accurate legal advice based on the chat history and uploaded documents. Use markdown (e.g., **bold**, *italics*, - lists, ```code blocks```) for clarity.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${context}\nUser: ${message}` },
      ],
    });

    const botReply = response.choices[0].message.content;
    
    // Save bot reply to chat
    chat.messages.push({ sender: 'bot', content: botReply });
    await chat.save();

    // Update search history with the response
    searchHistory.results = [botReply];
    searchHistory.resultCount = 1;
    await searchHistory.save();
    console.log('Search history updated with response:', searchHistory);

    res.json({ chatId: chat._id, reply: botReply });
  } catch (error) {
    console.error('Error in chat message:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/history/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.user });
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.user });
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    await Document.deleteMany({ chatId: req.params.chatId });
    await Chat.deleteOne({ _id: req.params.chatId });
    res.json({ msg: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;