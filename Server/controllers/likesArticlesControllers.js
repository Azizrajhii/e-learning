const Article = require('./../models/articlesModel');
const User = require('./../models/userModel');
const { getUserId } = require('./../utils/tokenAuth.js');
const Notification = require("./../models/NotificationModel");
const Profile = require("./../models/profileModel"); // Assurez-vous que le chemin est correct

const likeArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = await getUserId(req);

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: "Article non trouvé" });
    }

    if (article.nbLikes.includes(userId)) {
      return res.status(400).json({ error: "Déjà liké" });
    }

    article.nbLikes.push(userId);
    await article.save();

    const user = await Profile.findOne({ userId });

    const peopleIdStr = article.userId.toString();
    const userIdStr = userId.toString();

    const message = `${user.name} a aimé votre article.`;

    const notification = new Notification({
      recipient: peopleIdStr,
      sender: userIdStr,
      message,
    });

    await notification.save();

    res.status(200).json({ message: "Article liké avec succès" });
  } catch (error) {
    console.error("Erreur lors du like :", error);
    res.status(500).json({ error: "Erreur lors du like" });
  }
};

const checkIfLiked = async (req, res) => {
    try {
        const { articleId } = req.params;
        const userId = await getUserId(req);
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }
        
        const article = await Article.findById(articleId);
        
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        const liked = article.nbLikes.includes(userId);
        res.status(200).json({ liked });
    } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).json({ error: 'Error checking like status' });
    }
};

const unlikeArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const userId = await getUserId(req);

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ error: 'Article non trouvé' });
        }

        const index = article.nbLikes.indexOf(userId);
        if (index === -1) {
            return res.status(400).json({ error: 'Vous n\'avez pas liké cet article' });
        }

        // apartir de la position index supprime 1 element du tableau => article.nbLikes.splice(index, 1)

        article.nbLikes.splice(index, 1);
        await article.save();

        res.status(200).json({ message: 'Article disliké avec succès' });
    } catch (error) {
        console.error('Erreur lors du unlike :', error);
        res.status(500).json({ error: 'Erreur lors du unlike' });
    }
};

module.exports = { checkIfLiked, likeArticle , unlikeArticle };
