const mongoose = require("mongoose");

const ClassroomSchema = new mongoose.Schema(
  {
    dailyRoomId: { type: String, required: true, unique: true },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    formationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Formation",
      required: true,
    },
    roomUrl: { type: String, required: true },
    students: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
        leaveddAt: { type: Date },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Classroom", ClassroomSchema);
