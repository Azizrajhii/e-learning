const Comment = require("./../models/commentsModel");
const Article = require("./../models/articlesModel");
const { getUserId } = require("./../utils/tokenAuth.js");
const Profile = require("./../models/profileModel"); // Assurez-vous que le chemin est correct
const Notification = require("./../models/NotificationModel");
// Créer un commentaire
exports.createComment = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { content, mentions, articleId } = req.body;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: "Article non trouvé" });
    }

    const newComment = new Comment({
      userId,
      content,
      mentions,
      postedAt: new Date(),
    });

    const savedComment = await newComment.save();

    // Optionnel : Ajouter le commentaire à un article si articleId fourni
    if (articleId) {
      await Article.findByIdAndUpdate(
        articleId,
        { $push: { comments: savedComment._id } },
        { new: true }
      );
    }

    const user = await Profile.findOne({ userId });

    const peopleIdStr = article.userId.toString();
    const userIdStr = userId.toString();

    const message = `${user.name} a laissé un commentaire sur votre article.`;

    const notification = new Notification({
      recipient: peopleIdStr,
      sender: userIdStr,
      message,
    });

    await notification.save();

    res.status(201).json(savedComment);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la création du commentaire." });
  }
};
// Obtenir un commentaire par ID
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate([
      {
        path: "userId",
        select: "profile",
        populate: {
          path: "profile",
          select: "name lastName profilePicture sex",
        },
      },
      {
        path: "replies",
        populate: {
          path: "userId",
          select: "profile",
          populate: {
            path: "profile",
            select: "name lastName profilePicture sex",
          },
        },
      },
    ]);

    if (!comment) {
      return res.status(404).json({ error: "Commentaire non trouvé." });
    }

    res.json(comment);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération du commentaire." });
  }
};

// Supprimer un commentaire avec vérification de l'auteur
exports.deleteComment = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Commentaire non trouvé." });
    }

    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "Vous n'avez pas le droit de supprimer ce commentaire.",
      });
    }

    await comment.deleteOne();

    res.json({ message: "Commentaire supprimé avec succès." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression du commentaire." });
  }
};

// Répondre à un commentaire
exports.replyToComment = async (req, res) => {
  try {
    const parentId = req.params.id;
    const userId = await getUserId(req);
    const { content, mentions } = req.body;

    // Créer une nouvelle réponse
    const reply = new Comment({
      userId,
      content,
      mentions,
      postedAt: new Date(),
    });

    const savedReply = await reply.save();

    // Ajouter l'ID de la réponse au commentaire parent
    await Comment.findByIdAndUpdate(
      parentId,
      { $push: { replies: savedReply._id } },
      { new: true }
    );

    // Récupérer la réponse peuplée (userId + profile)
    const populatedReply = await Comment.findById(savedReply._id).populate({
      path: "userId",
      select: "profile",
      populate: {
        path: "profile",
        select: "name lastName profilePicture sex",
      },
    });

    res.status(201).json(populatedReply);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la création de la réponse." });
  }
};

exports.getCommentsByArticleId = async (req, res) => {
  try {
    const { articleId } = req.params;

    const article = await Article.findById(articleId).populate({
      path: "comments",
      populate: [
        {
          path: "userId",
          select: "profile",
          populate: {
            path: "profile",
            select: "name lastName profilePicture sex",
          },
        },
        {
          path: "replies",
          populate: {
            path: "userId",
            select: "profile",
            populate: {
              path: "profile",
              select: "name lastName profilePicture sex",
            },
          },
        },
      ],
    });

    if (!article) {
      return res.status(404).json({ error: "Article non trouvé." });
    }

    res.status(200).json(article.comments);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des commentaires." });
  }
};

exports.likeComment = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const { commentId } = req.params;
        const { like } = req.body; // true to like, false to unlike

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Check if user already liked the comment
        const likeIndex = comment.nbLikes.findIndex(
            likeObj => likeObj.userId.toString() === userId.toString()
        );

        if (like) {
            // Like the comment if not already liked
            if (likeIndex === -1) {
                comment.nbLikes.push({ userId });
                await comment.save();
                return res.status(200).json({
                    message: "Comment liked successfully",
                    nbLikes: comment.nbLikes.length
                });
            }
            return res.status(200).json({
                message: "Comment already liked by user",
                nbLikes: comment.nbLikes.length
            });
        } else {
            // Unlike the comment if already liked
            if (likeIndex !== -1) {
                comment.nbLikes.splice(likeIndex, 1);
                await comment.save();
                return res.status(200).json({
                    message: "Comment unliked successfully",
                    nbLikes: comment.nbLikes.length
                });
            }
            return res.status(200).json({
                message: "Comment not liked by user",
                nbLikes: comment.nbLikes.length
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating like status" });
    }
};

// Vérifier si l'utilisateur a liké un commentaire
exports.checkIfILikeComment = async (req, res) => {
  try {
    console.log("woooooooooooooooooooooor")
    const userId = await getUserId(req);
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Commentaire non trouvé." });
    }

    const liked = comment.nbLikes.some(
      likeObj => likeObj.userId.toString() === userId.toString()
    );

    res.status(200).json({ liked });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la vérification du like." });
  }
};
