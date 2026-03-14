const { getUserId } = require('./../utils/tokenAuth.js');
const User = require('./../models/userModel');
const Profile = require('./../models/profileModel'); // Assurez-vous que le chemin est correct
const Notification = require("./../models/NotificationModel");
const checkIfFriend = async (req, res) => {
  try {
    const userId = await getUserId(req); // récupère l'ID de l'utilisateur connecté
    const { PeopleId } = req.params; // ID de la personne à vérifier

    const user = await Profile.findOne({ userId });
    const targetUser = await Profile.findOne({ userId: PeopleId });

    if (!user || !targetUser) {
      console.warn("Utilisateur(s) introuvable(s)");
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const isFriend =
      Array.isArray(user.following) &&
      Array.isArray(targetUser.followers) &&
      user.following.includes(PeopleId) &&
      targetUser.followers.includes(userId);

    return res.status(200).json({ isFriend });
  } catch (err) {
    console.error("Erreur dans checkIfFriend:", err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

const handleFollow = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { PeopleId } = req.params;

    const user = await Profile.findOne({ userId });
    const targetUser = await Profile.findOne({ userId: PeopleId });

    if (!user || !targetUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    if (!user.following.includes(PeopleId)) {
      user.following.push(PeopleId);
      await user.save();
    }

    if (!targetUser.followers.includes(userId)) {
      targetUser.followers.push(userId);
      await targetUser.save();
    }

    const peopleIdStr = PeopleId.toString();
    const userIdStr = userId.toString();

    const message = `${user.name} a commencé à vous suivre.`;

    const notification = new Notification({
      recipient: peopleIdStr,
      sender: userIdStr,
      message,
    });

    await notification.save();

    return res.status(200).json({ message: "Abonnement réussi." });
  } catch (err) {
    console.error("Erreur dans handleFollow:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
const handleUnfollow = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { PeopleId } = req.params;

    const user = await Profile.findOne({ userId });
    const targetUser = await Profile.findOne({ userId: PeopleId });

    if (!user || !targetUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    user.following = user.following.filter(id => id.toString() !== PeopleId);
    await user.save();

    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
    await targetUser.save();

    return res.status(200).json({ message: 'Désabonnement réussi.' });
  } catch (err) {
    console.error("Erreur dans handleUnfollow:", err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  checkIfFriend,
  handleFollow,
  handleUnfollow,
};