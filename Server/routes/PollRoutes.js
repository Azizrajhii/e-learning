const express = require("express");
const router = express.Router();
const {
  checkIfUserPolled,
  getPollResults,
  addVote,
} = require("./../controllers/PollController");

// Check if user has voted on a poll
router.get("/:pollId/voted", checkIfUserPolled);

// Get poll results
router.get("/:pollId/results", getPollResults);

// Create a new poll
router.post("/:pollId/vote", addVote);

module.exports = router;
