const mongoose = require("mongoose");

const CVSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    cvFile: {
      type: String,
      default: "",
    },
    experience: [
      {
        title: {
          type: String,
          required: true,
        },
        company: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        description: {
          type: String,
        },
      },
    ],
    education: [
      {
        degree: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        field: {
          type: String,
        },
        graduationYear: {
          type: Date,
        },
      },
    ],
    skills: [
      {
        name: {
          type: String,
          required: true,
        },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        },
        result: {
          type: Number,
          min: 0,
        },
      },
    ],
    certificates: [
      {
        name: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        link: {
          type: String,
          required: true, 
        },
        date: {
          type: Date,
          required: true,
        },
      },
    ],
    languages: [
      {
        name: {
          type: String,
          required: true,
        },
        level: {
          type: String,
          enum: ["Basic", "Conversational", "Fluent", "Native"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CV", CVSchema);
