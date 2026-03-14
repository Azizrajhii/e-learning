const Poll = require("./../models/PollModel");
const { getUserId } = require("../utils/tokenAuth");

// Check if user has already voted
const checkIfUserPolled = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    let selectedAnswerId = null;

    const hasVoted = poll.answers.some((answer) => {
      const voted = answer.nbChosen.some((entry) => {
        const match = entry.userId.toString() === userId;
        if (match) selectedAnswerId = answer._id; // capture selected answer ID
        return match;
      });
      return voted;
    });

    res.status(200).json({
      voted: hasVoted,
      selected: hasVoted ? selectedAnswerId : null,
    });
  } catch (err) {
    console.error("Error checking poll vote:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Get poll results
const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId).lean();
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    // Format nbChosen as counts
    const formattedAnswers = poll.answers.map((answer) => ({
      _id: answer._id,
      label: answer.label,
      nbChosen: answer.nbChosen.length,
    }));

    res.status(200).json({
      question: poll.question,
      answers: formattedAnswers,
    });
  } catch (err) {
    console.error("Error getting poll results:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addVote = async (req, res) => {
    try {
      const userId = await getUserId(req);
      const { pollId } = req.params;
      const { answerId } = req.body;
  
      const poll = await Poll.findById(pollId);
      if (!poll) return res.status(404).json({ error: "Poll not found" });
  
      // Check if user has already voted
      const alreadyVoted = poll.answers.some((answer) =>
        answer.nbChosen.some((entry) => entry.userId.toString() === userId)
      );
  
      if (alreadyVoted) {
        return res.status(400).json({ error: "User has already voted" });
      }
  
      // Add vote to the selected answer
      const answer = poll.answers.find((a) => a._id === answerId);
      if (!answer) {
        return res.status(400).json({ error: "Invalid answer ID" });
      }
  
      answer.nbChosen.push({ userId });
  
      await poll.save();
  
      res.status(200).json({ message: "Vote submitted" });
    } catch (err) {
      console.error("Error submitting vote:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

module.exports = {
  checkIfUserPolled,
  getPollResults,
  addVote,
};
