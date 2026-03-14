const Questionnaire = require("../models/questionnaireModel");
const question =require("../models/question");
// ✅ CREATE a new questionnaire
const createQuestionnaire = async (req, res) => {
  try {
    const { LessonId,title, minscore, question } = req.body;

    const newQuestionnaire = new Questionnaire({
      LessonId,
      title,
      minscore,
      question, // liste d'IDs de questions
    });

    await newQuestionnaire.save();
    res.status(201).json(newQuestionnaire);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ READ all questionnaires
const getAllQuestionnaires = async (req, res) => {
  try {
    const questionnaires = await Questionnaire.find()
      .populate("LessonId")
      .populate("question");
    res.status(200).json(questionnaires);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ READ a questionnaire by ID
const getQuestionnaireById = async (req, res) => {
  try {
    const { id } = req.params;
    const questionnaire = await Questionnaire.findById(id)
      .populate("LessonId")
      .populate("question");
    if (!questionnaire) {
      return res.status(404).json({ error: "Questionnaire not found" });
    }
    res.status(200).json(questionnaire);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getQuestionnaireByName = async (req, res) => {
  console.log("🔍 Recherche du questionnaire par nom :", req.params.name);

  try {
    const { name } = req.params;

    const questionnaire = await Questionnaire.findOne({
      title: { $regex: `^${name}$`, $options: "i" }
    })
      .populate("LessonId")
      .populate("question");

    if (!questionnaire) {
      return res.status(404).json({ error: "Questionnaire not found" });
    }

    // Mélanger aléatoirement les questions
    const shuffledQuestions = [...questionnaire.question].sort(() => 0.5 - Math.random());

    // Sélectionner jusqu'à 5 questions maximum
    const selectedQuestions = shuffledQuestions.slice(0, 5);

    res.status(200).json(selectedQuestions);
  } catch (error) {
    console.error("❌ Erreur dans getQuestionnaireByName :", error);
    res.status(500).json({ error: error.message });
  }
};



// ✅ UPDATE a questionnaire
const updateQuestionnaire = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Questionnaire.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ error: "Questionnaire not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ DELETE a questionnaire
const deleteQuestionnaire = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Questionnaire.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Questionnaire not found" });
    }
    res.status(200).json({ message: "Questionnaire deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export des fonctions
module.exports = {
  createQuestionnaire,
  getAllQuestionnaires,
  getQuestionnaireById,
  updateQuestionnaire,
  deleteQuestionnaire,
  getQuestionnaireByName
};
