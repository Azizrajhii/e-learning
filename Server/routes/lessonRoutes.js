const express = require('express');
const router = express.Router();
const {getAllCommentsByLessonId,addComment, getAllLessons , createLesson , getLessonById , addRating , getTrainerProfileByFormationID, deleteLesson, updateLesson, getUserRating} = require('./../controllers/lessonController');
const multer = require('multer');
const upload = require('./../middleware/upload');


router.get('/:formationId', getAllLessons);
router.get('/Files/:LessonId', getLessonById);
router.get('/trainerProfile/:formationId', getTrainerProfileByFormationID);
router.post('/Rating/:LessonId', addRating);
router.delete('/:LessonId', deleteLesson);
router.put("/:LessonId", upload.single("file"), updateLesson);
router.get('/userRating/:lessonId', getUserRating);
router.post("/comment/:LessonId", addComment);
router.get('/comments/:lessonId', getAllCommentsByLessonId);



// Create a new lesson
router.post('/', upload.single('file'), createLesson);

module.exports = router;
