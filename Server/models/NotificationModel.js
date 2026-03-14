const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['message', 'follow', 'like', 'comment'],
    default: 'message',
  },
  time: { type: Date, default: Date.now },
  unread: { type: Boolean, default: true },
});

module.exports = mongoose.model("Notification", notificationSchema);
