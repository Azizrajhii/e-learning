const Users = require("./../models/userModel");
const Profile = require('./../models/profileModel'); 

async function getTrainerByID(req, res) {
  try {
    const { trainerID } = req.query;

    if (!trainerID) {
      return res.status(400).json({ error: "trainerID est requis" });
    }

    const userId = trainerID;
    const profile = await Profile.findOne({ userId }).populate(
      "userId",
      "email"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const response = {
      name : profile.name,
      lastName: profile.lastName,
      sex: profile.sex,
      profilePicture: profile.profilePicture,
      bio: profile.bio,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération du formateur :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

module.exports = {
  getTrainerByID,
};
