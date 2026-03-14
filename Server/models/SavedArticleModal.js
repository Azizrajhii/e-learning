const mongoose = require("mongoose");

const savedArticlesSchema = new mongoose.Schema({ 
    userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  articleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Article", 
    required: true 
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

savedArticlesSchema.index({ userId: 1, articleId: 1 }, { unique: true });


module.exports = mongoose.model("SavedArticle", savedArticlesSchema);
