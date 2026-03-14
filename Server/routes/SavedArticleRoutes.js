const express = require('express');
const router = express.Router();
const { saveArticle, unsaveArticle, checkIfSaved, getAllArticlesSaved } = require('./../controllers/SavedArticleController');

router.get('/', getAllArticlesSaved); 
router.get('/:articleId', checkIfSaved); 
router.post('/:articleId', saveArticle); 
router.delete('/:articleId', unsaveArticle); 

module.exports = router;
