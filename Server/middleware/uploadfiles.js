const multer = require('multer');
const path = require('path');
const os = require('os');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images (JPEG, PNG, WEBP, GIF) sont autorisées'), false);
  }
};

// Configuration principale de Multer
const uploadfiles = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 2 // Maximum 2 fichiers
  }
});

// Middleware pour l'upload de profil
const profileUploadMiddleware = uploadfiles.fields([
  { 
    name: 'profilePicture', 
    maxCount: 1 
  },
  { 
    name: 'profileCover', 
    maxCount: 1 
  }
]);

// Exportation (compatible avec l'import existant)
const uploadMiddleware = uploadfiles;
uploadMiddleware.profileUpload = profileUploadMiddleware;

module.exports = uploadMiddleware;