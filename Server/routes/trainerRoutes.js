const express = require('express');
const router = express.Router();
const { getTrainerByID } = require('./../controllers/trainerController');

router.get('/', getTrainerByID);

module.exports = router;
