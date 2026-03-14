const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Profile = require('../models/profileModel');
const { getUserId } = require('../utils/tokenAuth');
const uploadToCloudinary = require('../utils/cloudinaryUploader');

// GET: /api/profiles/me
const getProfile = asyncHandler(async (req, res) => {
  const userId = await getUserId(req);
  const profile = await Profile.findOne({ userId }).populate('userId', 'email');
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.status(200).json(profile);
});

// GET: /api/profiles/:id
const getProfileById = asyncHandler(async (req, res) => {
  const profile = await Profile.findById(req.params.id).populate('userId', 'email');
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.status(200).json(profile);
});

// GET: /api/profiles/user/:id
const getProfileByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID non valide' });
  }
  const profile = await Profile.findOne({ userId: id }).populate("userId");
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.status(200).json(profile);
});

// PUT: /api/profiles/:userId
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    let updates = req.body;
    console.log("Données reçues avant traitement:", updates);

    // 1. Correction du champ userId
    if (updates.userId && typeof updates.userId === 'string' && updates.userId === '[object Object]') {
      delete updates.userId;
    }

    // 2. Nettoyage des données
    updates = Object.fromEntries(
      Object.entries(updates).filter(([key, value]) => {
        const shouldKeep = value !== '' || ['bio', 'address'].includes(key);
        return shouldKeep && value !== null && value !== undefined;
      })
    );

    // 3. Gestion spéciale des champs problématiques
    const arrayFields = ['uploads', 'followers', 'following', 'socials'];
    arrayFields.forEach(field => {
      if (updates[field] === '') {
        updates[field] = [];
      }
    });

    // 4. Traitement des fichiers
    if (req.files?.profilePicture) {
      const profilePic = req.files.profilePicture[0];
      updates.profilePicture = await uploadToCloudinary(
        profilePic.path,
        'profile_pictures',
        `user_${userId}_profile`
      );
    }

    if (req.files?.profileCover) {
      const coverPic = req.files.profileCover[0];
      // Utiliser 'ProfileCover' (avec P majuscule) pour correspondre au schéma
      updates.ProfileCover = await uploadToCloudinary(
        coverPic.path,
        'profile_covers',
        `user_${userId}_cover`
      );
      // Supprimer l'éventuelle version minuscule
      delete updates.profileCover;
    }

    // Correction supplémentaire: si profileCover existe dans les updates mais pas dans les fichiers
    if (updates.profileCover) {
      updates.ProfileCover = updates.profileCover;
      delete updates.profileCover;
    }

    console.log("Données après traitement:", updates);

    // 5. Mise à jour dans MongoDB
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { 
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    ).populate('userId', 'email');

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Erreur détaillée:', error);
    
    const errorResponse = {
      message: 'Erreur lors de la mise à jour du profil',
      details: {
        name: error.name,
        path: error.path,
        kind: error.kind
      }
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }

    res.status(500).json(errorResponse);
  }
};




// POST: /api/profiles
const saisirProfile = asyncHandler(async (req, res) => {
  const { id, name, lastName, sex, speciality, bio, profilePicture } = req.body;
  if (!id || !name || !lastName || !sex || !speciality) {
    return res.status(400).json({ message: "Les champs obligatoires sont manquants." });
  }

  let profile = await Profile.findOne({ userId: id });
  if (profile) {
    Object.assign(profile, { name, lastName, sex, speciality, bio, profilePicture });
    profile = await profile.save();
    return res.status(200).json(profile);
  } else {
    profile = await Profile.create({ userId: id, name, lastName, sex, speciality, bio, profilePicture });
    return res.status(201).json(profile);
  }
});

// GET: /api/profiles/check/:profileId
const checkIsMyProfile = asyncHandler(async (req, res) => {
  const connectedUserId = await getUserId(req);
  const { profileId } = req.params;
  const targetProfile = await Profile.findById(profileId);
  if (!targetProfile) return res.status(404).json({ error: "Profil non trouvé." });

  const isMine = targetProfile.userId.toString() === connectedUserId;
  return res.status(200).json({ isMine });
});

// --- Socials Logic ---

// GET: /api/profiles/socials
const getAllConnections = asyncHandler(async (req, res) => {
  const userId = await getUserId(req);
  const profile = await Profile.findOne({ userId });
  if (!profile) return res.status(404).json({ message: "Profile not found" });
  res.status(200).json({ socials: profile.socials });
});

// POST: /api/profiles/socials
const addNewConnection = asyncHandler(async (req, res) => {
  const userId = await getUserId(req);
  const { platform, username, url, icon, connected } = req.body;

  const profile = await Profile.findOne({ userId });
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  profile.socials.push({ platform, userName: username, url, icon, connected });
  await profile.save();

  res.status(201).json({ message: "Social connection added", socials: profile.socials });
});

// DELETE: /api/profiles/socials/:id
const removeConnectionById = asyncHandler(async (req, res) => {
  const userId = await getUserId(req);
  const profile = await Profile.findOne({ userId });
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  const originalLength = profile.socials.length;
  profile.socials = profile.socials.filter((s) => s._id.toString() !== req.params.id);
  if (profile.socials.length === originalLength) {
    return res.status(404).json({ message: "Connection not found" });
  }

  await profile.save();
  res.status(200).json({ message: "Social connection removed", socials: profile.socials });
});

// PATCH: /api/profiles/socials/status/:id
const changeConnectionStatus = asyncHandler(async (req, res) => {
  const userId = await getUserId(req);
  const profile = await Profile.findOne({ userId });
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  const connection = profile.socials.id(req.params.id);
  if (!connection) return res.status(404).json({ message: "Connection not found" });

  connection.connected = !connection.connected;
  await profile.save();

  res.status(200).json({ message: "Connection status updated", updated: connection });
});
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('userId', 'email');

    // Si tu veux formatter le résultat :
    const formattedProfiles = profiles.map(profile => ({
      _id: profile._id,
      name: profile.name,
      lastName: profile.lastName,
      sex: profile.sex,
      specialty: profile.specialty,
      followersCount: profile.followers.length,
      followingCount: profile.following.length,
      uploadsCount: profile.uploads.length,
      bio: profile.bio,
      profilePicture: profile.profilePicture,
      profileCover: profile.profileCover,
      address: profile.address,
      country: profile.country,
      government: profile.government,
      socials: profile.socials,
      email: profile.userId?.email || null
    }));

    res.status(200).json(formattedProfiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }
    res.status(200).json({ message: 'Profil supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
const updateProfileadmin = async (req, res) => {
  const { name, lastName, email, sex } = req.body;
  const { userId } = req.params;

  try {
    const updated = await Profile.findByIdAndUpdate(
      userId,
      { name, lastName, email, sex },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Profil non trouvé' });
    }

    res.status(200).json({ message: 'Profil mis à jour avec succès', profile: updated });
  } catch (error) {
    console.error("Erreur updateProfile:", error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
module.exports = {
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
  updateProfileadmin
};
