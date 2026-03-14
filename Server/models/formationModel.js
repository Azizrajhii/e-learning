const mongoose = require("mongoose");

const formationSchema = new mongoose.Schema({
  InstructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "upcoming", "ongoing", "completed", "cancelled"],
    default: "draft",
  },
  totalHours: {
    type: Number,
    default: 0,
    min: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  lessons: [
    {
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    },
  ],

  maxSeats: {
    type: Number,
    required: true,
    min: 1,
  },
  enrolledSeats: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endAt: {
    type: Date,
    validate: {
      validator: function (value) {
        return value > this.createdAt;
      },
      message: "End date must be after created date",
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
});

formationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

formationSchema.methods.updateTotalHours = async function () {
  const Lesson = mongoose.model("Lesson");
  const lessons = await Lesson.find({ _id: { $in: this.lessons } });

  this.totalHours = lessons.reduce((total, lesson) => {
    return total + (lesson.duration || 0);
  }, 0);

  await this.save();
  return this.totalHours;
};

formationSchema.post("save", async function (doc) {
  if (doc.lessons && doc.lessons.length > 0) {
    await doc.updateTotalHours();
  }
});

formationSchema.methods.isUserEnrolled = function (userId) {
  return this.enrolledSeats.some(
    (enrolledUserId) => enrolledUserId.toString() === userId.toString()
  );
};

module.exports = mongoose.model("Formation", formationSchema);
