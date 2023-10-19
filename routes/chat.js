const express = require('express');
const router = express.Router();
const ChatMessage = require('../model/chatMessage');


router.post('/send', async (req, res) => {
  try {
    const { text, sender } = req.body; 
    const chatMessage = new ChatMessage({ text, sender });
    const savedMessage = await chatMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send the message' });
  }
});


router.get('/messages', async (req, res) => {
  try {
    const messages = await ChatMessage.find().populate('sender', 'username'); 
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

module.exports = router;
