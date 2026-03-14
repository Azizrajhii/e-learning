const Progress = require("./../models/ProgressModel.js");
const { getUserId } = require('./../utils/tokenAuth.js');

async function getUserProgress(req, res) {
  const userId = await getUserId(req);
  const { formationId } = req.params;

  try {
    const progress = await Progress.findOne({ userId, formationId });
    res.status(200).json(progress ? progress.completedLessons : []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress." });
  }
}

async function getUserAvgNote(req, res) {
  const userId = await getUserId(req);
  const { formationId } = req.params;

  try {
    const progress = await Progress.findOne({ userId, formationId });
    
    if (!progress || !progress.completedLessons || progress.completedLessons.length === 0) {
      return res.status(200).json({ average: 0 }); // or whatever default value you prefer
    }

    const completedLessons = progress.completedLessons;
    const sum = completedLessons.reduce((total, lesson) => total + lesson.note, 0);
    const average = sum / completedLessons.length;
    
    res.status(200).json({ average });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress." });
  }
}


async function markLessonComplete(req, res) {
  const { note, formationId, lessonId } = req.body;
  
  if (!formationId || !lessonId) {
    return res.status(400).json({ 
      error: "formationId and lessonId are required" 
    });
  }

  try {
    // 1. Récupérer le userId depuis l'authentification
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // 2. Vérifier si la leçon existe déjà
    const existingProgress = await Progress.findOne({
      userId,
      formationId,
      "completedLessons.LessonId": lessonId
    });

    if (existingProgress) {
      return res.status(200).json({ 
        message: "Lesson already completed", 
        progress: existingProgress 
      });
    }

    // 3. Mettre à jour en ajoutant la nouvelle leçon
    const updatedProgress = await Progress.findOneAndUpdate(
      { userId, formationId },
      {
        $addToSet: {
          completedLessons: {
            LessonId: lessonId,
            note: note ?? 0,
            completedAt: new Date() // Optionnel : ajouter un timestamp
          }
        }
      },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedProgress);

  } catch (err) {
    console.error("Error marking lesson complete:", err);
    res.status(500).json({ 
      error: "Failed to update progress",
      details: err.message 
    });
  }
}
module.exports = { getUserProgress, markLessonComplete , getUserAvgNote};
