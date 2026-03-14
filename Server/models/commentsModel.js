const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    postedAt: { type: Date, default: Date.now },
    nbLikes: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
    ],
    mentions: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
    ],
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
});

module.exports = mongoose.model("Comment", commentSchema);
