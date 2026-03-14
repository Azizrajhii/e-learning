const express = require("express");
const router = express.Router();
const {
  getTopContributors,
  getTrendingQuestions,
  createArticle,
  getAllArticles,
  getArticleById
} = require("./../controllers/articlesController");
const upload = require('./../middleware/upload');

router.post("/", upload.single('file'), createArticle);
router.get("/", getAllArticles);

// ✅ Place les routes spécifiques AVANT la route dynamique
router.get('/top-contributors', getTopContributors);
router.get('/trending-questions', getTrendingQuestions);

router.get("/:id", getArticleById); // DOIT ÊTRE LA DERNIÈRE
module.exports = router;
