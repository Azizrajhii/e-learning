const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true,
  },
  pwd: {
    type: String,
    required: true,
  },
  num: {
    type: Number,
    unique: true,
    sparse: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  descriptor: {
    type: [Number],
    select: false,
    required: false
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
});

userSchema.post('save', async function (doc, next) {
  try {
    const Profile = mongoose.model('Profile');

    // Vérifier si un profil existe déjà pour cet utilisateur
    const existingProfile = await Profile.findOne({ userId: doc._id });
    if (existingProfile) {
      console.log('Profile already exists for this user');
      return next();
    }

    // Créer un nouveau profil associé à l'utilisateur
    const profile = new Profile({
      userId: doc._id,
      name: '',
      lastName: '',
      sex: '',
      PdP: '',
      specialty: '',
      followers: [],       // ← corrigé ici
      following: [],       // ← corrigé ici
      uploads: [],         // ← corrigé ici
      bio: '',
      profilePicture: '',
      descriptor: {
        type: [Number],
        select: false,
        required: false
      },
    });

    await profile.save();

    // Mettre à jour l'utilisateur avec la référence du profil
    doc.profile = profile._id;
    await doc.save();

    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour générer un token JWT
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email
    },
    process.env.JWT_SECRET,
    
  );
};

module.exports = mongoose.model('User', userSchema);
