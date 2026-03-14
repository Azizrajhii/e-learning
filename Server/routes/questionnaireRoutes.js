const express = require("express");
const router = express.Router();
const {
  createQuestionnaire,
  getAllQuestionnaires,
  getQuestionnaireById,
  updateQuestionnaire,
  deleteQuestionnaire,
  getQuestionnaireByName,
} = require("./../controllers/questionnaireController");

router.post("/createQuestionnaire", createQuestionnaire);
router.get("/getall", getAllQuestionnaires);
router.get("/getQuestionnaire/:name", getQuestionnaireByName);
router.get("/getQuestionnaire/id/:id", getQuestionnaireById);
router.put("/updateQuestionnaire/:id", updateQuestionnaire);
router.delete("/deleteQuestionnaire/:id", deleteQuestionnaire);

module.exports = router;
