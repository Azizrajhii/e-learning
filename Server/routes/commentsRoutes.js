const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentById,
  deleteComment,
  replyToComment,
  getCommentsByArticleId,
  likeComment,
  checkIfILikeComment
} = require("./../controllers/commentsController");


router.get("/:commentId/liked", checkIfILikeComment);  
router.get("/:articleId", getCommentsByArticleId);     
router.get("/:id", getCommentById);
router.post("/", createComment);
router.put("/:commentId/like", likeComment);
router.post("/replies/:id", replyToComment);
router.delete("/:id", deleteComment);


module.exports = router;
