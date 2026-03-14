const express = require('express');
const router = express.Router();
const { checkIfFriend , handleFollow , handleUnfollow } = require('./../controllers/followsContoller');

router.post("/:PeopleId", handleFollow)
router.get("/:PeopleId", checkIfFriend)
router.delete("/:PeopleId", handleUnfollow)

module.exports = router;
