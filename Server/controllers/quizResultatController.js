// controllers/quizResultatController.js
const Questionnaire = require('../models/Questionnaire');
const QuizResultat = require('../models/QuizResultat');

exports.submitQuiz = async (req, res) => {
  try {
    const { userId, quizId, answers } = req.body;

    // 1. Récupérer le questionnaire associé
    const questionnaire = await Questionnaire.findOne({ _id: quizId });
    if (!questionnaire) return res.status(404).json({ error: 'Quiz non trouvé' });

    // 2. Calcul du score
    let score = 0;
    questionnaire.questions.forEach((q, index) => {
      if (answers[index] === q.reponse) score++;
    });

    const passed = score >= questionnaire.minimumscore;

    // 3. Enregistrer dans QuizResultat
    const result = new QuizResultat({
      userId,
      quizId,
      score,
      passed,
    });

    await result.save();

    res.status(201).json({ message: 'Résultat enregistré', score, passed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
