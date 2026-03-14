// models/Follower.js
const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  followedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Follower", followerSchema);
