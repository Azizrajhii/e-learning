const express = require('express');
const router = express.Router();
const {getAllFormationsMembres,updateFormationAdmin,getAllFormationsAll,updateFormationStatus,getStatusCounts,getFormationCountByDate,getAllFormationsadmin, getAllFormations , getFormationByID , createFormation , getMyFormations , updateFormation , checkUserEnrollment , joinToFormation } = require('./../controllers/formationController');
const upload = require('./../middleware/upload');

// GET all formations
router.post('/JoinToFormation/:formationId', joinToFormation);
router.get('/checkIfUserJoinedFormation/:formationId', checkUserEnrollment);
router.get('/GetAllFormations', getAllFormations);
router.get('/all', getAllFormationsadmin);
router.get('/alladmin', getAllFormationsAll);
router.get("/formation-count-by-date", getFormationCountByDate);
router.get("/status-counts", getStatusCounts);
router.post('/:id/status', updateFormationStatus);
router.post('/update', updateFormationAdmin); // Nouvelle route pour l'admin

router.get("/fetchMembres/:formationId", getAllFormationsMembres);
router.get('/MyFormations', getMyFormations);
router.get('/:idFormation', getFormationByID);
router.post('/create', upload.single('file'), createFormation);
router.put('/:idFormation', upload.single('file'), updateFormation);

/*

// CREATE a new formation

// UPDATE a formation
router.put('/:id', updateFormation);

// DELETE a formation
router.delete('/formations/:id', formationController.deleteFormation);
*/
module.exports = router;
