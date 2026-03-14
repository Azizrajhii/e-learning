const express = require('express');
const router = express.Router();
const { addNewConnection, removeConnectionById, getAllConnections, changeConnectionStatus } = require('./../controllers/ConnectionPlatformController');

router.get("/getSocials", getAllConnections);
router.delete("/deleteSocials/:id", removeConnectionById);
router.post("/postSocials", addNewConnection);
router.post('/patchSocials/:id/status', changeConnectionStatus);

module.exports = router;