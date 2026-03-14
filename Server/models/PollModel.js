const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answers: [
        {
            _id: String,
            label: String,
            nbChosen: [
                { userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, }
            ],
        },
    ],
});

module.exports = mongoose.model("Poll", pollSchema);
