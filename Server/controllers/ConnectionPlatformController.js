const Profile = require('./../models/profileModel'); // Assurez-vous que le chemin est correct
const { getUserId } = require('./../utils/tokenAuth.js');

const addNewConnection = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { platform, userName, url, icon, connected } = req.body;

    const newConnection = { platform, userName, url, icon, connected };

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.socials.push(newConnection);
    await profile.save();

    res.status(201).json({ message: "Social connection added", socials: profile.socials });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /socials/:id
const removeConnectionById = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const socialId = req.params.id;

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const initialLength = profile.socials.length;

    profile.socials = profile.socials.filter((social) => social._id.toString() !== socialId);

    if (profile.socials.length === initialLength) {
      return res.status(404).json({ message: "Connection not found" });
    }

    await profile.save();

    res.status(200).json({ message: "Social connection removed", socials: profile.socials });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// GET /socials
const getAllConnections = async (req, res) => {
  try {
    const userId = await getUserId(req);

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.status(200).json({ socials: profile.socials });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const changeConnectionStatus = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { id } = req.params;

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const connection = profile.socials.id(id); // ✅ Utilise Mongoose subdocument accessor

    if (!connection) return res.status(404).json({ message: "Connection not found" });

    connection.connected = !connection.connected;

    await profile.save();
    res.status(200).json({ message: "Connection status updated", updated: connection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



module.exports = { removeConnectionById , addNewConnection, getAllConnections, changeConnectionStatus };