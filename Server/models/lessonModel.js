const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  formationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Formation",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
  },
  content: {
    type: {
      type: String,
      enum: ["video", "pdf"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  order: {
    type: Number,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rating: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      value: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  publicDate: {
    type: Date,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Lesson", lessonSchema);
