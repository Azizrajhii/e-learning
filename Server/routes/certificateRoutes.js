// routes/certificateRoutes.js

const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/external', 
  upload.single('certificateFile'), 
  certificateController.addCertificateFromOtherPlatform
);

router.put('/updateMyCertificate/:certificateId', 
  upload.single('certificateFile'), 
  certificateController.updateMyCertificate
);

router.get('/', certificateController.getAllMyCertificates);
router.post('/generate/:formationId', certificateController.generateCertificate);
router.get('/:certificateId', certificateController.getCertificateById);

module.exports = router;
