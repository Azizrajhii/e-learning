require("dotenv").config();
const crypto = require("crypto");
const mongoose = require("mongoose");

const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const Formation = require("../models/formationModel");
const Lesson = require("../models/lessonModel");
const Article = require("../models/articlesModel");
const Event = require("../models/EventModel");
const Question = require("../models/question");
const Questionnaire = require("../models/questionnaireModel");
const Poll = require("../models/PollModel");
const Comment = require("../models/commentsModel");
const Follower = require("../models/FollowerModel");
const Notification = require("../models/NotificationModel");
const SavedArticle = require("../models/SavedArticleModal");
const Progress = require("../models/ProgressModel");

const algorithm = "aes-256-cbc";
const PYTHON_LESSON_PDF_URL =
  "http://localhost:5000/static/ia-model/Python_Lesson_Dataset.pdf";

function encryptPassword(text) {
  const key = process.env.ENCRYPTION_KEY;
  const iv = process.env.ENCRYPTION_IV;

  if (!key || !iv) {
    throw new Error("ENCRYPTION_KEY or ENCRYPTION_IV is missing in .env");
  }

  const keyBuffer = Buffer.from(key, "hex");
  const ivBuffer = Buffer.from(iv, "hex");
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, ivBuffer);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

async function connect() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
}

async function upsertUser(email, plainPassword, num) {
  const encrypted = encryptPassword(plainPassword);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { pwd: encrypted, num } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return user;
}

