const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    entityType: {
        type: String,
        required: true,
        enum: ['Formation', 'Lesson', 'Q&A', 'Course'], 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 0.25,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Rating', ratingSchema);
