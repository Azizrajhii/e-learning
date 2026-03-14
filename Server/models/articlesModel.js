const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    content: { type: String },
    image: { type: String, default: null },
    video: { type: String, default: null },
    link: { type: String, default: null },
    poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", default: null },
    postedAt: { type: Date, default: Date.now },
    nbLikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
});

// Custom validation to allow only one of image, video, or poll
articleSchema.pre("save", function (next) {
    const fields = [this.image, this.video, this.poll, this.link];
    const filled = fields.filter((field) => field !== null);
    if (filled.length > 1) {
        return next(new Error("Only one of image, video, or poll can be present in an article."));
    }
    next();
});

module.exports = mongoose.model("Article", articleSchema);


