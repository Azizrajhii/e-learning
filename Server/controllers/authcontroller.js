const crypto = require("crypto");
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
require("dotenv").config();
const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const express = require("express");
const router = express.Router();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Ajoutez cette ligne juste avant d'utiliser Twilio
const { incrementVisitCount } = require("../statistiques/visitCounter");

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Email transporter (Mailtrap for testing)

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Corrected here
  auth: {
      user: 'sopra.hr.staff@gmail.com', 
      pass: 'efyk lvgb zmgk wmfz' 
  }
});


// Forgot pwd
module.exports.forgotpwd = asyncHandler(async (req, res) => {
    const { email, num } = req.body;
    let user;
  
    if (email) {
      user = await User.findOne({ email });
    } else if (num) {
      user = await User.findOne({ num });
    }
  
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  
    // Génération d'un code de réinitialisation à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000);
    user.resetCode = resetCode;
    await user.save();
  
    // Envoi par e-mail si un email est fourni
    if (email) {
      await transporter.sendMail({
        from: 'Your App <no-reply@yourapp.com>',
        to: email,
        subject: "Réinitialisation du mot de passe",
        html: `<p>Votre code de réinitialisation est : <strong>${resetCode}</strong></p>`,
      });
    }
  
    // Envoi par SMS si un numéro est fourni
    if (num) {
      const formattedNum = num.startsWith("+216") ? num : `+216${num}`;
      try {
        await client.messages.create({
          body: `Votre code de réinitialisation est : ${resetCode}`,
          to: formattedNum,
          from: process.env.TWILIO_PHONE,
        });
      } catch (error) {
        console.error("Erreur d'envoi de SMS :", error);
        return res.status(500).json({ message: "Erreur lors de l'envoi du SMS" });
      }
    }
  
    res.status(200).json({ resetCode: resetCode, message: "Code de réinitialisation envoyé" });
  });

// Reset pwd
module.exports.resetpwd = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.pwd = encrypt(newPassword);
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});


const algorithm = 'aes-256-cbc';

function encrypt(text) {
  const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const IV = Buffer.from(process.env.ENCRYPTION_IV, 'hex');
  const cipher = crypto.createCipheriv(algorithm, KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}
function decrypt(encryptedText) {
  const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const IV = Buffer.from(process.env.ENCRYPTION_IV, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, KEY, IV);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


module.exports.registerUserCtr = asyncHandler(async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log(req.body);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Veuillez entrer un email valide" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe est obligatoire et doit avoir au moins 6 caractères" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const encryptedPassword = encrypt(password);

    const newUser = new User({
      email,
      pwd: encryptedPassword,
    });

    await newUser.save();

    // Mettre à jour le champ 'name' dans le profil créé automatiquement
    if (name && name.trim() !== "") {
      await Profile.findOneAndUpdate(
        { userId: newUser._id },
        { name: name.trim() },
        { new: true }
      );
    }

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      _id: newUser._id,
      email,
    });
  } catch (err) {
    console.error("Erreur lors de l'inscription :", err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});


// Login User
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, num, password } = req.body;
  let user;

  if (email) {
    user = await User.findOne({ email });
  } else if (num) {
    user = await User.findOne({ num });
  }

  if (!user) {
    return res.status(400).json({ message: "Identifiants incorrects" });
  }

  // Déchiffrer le mot de passe stocké
  const decryptedPassword = decrypt(user.pwd);

  // Comparaison
  if (decryptedPassword !== password) {
    return res.status(400).json({ message: "Identifiants incorrects" });
  }

  // Déterminer le rôle
  const isAdmin = user.email && user.email.endsWith("@soprastaff.com");
  const role = isAdmin ? "admin" : "salarie";
  incrementVisitCount();
  res.status(200).json({
    _id: user.id,
    email: user.email,
    num: user.num,
    token: user.generateAuthToken(),
    role,
  });
});

// Check Email existence
module.exports.checkEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!(await User.findOne({ email }))) return res.status(404).json({ message: "Email non trouvé" });
    res.status(200).json({ message: "Email trouvé" });
});

