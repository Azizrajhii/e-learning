const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Charge les variables d'environnement

// Configuration Cloudinary à partir de .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file (image or video) to Cloudinary in a specific folder
 *
 * @param {string} filePath - Local path to the file
 * @param {string} folder - Target folder in Cloudinary (e.g., 'profile-pictures', 'covers')
 * @param {string} publicName - Desired name for the file (without extension)
 * @param {string} [resourceType='image'] - Either 'image' or 'video'
 * @returns {Promise<string>} - URL of the uploaded file
 */
const uploadToCloudinary = async (filePath, folder = 'misc', publicName = '', resourceType = 'image') => {
  try {
    // Crée un identifiant public du style : folder/filename
    const fileName = publicName || path.parse(filePath).name + '_' + Date.now();
    const publicId = `${folder}/${fileName}`;

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType,
      public_id: publicId,
      overwrite: true,
    });

    // Supprimer le fichier local temporaire
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw err;
  }
};

module.exports = uploadToCloudinary;
