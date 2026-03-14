const express = require('express');
const router = express.Router();
const uploadfiles = require('./../middleware/uploadfiles');

const {
  getProfile,
  getProfileById,
  getProfileByUserId,
  updateProfile,
  saisirProfile,
  checkIsMyProfile,
  getAllConnections,
  addNewConnection,
  removeConnectionById,
  changeConnectionStatus,
  getAllProfiles,
  deleteProfile,
  updateProfileadmin,
}  = require('./../controllers/profileContoller');


// Routes pour les profils
router.get('/getAllprofiles', getAllProfiles);
router.get('/', getProfile);
router.get('/user/:id', getProfileByUserId);
router.get('/checkIsMyProfile/:profileId', checkIsMyProfile);

// Routes pour les réseaux sociaux (avant /:id pour éviter le conflit)
router.get('/socials', getAllConnections);
router.post('/socials', addNewConnection);
router.delete('/socials/:id', removeConnectionById);
router.patch('/socials/status/:id', changeConnectionStatus);

router.get('/:id', getProfileById);
router.put('/admin/:userId', updateProfileadmin);
router.put('/:userId', uploadfiles.profileUpload, updateProfile);
router.post('/', saisirProfile);
router.delete('/:id', deleteProfile);

module.exports = router;