// Check Num existence
module.exports.checkNum = asyncHandler(async (req, res) => {
    const { num } = req.body;
    if (!(await User.findOne({ num }))) return res.status(404).json({ message: "Numéro non trouvé" });
    res.status(200).json({ message: "Numéro trouvé" });
});

// Microsoft Login
module.exports.microsoftLogin = asyncHandler(async (req, res) => {
  try {
    const { email, displayName } = req.body;
    console.log("Microsoft Login Request Body:", req.body);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        pwd: "microsoft-auth",
      });

      await user.save();
    }

    // Récupérer le profil lié
    if (user.profile) {
      const nameParts = displayName ? displayName.trim().split(" ") : [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await Profile.findByIdAndUpdate(
        user.profile,
        {
          name: firstName,
          lastName: lastName,
        },
        { new: true }
      );
    }

    const token = user.generateAuthToken();
    incrementVisitCount();
    res.status(200).json({
      message: "Login Microsoft successful",
      token,
      userId: user._id,
    });

  } catch (error) {
    console.error("Microsoft Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports.updateDescriptor = asyncHandler(async (req, res) => {
  try {
    const { email, descriptor } = req.body;

    console.log('📥 Requête reçue :', { email, descriptorLength: descriptor ? descriptor.length : 'N/A' });

    // Validation des données
    if (!email || !descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      console.log('❌ Données invalides');
      return res.status(400).json({
        success: false,
        error: 'Nom et descripteur valide requis (128 valeurs)',
      });
    }

    console.log('🔍 Recherche de l\'utilisateur par email :', email);

    const user = await User.findOne({ email: email });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }

    // Mise à jour du descripteur dans l'utilisateur
    user.descriptor = descriptor;
    await user.save();

    console.log('✅ Descripteur mis à jour pour l\'utilisateur :', user._id);

    res.json({
      success: true,
      updated: new Date(),
    });

  } catch (err) {
    console.error('💥 Erreur dans /update-descriptor :', err);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});
module.exports.gettokenName = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Nom invalide ou manquant',
      });
    }

    // Chercher le profil avec le nom donné
    const profile = await Profile.findOne({ name });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profil non trouvé',
      });
    }

    // Ensuite, chercher l'utilisateur lié à ce profil
    const user = await User.findById(profile.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }

    const authToken = user.generateAuthToken();
    res.status(200).json({
      _id: user._id,
      email: user.email,
      token: authToken,
    });

  } catch (err) {
    console.error('💥 Erreur dans gettokenName :', err);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

module.exports.getAll = asyncHandler(async (req, res) => {
  try {
    const users = await User.find()
      .select('descriptor email profile') // <-- on sélectionne descriptor ici !
      .sort({ createdAt: -1 })
      .populate({
        path: 'profile',
        select: 'name'
      });

    const formattedUsers = users.map(user => {
      const descriptor = user.descriptor || [];

      return {
        email: user.email,
        descriptor: descriptor
      };
    });

    res.json({
      success: true,
      count: formattedUsers.length,
      data: formattedUsers
    });
  } catch (err) {
    console.error('Error in getAll:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

////partie confirmation mail
const codeStorage = new Map(); // Temporaire : email -> code
module.exports.sendCodeConf = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requis" });
  }

  // Générer un code aléatoire à 6 chiffres
  const code = crypto.randomInt(100000, 999999).toString();
  codeStorage.set(email, code);

  try {
    await transporter.sendMail({
      from: '"MyApp" <no-reply@myapp.com>',
      to: email,
      subject: "Votre code de confirmation",
      text: `Votre code est : ${code}`,
      html: `<p>Votre code de confirmation est : <b>${code}</b></p>`,
    });

    console.log(`Code ${code} envoyé à ${email}`);
    res.json({ message: "Code envoyé avec succès" });
  } catch (err) {
    console.error("Erreur d'envoi d'email:", err);
    res.status(500).json({ message: "Erreur d'envoi de l'email" });
  }
};

module.exports.verifierCode = async (req, res) => {
  const { email, code } = req.body;
  const storedCode = codeStorage.get(email);

  if (!storedCode || storedCode !== code) {
    return res.status(400).json({ message: "Code invalide ou expiré" });
  }

  // Code correct → supprimer le code
  codeStorage.delete(email);
  res.json({ message: "Code vérifié avec succès" });
};
module.exports.updateDescriptorById = asyncHandler(async (req, res) => {
  const { userId, descriptor } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "ID utilisateur requis" });
  }

  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    return res.status(400).json({ success: false, message: "Descripteur invalide - doit être un tableau de 128 éléments" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    user.descriptor = descriptor;
    await user.save();

    res.status(200).json({ success: true, message: "Descripteur mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour" });
  }
});
module.exports.getAllusers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find()
      .select('-__v -profile') // Exclure __v et profile de l'utilisateur
      .populate('profile', 'name'); // Peupler le champ profile avec le champ name

    const modifiedUsers = await Promise.all(users.map(async (user) => {
      let decryptedPassword = '';
      
      try {
        // Essayer de décrypter le mot de passe
        if (user.pwd) {
          decryptedPassword = decrypt(user.pwd);
        }
      } catch (err) {
        console.error(`Erreur de décryptage pour l'utilisateur ${user._id}:`, err);
        decryptedPassword = '';
      }

      return {
        _id: user._id,
        email: user.email,
        pwd: decryptedPassword,
        name: user.profile ? user.profile.name : null,
      };
    }));

    res.status(200).json(modifiedUsers);
  } catch (err) {
    console.error('Erreur dans getAllusers:', err);
    res.status(500).json({ 
      message: "Erreur serveur",
      error: err.message 
    });
  }
});
module.exports.updateUser = asyncHandler(async (req, res) => {
  const { userId, name, email, password } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  // Vérifier l'utilisateur
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Vérifier le profil
  const profile = await Profile.findOne({ userId });
  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  // Mise à jour de l'email si fourni et différent
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }
    user.email = email;
  }

  // Mise à jour du mot de passe si fourni
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    user.pwd = encrypt(password);
  }

  // Mise à jour du nom si fourni
  if (name) {
    profile.name = name;
    await profile.save();
  }

  await user.save();
  
  res.status(200).json({ 
    message: "User updated successfully",
    updatedFields: {
      name: !!name,
      email: !!email,
      password: !!password
    }
  });
});

