const cron = require("node-cron");
const mongoose = require("mongoose");
const Event = require("./../models/EventModel");
const Notification = require("./../models/NotificationModel");
const User = require("./../models/userModel");

const sendDailyEventReminders = async (io, connectedUsers) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ Skipping reminder job because MongoDB is not connected.");
    return;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  try {
    console.log("🔍 Checking for events between:", todayStart, "and", todayEnd);
    const eventsToday = await Event.find({
      date: { $gte: todayStart, $lte: todayEnd },
    });

    console.log(`📅 Found ${eventsToday.length} event(s) for today.`);

    for (const event of eventsToday) {
      const user = await User.findById(event.userId);
      if (!user) continue;

      const message = `Rappel: Vous avez un événement aujourd'hui: "${event.title}"`;

      const alreadySent = await Notification.findOne({
        recipient: event.userId,
        message: message,
      });

      if (!alreadySent) {
        const notification = new Notification({
          recipient: event.userId,
          sender: event.userId, // or system user
          message,
        });

        await notification.save();

        if (connectedUsers.has(event.userId.toString())) {
          const socketId = connectedUsers.get(event.userId.toString());
          io.to(socketId).emit("notification", notification);
          console.log(`📤 Notification sent to user ${user._id}`);
        }
      }
    }

    console.log("✅ Reminder job complete.");
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi des rappels d’événement :", error);
  }
};

// For testing: runs every minute
const scheduleDailyReminders = (io, connectedUsers) => {
  cron.schedule("* * * * *", () => {
    console.log("⏰ Running daily event reminder job");
    sendDailyEventReminders(io, connectedUsers);
  });
};

module.exports = {
  scheduleDailyReminders,
  sendDailyEventReminders, // also exported for manual route testing
};
