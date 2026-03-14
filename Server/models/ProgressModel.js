const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  formationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Formation",
    required: true,
  },
  completedLessons: [
    {
      LessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true,
      },
      note: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
  ],
});

module.exports = mongoose.model("Progress", progressSchema);
