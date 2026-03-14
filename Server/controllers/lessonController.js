const Lesson = require("./../models/lessonModel");
const mongoose = require("mongoose");
const Formation = require("./../models/formationModel");
const Users = require("./../models/userModel");
const Profile = require("./../models/profileModel");
const { getUserId } = require("./../utils/tokenAuth.js");
const { convertDropboxUrl } = require("./../utils/convertDropboxUrl.js");
const uploadPdfToDropbox = require("./../utils/dropboxUploader.js");
const fs = require("fs");
const { execFile } = require("child_process");
const util = require("util");

const execFilePromise = util.promisify(execFile);

async function getTrainerProfileByFormationID(req, res) {
  try {
    const { formationId } = req.params;
    console.log("Formation ID extrait :", formationId);
    const formation = await Formation.findById(formationId);

    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }

    const trainerID = formation.trainerId;

    if (!trainerID) {
      return res.status(400).json({ error: "trainerID est requis" });
    }

    const userId = trainerID;
    const profile = await Profile.findOne({ userId }).populate(
      "userId",
      "email"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const response = {
      name: profile.name,
      lastName: profile.lastName,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération du formateur :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

async function getAllLessons(req, res) {
  try {
    const formationId = req.params.formationId;

    console.log("Formation ID:", formationId);

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(formationId)) {
      return res.status(400).json({ message: "Invalid formationId" });
    }

    // Vérifier si la formation existe dans la base de données
    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }

    // Chercher les leçons associées
    const lessons = await Lesson.find({
      formationId: new mongoose.Types.ObjectId(formationId),
    });
    console.log("Leçons trouvées:", lessons);

    // Retourner les leçons
    res.json(lessons);
  } catch (err) {
    console.error("Erreur dans la récupération des leçons:", err);
    res.status(500).json({ message: err.message });
  }
}

async function getLessonById(req, res) {
  try {
    const lessonId = req.params.LessonId;

    // Vérification si l'ID de la leçon est valide
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid LessonId" });
    }

    // Recherche de la leçon avec cet ID
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Retourne la leçon
    res.json(lesson);
  } catch (err) {
    console.error("Erreur lors de la récupération de la leçon:", err);
    res.status(500).json({ message: err.message });
  }
}