// Suppression d'un utilisateur
module.exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Suppression du profil associé
  await Profile.findOneAndDelete({ userId: id });
  
  res.status(200).json({ message: "User deleted successfully" });
});

module.exports.updateEmailFunction= asyncHandler(async (req, res) => {
  const { userId, newEmail } = req.body;
  
  if (!userId || !newEmail) {
    return res.status(400).json({ message: "userId و newEmail مطلوبان" });
  }
  
  // تحقق من وجود المستخدم
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }
  
  // تحقق من صحة البريد الجديد مثلاً (اختياري)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return res.status(400).json({ message: "Email non valide" });
  }
  
  // تحقق من عدم وجود مستخدم آخر بنفس البريد الجديد
  const existingUser = await User.findOne({ email: newEmail });
  if (existingUser) {
    return res.status(400).json({ message: "Email déjà utilisé" });
  }
  
  // حدّث البريد الإلكتروني
  user.email = newEmail;
  await user.save();
  
  res.status(200).json({ message: "Email mis à jour avec succès", email: newEmail });
});
module.exports.updatePasswordController = asyncHandler(async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ message: "userId et nouveau mot de passe requis" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  user.pwd = encrypt(newPassword);
  await user.save();

  res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
});
module.exports.gettokenEmail = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email invalide ou manquant',
      });
    }

    // Chercher l'utilisateur par email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }

    const authToken = user.generateAuthToken(); // Cette méthode doit exister dans ton modèle utilisateur

    res.status(200).json({
      _id: user._id,
      email: user.email,
      token: authToken,
    });

  } catch (err) {
    console.error('💥 Erreur dans gettokenEmail :', err);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
    });
  }
});

module.exports.getUserCountByDate = asyncHandler(async (req, res) => {
  try {
    const aggregation = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Trie par date croissante
    ]);

    res.status(200).json({
      success: true,
      data: aggregation
    });
  } catch (err) {
    console.error("Erreur dans getUserCountByDate:", err);
    res.status(500).json({
      success: false,
      error: "Erreur serveur"
    });
  }
});