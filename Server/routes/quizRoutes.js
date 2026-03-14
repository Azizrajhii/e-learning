const express = require('express');
const router = express.Router();
const { genererQuiz } = require('../controllers/genererQuiz');

// ✅ Utilisation de POST avec données dans req.body
router.post('/generer-quiz/:id', genererQuiz);

module.exports = router;
