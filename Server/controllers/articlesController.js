const Article = require("./../models/articlesModel.js");
const { getUserId } = require('./../utils/tokenAuth.js');
const User = require('./../models/userModel');
const Poll = require("./../models/PollModel");
const uploadToCloudinary = require('./../utils/cloudinaryUploader.js');
const path = require('path');

const createArticle = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    const { title, content, poll, link } = req.body;

    // Créer un sondage s’il existe
    let pollId = null;
    if (poll) {
      const newPoll = new Poll(JSON.parse(poll)); // attention : si poll est envoyé en JSON string
      const savedPoll = await newPoll.save();
      pollId = savedPoll._id;
    }

    // Gérer les médias : image ou vidéo via req.file
    let imageUrl = null;
    let videoUrl = null;

    if (req.file) {
      const mimeType = req.file.mimetype;
      const isVideo = mimeType.startsWith('video');
      const folder = isVideo ? 'ArticlesVideos' : 'ArticlesImages';
      const resourceType = isVideo ? 'video' : 'image';

      const cloudUrl = await uploadToCloudinary(req.file.path, folder, '', resourceType);

      if (isVideo) {
        videoUrl = cloudUrl;
      } else {
        imageUrl = cloudUrl;
      }
    }

    const isValid = val => val !== null && val !== undefined && !(typeof val === 'string' && val.trim() === "");
    const mediaFields = [imageUrl, videoUrl, pollId, link].filter(isValid);

    if (mediaFields.length > 1) {  // Only block if >1 media is provided
      return res.status(400).json({ error: "Un seul média (image, vidéo, lien ou sondage) est autorisé." });
    }
    // No check for mediaFields.length === 0 → media is optional ✅

    const newArticle = new Article({
      userId,
      title,
      content,
      image: imageUrl,
      video: videoUrl,
      link: link || null,
      poll: pollId || null,
      nbLikes: [],
    });

    await newArticle.save();

    res.status(201).json({ message: "Article créé avec succès.", article: newArticle });
  } catch (error) {
    console.error("Erreur lors de la création de l'article :", error.message);
    res.status(500).json({ error: "Erreur lors de la création de l'article." });
  }
};

const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find()
      .sort({ postedAt: -1 }) // articles les plus récents d'abord
      .populate({
        path: "userId",
        select: "profile",
        populate: {
          path: "profile",
          select: "name lastName profilePicture sex"
        }
      })
      .populate("poll"); // Si tu veux voir les détails du sondage

    res.status(200).json({ articles });
  } catch (error) {
    console.error("Erreur lors de la récupération des articles :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des articles." });
  }
};

const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate({
        path: "userId",
        select: "profile",
        populate: {
          path: "profile",
          select: "name lastName profilePicture sex"
        }
      })
      /*.populate({
          path: "comments",
          populate: {
              path: "userId",
              select: "name lastName pdp"
          }
      })*/
      .populate("poll");

    if (!article) {
      return res.status(404).json({ error: "Article non trouvé." });
    }

    res.status(200).json({ article });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article :", error.message);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

const getTopContributors = async (req, res) => {
  try {
    const result = await Article.aggregate([
      {
        $group: {
          _id: "$userId",
          articleCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "profiles",
          localField: "user._id",
          foreignField: "userId",
          as: "profile"
        }
      },
      { $unwind: "$profile" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$profile.name",
          lastName: "$profile.lastName",
          profilePicture: "$profile.profilePicture",  // ajouté ici
          articleCount: 1
        }
      },
      {
        $sort: { articleCount: -1 }
      }
    ]);

    res.status(200).json(result);
  } catch (err) {
    console.error("Erreur top contributors:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getTrendingQuestions = async (req, res) => {
  try {
    const articles = await Article.find({
      poll: { $ne: null }, // Questions with polls
      nbLikes: { $exists: true }
    })
    .sort({ 'nbLikes.length': -1 }) // Sort by number of likes (descending)
    .limit(10); // Limit to 10 results

    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,getTopContributors,
  getTrendingQuestions,
};
