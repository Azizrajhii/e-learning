require("dotenv").config();
const express = require("express");
const http = require("http"); // <-- Required to create server
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const cron = require('node-cron');
const Daily = require('@daily-co/daily-js');


const app = express();
const server = http.createServer(app); // <-- Create HTTP server from Express

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(
  cors(corsOptions)
);

// Middleware
app.use(express.json());
app.use(
  "/static/ia-model",
  express.static(path.join(__dirname, "IA_model"))
);

// Trust extra CAs if needed
process.env.NODE_EXTRA_CA_CERTS = require.resolve(
  "node_extra_ca_certs_mozilla_bundle"
);

// Connect DB
connectDB();

const io = new Server(server, {
  cors: corsOptions,
});
// Store connected users (optional, for targeting specific users)
const connectedUsers = new Map();

// Dans server.js (ou index.js)
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("register_user", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`📌 User ${userId} registered to socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    // Nettoyer les utilisateurs déconnectés
    for (const [userId, id] of connectedUsers.entries()) {
      if (id === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Routes
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const formationRoutes = require("./routes/formationRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const searchBarRoutes = require("./routes/searchBarRoutes");
const chatBoxRoutes = require("./routes/chatBoxRoutes");
const EventsRoutes = require("./routes/EventRoutes");
const ArticlesRoutes = require("./routes/articlesRoutes");
const likesArticlesRoutes = require("./routes/likesArticlesRoutes");
const savedArticlesRoutes = require("./routes/SavedArticleRoutes");
const pollRoutes = require("./routes/PollRoutes");
const followRoutes = require("./routes/followsRoutes");
const progressRoutes = require("./routes/ProgressRoutes");
const ConnectionPlatformRoutes = require("./routes/ConnectionPlatformRoutes");
const quizRoutes = require("./routes/quizRoutes");
const notificationRoutes = require("./routes/NotificationRoutes");
const commentaireRoutes = require("./routes/commentsRoutes");
const homeRoutes = require("./routes/homeRoutes");
const meetingRoomRoutes = require("./routes/meetingRoomRoutes");
const CvRoutes = require("./routes/CvRoutes");
const cerificatRoutes =require("./routes/certificateRoutes");
const visitCountRoutes = require("./routes/visitCountRoutes");
const questionnaireRoutes=require("./routes/questionnaireRoutes");

// Inject io and connectedUsers dans les routes ou contrôleurs via un middleware simple
app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  next();
});

// Mount API routes
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/formations", formationRoutes);
app.use("/api/getTrainerByID", trainerRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/search", searchBarRoutes);
app.use("/api/chat", chatBoxRoutes);
app.use("/api/events", EventsRoutes);
app.use("/api/articles/Poll", pollRoutes);
app.use("/api/articles/liked", likesArticlesRoutes);
app.use("/api/articles/saved", savedArticlesRoutes);
app.use("/api/articles", ArticlesRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/ConnectionPlatform", ConnectionPlatformRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/commentaires", commentaireRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/Cv", CvRoutes);
app.use("/api/certificates",cerificatRoutes);
app.use("/api/visit-count", visitCountRoutes);
app.use("/api/questionnaire" , questionnaireRoutes);

const {
  scheduleDailyReminders,
} = require("./controllers/eventReminderJobController");
scheduleDailyReminders(io, connectedUsers);

// Launch server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