async function upsertProfile(user, overrides) {
  const base = {
    userId: user._id,
    name: "Test",
    lastName: "User",
    sex: "Other",
    specialty: "QA",
    bio: "Profil de test genere automatiquement",
    profilePicture: "",
    country: "TN",
    government: "Tunis",
    address: "SkillShare Test Address",
  };

  return Profile.findOneAndUpdate(
    { userId: user._id },
    { $set: { ...base, ...overrides } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensureFormation(instructorId, title, category, description, coverImage, maxSeats) {
  return Formation.findOneAndUpdate(
    { title, InstructorId: instructorId },
    {
      $set: {
        InstructorId: instructorId,
        title,
        category,
        description,
        coverImage,
        maxSeats,
        status: "ongoing",
        accepted: true,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensureLesson(
  formation,
  title,
  order,
  duration,
  url,
  contentType = "video"
) {
  const lesson = await Lesson.findOneAndUpdate(
    { formationId: formation._id, title },
    {
      $set: {
        formationId: formation._id,
        title,
        description: `${title} - contenu de test`,
        duration,
        order,
        content: { type: contentType, url },
        isPublished: true,
        publicDate: new Date(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Use $addToSet + findOneAndUpdate to bypass the post('save') hook
  // which causes an infinite loop (post save -> updateTotalHours -> save -> ...)
  await Formation.findOneAndUpdate(
    { _id: formation._id, "lessons.lessonId": { $ne: lesson._id } },
    { $addToSet: { lessons: { lessonId: lesson._id } } }
  );

  // Keep in-memory ref in sync for subsequent checks in the same seed run
  const alreadyLinked = formation.lessons.some(
    (entry) => String(entry.lessonId) === String(lesson._id)
  );
  if (!alreadyLinked) formation.lessons.push({ lessonId: lesson._id });

  return lesson;
}

async function ensureArticle(userId, title, content) {
  return Article.findOneAndUpdate(
    { userId, title },
    {
      $set: {
        userId,
        title,
        content,
        link: null,
        image: null,
        video: null,
        poll: null,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensureEvent(userId, title, dateOffsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + dateOffsetDays);

  return Event.findOneAndUpdate(
    { userId, title },
    {
      $set: {
        userId,
        title,
        description: "Evenement de test",
        color: "#2f7dff",
        date,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  await connect();

  // ─────────────────────────────────────────────
  // 1. USERS
  // ─────────────────────────────────────────────
  const trainer = await upsertUser("trainer.test@skillshare.local", "Test@123", 22222222);
  const learner  = await upsertUser("learner.test@skillshare.local",  "Test@123", 55555555);
  const learner2 = await upsertUser("learner2.test@skillshare.local", "Test@123", 55555556);

  // ─────────────────────────────────────────────
  // 2. PROFILES
  // ─────────────────────────────────────────────
  await upsertProfile(trainer, {
    name: "Trainer", lastName: "Demo",
    specialty: "Python", bio: "Formateur Python de test SkillShare Hub",
  });
  await upsertProfile(learner, {
    name: "Learner", lastName: "Demo",
    specialty: "Python", bio: "Apprenant Python de test",
  });
  await upsertProfile(learner2, {
    name: "Learner2", lastName: "Beta",
    specialty: "Data", bio: "Second apprenant Python de test",
  });

  const oldReactFormation = await Formation.findOne({
    InstructorId: trainer._id,
    title: "React Fundamentals - Test",
  });

  if (oldReactFormation) {
    const oldLessons = await Lesson.find({ formationId: oldReactFormation._id }).select("_id");
    const oldLessonIds = oldLessons.map((lesson) => lesson._id);

    await Progress.deleteMany({ formationId: oldReactFormation._id });
    await Questionnaire.deleteMany({ LessonId: { $in: oldLessonIds } });
    await Lesson.deleteMany({ formationId: oldReactFormation._id });
    await Formation.deleteOne({ _id: oldReactFormation._id });
  }

  await Questionnaire.deleteMany({
    title: {
      $in: [
        "Quiz - Introduction React",
        "Quiz - State and Effects",
        "Quiz - React Router v6",
        "Quiz - Context API & Hooks",
      ],
    },
  });
  await Article.deleteMany({
    title: {
      $in: [
        "Question de test — React Router",
        "Sondage — frameworks frontend",
      ],
    },
  });
  await Event.deleteMany({
    title: {
      $in: [
        "Demo Formation React - Test",
        "Session Quiz React",
      ],
    },
  });
  await Poll.deleteMany({ question: "Quel framework frontend préférez-vous ?" });

  // ─────────────────────────────────────────────
  // 3. FORMATION + LESSONS
  // ─────────────────────────────────────────────
  const formation = await ensureFormation(
    trainer._id,
    "Python Fundamentals - Test",
    "Python",
    "Formation seed Python pour tester le parcours formation complet.",
    "https://placehold.co/1200x630/png",
    30
  );

  // Enroll learners
  // Use findOneAndUpdate to bypass the post('save') infinite loop
  await Formation.findOneAndUpdate(
    { _id: formation._id, "enrolledSeats.userId": { $ne: learner._id } },
    { $addToSet: { enrolledSeats: { userId: learner._id } } }
  );
  await Formation.findOneAndUpdate(
    { _id: formation._id, "enrolledSeats.userId": { $ne: learner2._id } },
    { $addToSet: { enrolledSeats: { userId: learner2._id } } }
  );

  const lesson1 = await ensureLesson(formation, "Introduction to Python", 1, 45, "https://example.com/videos/python-intro");
  const lesson2 = await ensureLesson(formation, "Python Data Structures", 2, 50, "https://example.com/videos/python-data-structures");
  const lesson3 = await ensureLesson(formation, "Functions and Modules",  3, 40, PYTHON_LESSON_PDF_URL, "pdf");
  const lesson4 = await ensureLesson(formation, "File Handling in Python",4, 55, "https://example.com/videos/python-file-handling");

  // ─────────────────────────────────────────────
  // 4. QUESTIONS + QUESTIONNAIRES (pour le Puzzle/Quiz)
  // ─────────────────────────────────────────────
  const makeQuestion = async (text, options, reponse) => {
    let q = await Question.findOne({ text });
    if (!q) q = await Question.create({ text, options, reponse });
    return q;
  };

  const q1  = await makeQuestion(
    "Qu'est-ce que Python ?",
    ["Un framework CSS", "Un langage de programmation", "Un serveur web", "Une base de données"],
    "Un langage de programmation"
  );
  const q2  = await makeQuestion(
    "Quel type de structure stocke des paires clé-valeur en Python ?",
    ["List", "Tuple", "Dictionary", "Set"],
    "Dictionary"
  );
  const q3  = await makeQuestion(
    "À quoi sert une fonction en Python ?",
    ["À styliser une page", "À exécuter du code réutilisable", "À créer une route API", "À compiler le projet"],
    "À exécuter du code réutilisable"
  );
  const q4  = await makeQuestion(
    "Quelle fonction permet d'ouvrir un fichier texte en Python ?",
    ["read()", "open()", "file()", "load()"],
    "open()"
  );
  const q5  = await makeQuestion(
    "Quel mot-clé permet de définir une fonction en Python ?",
    ["func", "function", "def", "lambda"],
    "def"
  );
  const q6  = await makeQuestion(
    "Quel type est mutable en Python ?",
    ["tuple", "str", "list", "int"],
    "list"
  );
  const q7  = await makeQuestion(
    "Que fait l'instruction import en Python ?",
    ["Elle déclare une variable", "Elle ajoute du style", "Elle charge un module", "Elle supprime un fichier"],
    "Elle charge un module"
  );
  const q8  = await makeQuestion(
    "Quel symbole est utilisé pour les commentaires sur une ligne en Python ?",
    ["//", "<!-- -->", "#", "/* */"],
    "#"
  );

  // Questionnaire lié à lesson1
  let quest1 = await Questionnaire.findOne({ title: "Quiz - Introduction to Python", LessonId: lesson1._id });
  if (!quest1) {
    quest1 = await Questionnaire.create({
      LessonId: lesson1._id,
      title: "Quiz - Introduction to Python",
      minscore: 60,
      question: [q1._id, q2._id, q6._id, q8._id],
    });
  }

  // Questionnaire lié à lesson2
  let quest2 = await Questionnaire.findOne({ title: "Quiz - Python Data Structures", LessonId: lesson2._id });
  if (!quest2) {
    quest2 = await Questionnaire.create({
      LessonId: lesson2._id,
      title: "Quiz - Python Data Structures",
      minscore: 70,
      question: [q2._id, q3._id, q7._id],
    });
  }

  // Questionnaire lié à lesson3
  let quest3 = await Questionnaire.findOne({ title: "Quiz - Functions and Modules", LessonId: lesson3._id });
  if (!quest3) {
    quest3 = await Questionnaire.create({
      LessonId: lesson3._id,
      title: "Quiz - Functions and Modules",
      minscore: 60,
      question: [q4._id, q1._id, q6._id, q5._id, q8._id],
    });
  }

  // Questionnaire lié à lesson4
  let quest4 = await Questionnaire.findOne({ title: "Quiz - File Handling in Python", LessonId: lesson4._id });
  if (!quest4) {
    quest4 = await Questionnaire.create({
      LessonId: lesson4._id,
      title: "Quiz - File Handling in Python",
      minscore: 75,
      question: [q5._id, q3._id, q7._id, q2._id],
    });
  }

  // ─────────────────────────────────────────────
  // 5. PROGRESS (learner a complété les 2 premières leçons)
  // ─────────────────────────────────────────────
  await Progress.findOneAndUpdate(
    { userId: learner._id, formationId: formation._id },
    {
      $set: {
        userId: learner._id,
        formationId: formation._id,
        completedLessons: [
          { LessonId: lesson1._id, note: 85 },
          { LessonId: lesson2._id, note: 72 },
        ],
      },
    },
    { upsert: true, new: true }
  );

  await Progress.findOneAndUpdate(
    { userId: learner2._id, formationId: formation._id },
    {
      $set: {
        userId: learner2._id,
        formationId: formation._id,
        completedLessons: [
          { LessonId: lesson1._id, note: 90 },
        ],
      },
    },
    { upsert: true, new: true }
  );

  // ─────────────────────────────────────────────
  // 6. POLL + ARTICLES
  // ─────────────────────────────────────────────
  let poll = await Poll.findOne({ question: "Quel framework frontend préférez-vous ?" });
  if (!poll) {
    poll = await Poll.create({
      question: "Quel domaine Python préférez-vous ?",
      answers: [
        { _id: "opt1", label: "Web",           nbChosen: [{ userId: learner._id }] },
        { _id: "opt2", label: "Data Science",  nbChosen: [] },
        { _id: "opt3", label: "Automation",    nbChosen: [{ userId: learner2._id }] },
        { _id: "opt4", label: "AI",            nbChosen: [] },
      ],
    });
  }

  const article1 = await ensureArticle(
    trainer._id,
    "Bienvenue sur le forum de test",
    "Ceci est un article seed pour valider la FAQ et les interactions. Likez, commentez, sauvegardez !"
  );
  const article2 = await ensureArticle(
    learner._id,
    "Question de test — Modules Python",
    "Comment bien organiser les modules Python dans un projet un peu grand ?"
  );

  // Article avec poll
  let article3 = await Article.findOne({ title: "Sondage — univers Python" });
  if (!article3) {
    article3 = await Article.create({
      userId: trainer._id,
      title: "Sondage — univers Python",
      content: "Votez pour le domaine Python qui vous attire le plus !",
      poll: poll._id,
      link: null, image: null, video: null,
    });
  }

  // Likes sur article1
  const alreadyLiked1 = article1.nbLikes.some(id => String(id) === String(learner._id));
  const alreadyLiked2 = article1.nbLikes.some(id => String(id) === String(learner2._id));
  if (!alreadyLiked1) article1.nbLikes.push(learner._id);
  if (!alreadyLiked2) article1.nbLikes.push(learner2._id);
  await article1.save();

  // ─────────────────────────────────────────────
  // 7. COMMENTS
  // ─────────────────────────────────────────────
  let comment1 = await Comment.findOne({ content: "Super article, très utile pour débuter !" });
  if (!comment1) {
    comment1 = await Comment.create({
      userId: learner._id,
      content: "Super article, très utile pour débuter !",
    });
    article1.comments.push(comment1._id);
    await article1.save();
  }

  let comment2 = await Comment.findOne({ content: "J'ai la même question, quelqu'un peut aider ?" });
  if (!comment2) {
    comment2 = await Comment.create({
      userId: learner2._id,
      content: "J'ai la même question, quelqu'un peut aider ?",
    });
    article2.comments.push(comment2._id);
    await article2.save();
  }

  let reply1 = await Comment.findOne({ content: "Commencez par séparer votre logique en modules utils, services et routes métier." });
  if (!reply1) {
    reply1 = await Comment.create({
      userId: trainer._id,
      content: "Commencez par séparer votre logique en modules utils, services et routes métier.",
    });
    comment2.replies.push(reply1._id);
    await comment2.save();
  }

  // ─────────────────────────────────────────────
  // 8. FOLLOWS (learner suit trainer, learner2 suit trainer et learner)
  // ─────────────────────────────────────────────
  const follow = async (followerId, followingId) => {
    const exists = await Follower.findOne({ followerId, followingId });
    if (!exists) await Follower.create({ followerId, followingId });
  };
  await follow(learner._id,  trainer._id);
  await follow(learner2._id, trainer._id);
  await follow(learner2._id, learner._id);

  // ─────────────────────────────────────────────
  // 9. NOTIFICATIONS
  // ─────────────────────────────────────────────
  const notify = async (recipientId, senderId, message, type) => {
    const exists = await Notification.findOne({ recipient: recipientId, sender: senderId, message });
    if (!exists) await Notification.create({ recipient: recipientId, sender: senderId, message, type });
  };
  await notify(trainer._id, learner._id,  "Learner Demo a commencé à vous suivre",         "follow");
  await notify(trainer._id, learner2._id, "Learner2 Beta a commencé à vous suivre",         "follow");
  await notify(trainer._id, learner._id,  "Learner Demo a aimé votre article",              "like");
  await notify(trainer._id, learner._id,  "Learner Demo a commenté votre article",          "comment");
  await notify(learner._id, trainer._id,  "Trainer Demo a répondu à un commentaire",        "comment");

  // ─────────────────────────────────────────────
  // 10. SAVED ARTICLES
  // ─────────────────────────────────────────────
  const saveArt = async (userId, articleId) => {
    const exists = await SavedArticle.findOne({ userId, articleId });
    if (!exists) await SavedArticle.create({ userId, articleId });
  };
  await saveArt(learner._id,  article1._id);
  await saveArt(learner._id,  article3._id);
  await saveArt(learner2._id, article2._id);

  // ─────────────────────────────────────────────
  // 11. EVENTS
  // ─────────────────────────────────────────────
  await ensureEvent(trainer._id, "Daily Standup Test",          1);
  await ensureEvent(trainer._id, "Demo Formation Python - Test", 3);
  await ensureEvent(learner._id, "Code Review Test",            2);
  await ensureEvent(learner._id, "Session Quiz Python",         5);

  // ─────────────────────────────────────────────
  // 12. COUNTS SUMMARY
  // ─────────────────────────────────────────────
  const counts = {
    users:          await User.countDocuments({ email: /\.test@skillshare\.local$/ }),
    formations:     await Formation.countDocuments({ title: /- Test$/ }),
    lessons:        await Lesson.countDocuments({ formationId: formation._id }),
    questions:      await Question.countDocuments(),
    questionnaires: await Questionnaire.countDocuments(),
    polls:          await Poll.countDocuments(),
    articles:       await Article.countDocuments({ userId: { $in: [trainer._id, learner._id] } }),
    comments:       await Comment.countDocuments(),
    follows:        await Follower.countDocuments(),
    notifications:  await Notification.countDocuments(),
    savedArticles:  await SavedArticle.countDocuments(),
    events:         await Event.countDocuments({ userId: { $in: [trainer._id, learner._id] } }),
    progress:       await Progress.countDocuments({ formationId: formation._id }),
  };

  console.log("\n✅ Seed terminé !\n");
  console.log(counts);
  console.log("\n📋 Comptes de test:");
  console.log("  Trainer : trainer.test@skillshare.local  /  Test@123");
  console.log("  Learner : learner.test@skillshare.local  /  Test@123");
  console.log("  Learner2: learner2.test@skillshare.local /  Test@123");
  console.log("\n🧩 Quiz disponibles (par titre de questionnaire):");
  for (const q of [quest1, quest2, quest3, quest4]) {
    console.log(`  - ${q.title}  (minscore: ${q.minscore}%)`);
  }
}

seed()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed failed:", error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  });
