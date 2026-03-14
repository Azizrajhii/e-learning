const fs = require('fs'); // AJOUTER CECI EN HAUT DU FICHIER
const CV = require("./../models/CvModel");
const { getUserId } = require("./../utils/tokenAuth");
const mongoose = require("mongoose");
const { convertDropboxUrl } = require("./../utils/convertDropboxUrl.js");
const uploadPdfToDropbox = require("./../utils/dropboxUploader.js");

const getMyCv = async (req, res) => {
  try {
    const userId = await getUserId(req);

    // Validate userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const cv = await CV.findOne({ userId });

    if (!cv) {
      // Create a new CV if none exists
      const newCV = new CV({ userId });
      await newCV.save();
      return res.status(201).json(newCV); // 201 for resource creation
    }

    res.status(200).json(cv);
  } catch (error) {
    console.error("Error getting CV:", error);

    // Handle specific Mongoose errors
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid data format" });
    }

    res.status(500).json({
      message: "Error getting CV data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getCv = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const cv = await CV.findOne({ userId });

    if (!cv) {
      // Create a new CV if none exists
      const newCV = new CV({ userId });
      await newCV.save();
      return res.status(201).json(newCV); // 201 for resource creation
    }

    res.status(200).json(cv);
  } catch (error) {
    console.error("Error getting CV:", error);

    // Handle specific Mongoose errors
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid data format" });
    }

    res.status(500).json({
      message: "Error getting CV data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateCv = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { experience, education, skills, languages } = req.body;
    const cvFile = req.file;

    const updateData = {};

    // Parse JSON uniquement si les champs sont présents
    try {
      if (experience) {
        const experienceData = JSON.parse(experience);
        updateData.experience = experienceData;
      }

      if (education) {
        const educationData = JSON.parse(education);
        updateData.education = educationData;
      }

      if (skills) {
        const skillsData = JSON.parse(skills);
        updateData.skills = Array.isArray(skillsData)
          ? skillsData.map((skill) =>
              typeof skill === "string" ? { name: skill } : skill
            )
          : [];
      }

      if (languages) {
        const languagesData = JSON.parse(languages);
        updateData.languages = Array.isArray(languagesData)
          ? languagesData.map((lang) =>
              typeof lang === "string" ? { name: lang, level: "Fluent" } : lang
            )
          : [];
      }
    } catch (parseError) {
      if (cvFile) fs.unlinkSync(cvFile.path);
      return res.status(400).json({ message: "Données JSON invalides" });
    }

    console.log("📄 Fichier reçu :", cvFile);

    // Upload vers Dropbox si fichier présent
    if (cvFile) {
      try {
        const sanitize = (str) => str.replace(/[^a-zA-Z0-9_-]/g, "_");
        const filename = `cv_${sanitize(userId)}_${Date.now()}.pdf`;

        const dropboxResult = await uploadPdfToDropbox(
          cvFile.path,
          "/cv",
          filename
        );

        let fileUrl = dropboxResult.url || "";
        fileUrl = convertDropboxUrl(fileUrl); // ?dl=0 => ?raw=1
        updateData.cvFile = fileUrl;

        fs.unlink(cvFile.path, (err) => {
          if (err) console.error("❌ Erreur suppression fichier temporaire:", err);
        });
      } catch (uploadErr) {
        console.error("❌ Erreur upload Dropbox:", uploadErr);
        if (cvFile && fs.existsSync(cvFile.path)) fs.unlinkSync(cvFile.path);
        return res.status(500).json({
          message: "Échec de l'upload vers Dropbox",
          error: uploadErr.message,
        });
      }
    }

    const cv = await CV.findOneAndUpdate({ userId }, updateData, {
      new: true,
      upsert: true,
    });

    res.status(200).json(cv);
  } catch (error) {
    console.error("❗ Erreur lors de la mise à jour du CV:", error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      message: "Erreur lors de la mise à jour du CV",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


const deleteCv = async (req, res) => {
  try {
    const userId = await getUserId(req);

    await CV.findOneAndDelete({ userId });

    res.status(200).json({ message: "CV deleted successfully" });
  } catch (error) {
    console.error("Error deleting CV:", error);
    res.status(500).json({ message: "Error deleting CV" });
  }
};

module.exports = {
  getCv,
  updateCv,
  deleteCv,
  getMyCv
};
