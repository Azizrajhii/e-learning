const express = require('express');
const router = express.Router();
const { getHomeStats } = require('./../controllers/homeController');


router.get('/', getHomeStats);

module.exports = router;
