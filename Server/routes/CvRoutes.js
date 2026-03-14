const express = require("express");
const router = express.Router();

const {
  getCv,
  updateCv,
  deleteCv,
  getMyCv,
} = require("./../controllers/CvController");

const upload = require('./../middleware/upload'); // Notez la cohérence de nommage

// Récupérer le CV de l'utilisateur connecté
router.get("/", getMyCv);

// Récupérer le CV d'un utilisateur par son ID
router.get("/:userId", getCv);

// Mettre à jour le CV de l'utilisateur connecté (avec fichier PDF optionnel)
router.put("/", upload.single("cv"), updateCv);

// Supprimer le CV de l'utilisateur connecté
router.delete("/", deleteCv);

module.exports = router;
