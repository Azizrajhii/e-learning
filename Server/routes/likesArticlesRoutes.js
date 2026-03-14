const express = require('express');
const router = express.Router();
const { checkIfLiked, likeArticle , unlikeArticle } = require('./../controllers/likesArticlesControllers');

router.get('/:articleId', checkIfLiked);
router.post('/:articleId', likeArticle);
router.delete('/:articleId', unlikeArticle);

module.exports = router;