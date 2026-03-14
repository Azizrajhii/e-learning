const express = require('express');
const router = express.Router();
const { ChatBox } = require('./../controllers/chatBoxController');

// Route POST /api/chat
router.post('/', ChatBox);

module.exports = router;
