const express = require("express");
const router = express.Router();
const { getUserProgress, markLessonComplete , getUserAvgNote } = require("./../controllers/ProgressController");

router.get("/:formationId", getUserProgress);
router.get("/fetchUserProgress/:formationId", getUserAvgNote);
router.post('/mark-complete', markLessonComplete);

module.exports = router;

