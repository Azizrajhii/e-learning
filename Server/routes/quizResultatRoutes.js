// routes/quizResultatRoutes.js
const express = require('express');
const router = express.Router();
const quizResultatController = require('../controllers/quizResultatController');

// POST: Soumettre les réponses du quiz
router.post('/submit', quizResultatController.submitQuiz);

module.exports = router;