const createLesson = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  const formationId = req.body.formationId;
  console.log("Formation ID extrait :", formationId);

  try {
    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }
    console.log("Formation :", formation);

    // Vérification des champs requis
    const requiredFields = [
      "formationId",
      "title",
      "description",
      "duration",
      "order",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ message: `Le champ "${field}" est requis.` });
      }
    }

    let fileUrl = "";

    // Gestion de l'upload vers Dropbox
    if (req.file) {
      try {
        const sanitize = (str) => str.replace(/[^a-zA-Z0-9_-]/g, "_");

        const filename = `${sanitize(formation.title)}_${formation._id
          .toString()
          .substring(0, 4)}/${sanitize(req.body.title)}.pdf`;

        const dropboxResult = await uploadPdfToDropbox(
          req.file.path,
          "/lessons",
          filename
        );

        fileUrl = dropboxResult.url || "";

        // Suppression du fichier local
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error("Erreur suppression fichier temporaire :", err);
          }
        });
      } catch (uploadErr) {
        console.error("Dropbox upload error:", uploadErr);
        return res.status(500).json({
          message: "Échec de l'envoi du fichier vers Dropbox.",
          error: uploadErr.message,
        });
      }
    }

    fileUrl = convertDropboxUrl(fileUrl);

    // Création de la leçon
    const lesson = new Lesson({
      formationId: req.body.formationId,
      title: req.body.title,
      description: req.body.description,
      duration: req.body.duration,
      content: {
        type: "pdf",
        url: fileUrl,
      },
      order: req.body.order,
      publicDate: req.body.publicDate,
      isPublished: false,
    });

    const newLesson = await lesson.save();

    await Formation.findByIdAndUpdate(
      formationId,
      { $push: { lessons: { lessonId: newLesson._id } } },
      { new: true }
    );

    res.status(201).json(newLesson);
  } catch (err) {
    console.error("Create lesson error:", err);
    res.status(400).json({
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

const addRating = async (req, res) => {
  try {
    const lessonId = req.params.LessonId;
    const { rating } = req.body; // the rating value submitted by the user
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the lesson by its ID
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Check if the user has already rated this lesson.
    const existingRating = lesson.rating.find(
      (r) => r.userId.toString() === userId.toString()
    );
    if (existingRating) {
      return res
        .status(400)
        .json({ message: "You have already rated this lesson." });
    }

    // Add the new rating to the lesson
    lesson.rating.push({ userId, value: rating });

    // Compute the updated average rating
    const ratingsArray = lesson.rating.map((r) => r.value);
    const averageRating =
      ratingsArray.reduce((sum, val) => sum + val, 0) / ratingsArray.length;

    // Optionally, log or update a separate field for the average rating if needed.
    // For now, we simply return the computed average.

    await lesson.save();

    res.status(200).json({
      message: "Rating added successfully",
    });
  } catch (err) {
    console.error("Error adding rating:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { LessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(LessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    const lesson = await Lesson.findById(LessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    await Formation.findByIdAndUpdate(
      lesson.formationId,
      {
        $pull: { lessons: { lessonId: lesson._id } },
      },
      { new: true }
    );

    await Lesson.findByIdAndDelete(LessonId);

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la leçon:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { LessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(LessonId)) {
      return res.status(400).json({ message: "Invalid LessonId" });
    }

    const lesson = await Lesson.findById(LessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const formation = await Formation.findById(lesson.formationId);
    if (!formation) {
      return res
        .status(404)
        .json({ message: "Associated formation not found" });
    }

    let fileUrl = lesson.content.url;
    let newfileUrl = null;

    // Gestion du nouveau fichier PDF
    if (req.file) {
      try {
        const sanitize = (str) => str.replace(/[^a-zA-Z0-9_-]/g, "_");

        const filename = `${sanitize(formation.title)}_${formation._id
          .toString()
          .substring(0, 4)}/${sanitize(
          req.body.title || lesson.title
        )}_Updated.pdf`;

        const dropboxResult = await uploadPdfToDropbox(
          req.file.path,
          "/lessons",
          filename
        );

        newfileUrl = dropboxResult.url || "";
        newfileUrl = convertDropboxUrl(newfileUrl); // convertit la bonne URL

        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error("Erreur suppression fichier temporaire :", err);
          }
        });
      } catch (uploadErr) {
        console.error("Erreur lors du téléversement Dropbox :", uploadErr);
        return res.status(500).json({
          message: "Échec de l'envoi du fichier mis à jour vers Dropbox.",
          error: uploadErr.message,
        });
      }
    }

    // Mise à jour des champs de la leçon
    lesson.title = req.body.title || lesson.title;
    lesson.description = req.body.description || lesson.description;
    lesson.duration = req.body.duration || lesson.duration;
    lesson.order = req.body.order || lesson.order;
    lesson.publicDate = req.body.publicDate || lesson.publicDate;
    if (newfileUrl) {
      lesson.content = {
        type: "pdf",
        url: newfileUrl,
      };
    } else {
      lesson.content = {
        type: "pdf",
        url: fileUrl,
      };
    }

    const updatedLesson = await lesson.save();

    res.status(200).json(updatedLesson);
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la leçon:", err);
    res.status(500).json({ message: err.message });
  }
};

const getUserRating = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Leçon introuvable" });
    }

    const rating = lesson.rating.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (rating) {
      return res.status(200).json({
        rating: rating.value,
      });
    } else {
      return res.status(200).json({ rating: 0});
    }
  } catch (err) {
    console.error("Erreur lors de la récupération de l'évaluation :", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
const addComment = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { comment } = req.body;
    const lessonId = req.params.LessonId; 
    console.log(userId);
      console.log(comment);
            console.log(lessonId);


    if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
      return res.status(400).json({ 
        message: "Valid comment required" 
      });
    }

    // Use the correct model name (Users, not User)
    const user = await Users.findById(userId).select('name lastName profilePicture');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const newComment = {
      userId,
      content: comment.trim(),
      createdAt: new Date(),
      user: {
        name: user.name,
        lastName: user.lastName,
        profilePicture: user.profilePicture
      }
    };

    lesson.comments.push(newComment);
    await lesson.save();

    res.status(201).json({ 
      message: "Comment added successfully",
      comment: newComment
    });

  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
const getAllCommentsByLessonId = async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lessonId" });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Pour chaque commentaire, on récupère le profil associé (name, profilePicture)
    const commentsWithUserInfo = await Promise.all(
      lesson.comments.map(async (comment) => {
        const profile = await Profile.findOne({ userId: comment.userId }).select('name profilePicture');
        return {
          _id: comment._id,
          content: comment.content,
          createdAt: comment.createdAt,
          user: profile ? {
            name: profile.name,
            profilePicture: profile.profilePicture
          } : null,
        };
      })
    );
    res.status(200).json(commentsWithUserInfo);

  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
module.exports = {
  getAllLessons,
  createLesson,
  getLessonById,
  addRating,
  getTrainerProfileByFormationID,
  deleteLesson,
  updateLesson,
  getUserRating,
    addComment,
  getAllCommentsByLessonId,
  
};
