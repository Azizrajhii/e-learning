const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Même chemin que dans incrementVisitCount
const filePath = path.join(__dirname, "../statistiques/visit-count.json");

router.get("/", (req, res) => {
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, "utf8");
      const counts = JSON.parse(data);
      res.json(counts);  // On renvoie tout l'objet JSON avec les dates et valeurs
    } catch (err) {
      console.error("Erreur lecture JSON visit-count:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  } else {
    res.json({}); // fichier absent => on renvoie un objet vide
  }
});

module.exports = router;
