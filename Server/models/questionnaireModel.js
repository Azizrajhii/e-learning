const mongoose = require("mongoose");
const quesionnaireSchema = new mongoose.Schema({
  LessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true,
  },
  title:{
    type:String,
    required:true,
  },
  minscore: {
    type: Number,
    required: true,
  },question:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },

  ]
});

module.exports = mongoose.model("Questionnaire", quesionnaireSchema);
