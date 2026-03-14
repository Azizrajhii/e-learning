const express = require('express');
const router = express.Router();
const { getSearchPaths , getManySearchPaths } = require('./../controllers/searchBarContoller');

router.get('/', getSearchPaths);
router.get('/searchMany' , getManySearchPaths);
module.exports = router;
