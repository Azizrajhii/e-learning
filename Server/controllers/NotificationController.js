const Notification = require("./../models/NotificationModel");
const { getUserId } = require("./../utils/tokenAuth.js");

const getAllNotifications = async (req, res) => {
  const userId = await getUserId(req);

  try {
    const notifications = await Notification.find({ recipient: userId })
      .sort({ time: -1 })
      .populate({
        path: "sender",
        select: "profile",
        populate: {
          path: "profile",
          select: "name lastName profilePicture",
          transform: (doc) => ({
            name: doc?.name || "",
            lastName: doc?.lastName || "",
            profilePicture: doc?.profilePicture || "",
          }),
        },
      })
      .lean();

    // Better logging for debugging
    console.log(JSON.stringify(notifications, null, 2));

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des notifications." });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  const userId = await getUserId(req);

  try {
    await Notification.updateMany(
      { recipient: userId, unread: true },
      { $set: { unread: false } }
    );

    // Notifier le client via Socket.IO si nécessaire
    const { io, connectedUsers } = req;
    if (connectedUsers.has(userId)) {
      const socketId = connectedUsers.get(userId);
      io.to(socketId).emit("notificationsMarkedAsRead");
    }

    res.status(200).json({
      message: "Toutes les notifications ont été marquées comme lues.",
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const sendNotification = async (req, res) => {
  try {
    const recipientId = req.params.userId;
    const sender = await getUserId(req);
    const { message } = req.body;
    console.log("recipientId", recipientId, "sender", sender);
    if (!message) {
      return res.status(400).json({ message: "Le message est requis." });
    }

    // Dans le contrôleur d'envoi de notification
    const newNotification = await Notification.create({
      recipient: recipientId,
      sender: userId,
      message,
      unread: true,
    }).populate("sender", "profile");

    // Émettre la notification complète
    if (connectedUsers.has(recipientId)) {
      io.to(connectedUsers.get(recipientId)).emit("notification", {
        ...newNotification.toObject(),
        sender: {
          profile: {
            name: req.user.profile.name,
            lastName: req.user.profile.lastName,
            profilePicture: req.user.profile.profilePicture,
          },
        },
      });
    }

    await newNotification.save();

    // Envoi en temps réel via Socket.IO si connecté
    const { io, connectedUsers } = req;
    if (connectedUsers.has(recipientId)) {
      const socketId = connectedUsers.get(recipientId);
      io.to(socketId).emit("notification", newNotification);
    }

    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Dans NotificationController.js
const getUnreadCount = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const count = await Notification.countDocuments({
      recipient: userId,
      unread: true,
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error getting unread count", error });
  }
};

module.exports = {
  getAllNotifications,
  sendNotification,
  markAllNotificationsAsRead,
  getUnreadCount,
};
