import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./FormationDetails.css";
import "./LessonContainer.css";
import "./CongratulationsModal.css";
import axios from "axios";
import useFetchTrainer from "./../utils/useFetchTrainer.jsx";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";
import LessonIcon from "./../images/LessonIcon.png";
import InformationIcon from "./../images/InformationIcon.png";
import StarIcon from "./../images/StarIcon.png";
import CommunityImage from "./../images/aa.png";
import under50Medal from "./../images/under50Medal.png";
import over90Medal from "./../images/over90Medal.png";
import between71And90Medal from "./../images/between71And90Medal.png";
import between50And70Medal from "./../images/between50And70Medal.png";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";
import learning from "./../images/learning.png";



const CongratulationsModal = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const { FormationId } = useParams();
  const [averageScore, setAverageScore] = useState(0);

  const fetchMyProgress = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `http://localhost:5000/api/progress/fetchUserProgress/${FormationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data)
      setAverageScore(response.data.average);
      if (response.data.average < 50) {
        return;
      } else {
        const response = await axios.post(
          `http://localhost:5000/api/progress/certificates/generate/${FormationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(response.data);
      }

    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchMyProgress();
  }, []);

  useEffect(() => {
    if (averageScore >= 50) {
      const duration = 3 * 5000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        confetti(
          Object.assign({}, defaults, {
            particleCount: 60,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
          })
        );
      }, 250);

      return () => clearInterval(interval);
    }
  }, [averageScore]);

  const isHighScore = averageScore >= 50;

  return (
    <motion.div
      className="unique-congrats-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="unique-congrats-modal"
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="unique-congrats-modal-content">
          {isHighScore ? (
            <>
              <div className="unique-congrats-modal-trophy-icon">
                <span>🎉</span>
              </div>
              <h2>{t("FormationDetails.amazingAchievement")}</h2>
              <p className="unique-congrats-modal-subtitle">
                {t("FormationDetails.masteredLessons")}
              </p>
            </>
          ) : (
            <>
              <div className="unique-congrats-modal-trophy-icon">
                <span>💪</span>
              </div>
              <h2>{t("FormationDetails.keepGoing") || "Keep Going!"}</h2>
              <p className="unique-congrats-modal-subtitle">
                {t("FormationDetails.youreMakingProgress") || "You're making progress! Every step counts."}
              </p>
            </>
          )}

          <div className="unique-congrats-modal-score-display">
            <div className="unique-congrats-modal-score-circle">
              <span>{averageScore}</span>
              <div className="unique-congrats-modal-score-label">
                {t("FormationDetails.average")}
              </div>
            </div>
            <div className="unique-congrats-modal-score-description">
              {isHighScore ? (
                <>
                  <p>{t("FormationDetails.dedicationPaidOff")}</p>
                  <p>{t("FormationDetails.keepUpGreatWork")}</p>
                </>
              ) : (
                <>
                  <p>{t("FormationDetails.learningIsProcess") || "Learning is a process - you're on the right track!"}</p>
                  <p>{t("FormationDetails.nextTimeBetter") || "With more practice, you'll do even better next time."}</p>
                </>
              )}
            </div>
          </div>

          {isHighScore && (
            <div className="unique-congrats-modal-stars">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="unique-congrats-modal-star"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                  }}
                >
                  ★
                </div>
              ))}
            </div>
          )}

          <button
            className="unique-congrats-modal-close-button"
            onClick={onClose}
          >
            {t("FormationDetails.continueLearning")}
            <svg viewBox="0 0 24 24">
              <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
            </svg>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
const LessonContainer = ({
  Lesson,
  index,
  FormationId,
  onAccountCompleted,
  allLessons,
}) => {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme-mode") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showDescription, setShowDescription] = useState(false);
  const [LessonPassed, setLessonPassed] = useState(false);
  const [examNote, setExamNote] = useState(0);
  const [isLocked, setIsLocked] = useState(index > 0);

  const fetchCompletedLessons = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/progress/${FormationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCompletedLessons(res.data);
      onAccountCompleted(res.data?.length);
      if (index > 0) {
        const previousLesson = allLessons[index - 1];
        const isPreviousCompleted = res.data.some(
          (completedLesson) => completedLesson.LessonId === previousLesson._id
        );
        setIsLocked(!isPreviousCompleted);
      } else {
        setIsLocked(false); // First lesson is never locked
      }
    } catch (err) {
      console.error("Error fetching completed lessons:", err);
    }
  };

  const checkIfThisLessonCompleted = () => {
    completedLessons.forEach((completedLesson) => {
      if (completedLesson.LessonId === Lesson._id) {
        setLessonPassed(true);
        setExamNote(completedLesson.note);
      }
    });
  };

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  const calculTotalRating = (ratingTab) => {
    if (!ratingTab || ratingTab.length === 0) return 0;
    let ratingMoy = 0;
    ratingTab.forEach((rating) => {
      ratingMoy += rating.value;
    });
    return ratingMoy / ratingTab.length;
  };

  const selectTheMedal = (note) => {
    if (note < 50) return under50Medal;
    if (note >= 90) return over90Medal;
    if (71 <= note < 90) return between71And90Medal;
    if (50 <= note <= 70) return between50And70Medal;
  };

  useEffect(() => {
    fetchCompletedLessons();
  }, [FormationId]);

  useEffect(() => {
    checkIfThisLessonCompleted();
  }, [completedLessons, Lesson]);

  return (
    <motion.div
      className="lesson-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="lesson-number">{index + 1}</div>

      <div className="lesson-content-wrapper">
        <div className="lesson-content">
          <h3 className="lesson-title">{Lesson.title}</h3>
          <div className="lesson-meta">
            <span className="lesson-duration">
              <i className="far fa-clock"></i> {Lesson.duration}{" "}
              {t("FormationDetails.hours")}
            </span>

            <div className="lesson-rating">
              <span className="rating-value">
                {calculTotalRating(Lesson.rating)}
              </span>
              <img src={StarIcon} alt="Star" className="star-icon" />
              <span className="reviews">
                ({Lesson?.rating?.length} {t("FormationDetails.reviews")})
              </span>
            </div>
          </div>

          {showDescription && (
            <motion.div
              className="lesson-description"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.1 }}
            >
              <p>{Lesson.description}</p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="lesson-actions">
        {LessonPassed && (
          <div className="lesson-tooltip-wrapper">
            <img
              src={selectTheMedal(examNote)}
              alt=""
              className="Lesson-Medal"
            />
            <div className="tooltip-score">{examNote} / 100 (note)</div>
          </div>
        )}

        {!LessonPassed &&
          (isLocked ? (
            <div>
              <button className="start-button locked" disabled>
                {t("FormationDetails.locked")}
              </button>
            </div>
          ) : (
            <Link
              to={`/SkillShareHub/Formation/${FormationId}/Lesson/${Lesson._id}`}
            >
              <button className="start-button">
                {t("FormationDetails.start")}
              </button>
            </Link>
          ))}
        <button
          className={`info-button ${showDescription ? "active" : ""}`}
          onClick={toggleDescription}
          aria-label={showDescription ? "Hide description" : "Show description"}
        >
          <img src={InformationIcon} alt="Info" />
        </button>
      </div>
    </motion.div>
  );
};

const MeetingSection = ({ formationId }) => {
  const { t } = useTranslation();

  // Mock data for meetings
  const mockMeetings = [
    {
      _id: "1",
      title: "Q&A Session",
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow (À venir)
      duration: 60,
      maxParticipants: 15,
    },
    {
      _id: "2",
      title: "Project Review",
      date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago (En cours)
      duration: 120, // 2 hour meeting
      maxParticipants: 10,
    },
    {
      _id: "3",
      title: "Weekly Discussion",
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday (Passé)
      duration: 30,
      maxParticipants: 20,
    },
  ];

  const [meetings, setMeetings] = useState(mockMeetings);
  const [isOpen, setIsOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    duration: 60,
    maxParticipants: 10,
  });

  const handleCreateMeeting = () => {
    const mockNewMeeting = {
      _id: Math.random().toString(36).substring(7),
      ...newMeeting,
    };
    setMeetings([...meetings, mockNewMeeting]);
    setIsOpen(false);
    setNewMeeting({
      title: "",
      date: "",
      duration: 60,
      maxParticipants: 10,
    });
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.date);
    const endTime = new Date(startTime.getTime() + meeting.duration * 60000);

    if (now < startTime) {
      return "upcoming";
    } else if (now >= startTime && now <= endTime) {
      return "in-progress";
    } else {
      return "completed";
    }
  };

  return (
    <section className="meeting-section">
      <div className="meeting-section-header">
        <h2>{t("MeetingSection.liveSessions")}</h2>
        <p>{t("MeetingSection.joinInteractive")}</p>
      </div>

      {isOpen && (
        <motion.div
          className="meeting-form"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h3>{t("MeetingSection.scheduleSession")}</h3>
          <div className="form-group">
            <label>{t("MeetingSection.title")}</label>
            <input
              type="text"
              value={newMeeting.title}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, title: e.target.value })
              }
              placeholder={t("MeetingSection.titlePlaceholder")}
            />
          </div>
          <div className="form-group">
            <label>{t("MeetingSection.dateTime")}</label>
            <input
              type="datetime-local"
              value={newMeeting.date}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, date: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>{t("MeetingSection.duration")} (minutes)</label>
            <input
              type="number"
              value={newMeeting.duration}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, duration: e.target.value })
              }
              min="30"
              max="180"
            />
          </div>
          <button
            className="meeting-submit-button"
            onClick={handleCreateMeeting}
            disabled={!newMeeting.title || !newMeeting.date}
          >
            {t("MeetingSection.createSession")}
          </button>
        </motion.div>
      )}

      <div className="meeting-cards-container">
        {meetings.length === 0 ? (
          <div className="no-meetings">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
              alt="No meetings"
            />
            <p>{t("MeetingSection.noScheduled")}</p>
          </div>
        ) : (
          meetings.map((meeting) => {
            const status = getMeetingStatus(meeting);
            return (
              <div key={meeting._id} className="meeting-card">
                <div className="meeting-status-indicator">
                  <span className={`status-dot ${status}`}></span>
                  {status === "upcoming"
                    ? t("MeetingSection.upcoming")
                    : status === "in-progress"
                      ? t("MeetingSection.inProgress")
                      : t("MeetingSection.completed")}
                </div>
                <h3>{meeting.title}</h3>
                <div className="meeting-meta">
                  <div className="meta-item">
                    <i className="far fa-calendar-alt"></i>
                    <span>{formatDate(meeting.date)}</span>
                  </div>
                  <div className="meta-item">
                    <i className="far fa-clock"></i>
                    <span>
                      {meeting.duration} {t("MeetingSection.minutes")}
                    </span>
                  </div>
                </div>
                <div className="meeting-actions">
                  {status === "in-progress" ? (
                    <button className="join-button active">
                      {t("MeetingSection.joinNow")}
                    </button>
                  ) : status === "upcoming" ? (
                    <button className="join-button disabled" disabled>
                      {t("MeetingSection.comingSoon")}
                    </button>
                  ) : (
                    <button className="review-button">
                      {t("MeetingSection.viewRecording")}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

const JoinModal = ({ setShowJoinModal, onJoinSuccess }) => {
  const { FormationId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/formations/JoinToFormation/${FormationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data)
      setShowJoinModal(false);
      onJoinSuccess();
    } catch (error) {
      console.error("Error joining formation:", error);
      setError(
        error.response?.data?.message || t("FormationDetails.joinError")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div className="FormationDetails-join-modal-overlay">
      <motion.div className="FormationDetails-join-modal">
        <img src={learning} alt="" />
        <h2>{t("FormationDetails.joinFormation")}</h2>
        <p>{t("FormationDetails.joinFormationMessage")}</p>

        <div className="FormationDetails-join-modal-buttons">
          <button className="FormationDetails-join-button" onClick={handleJoin}>
            {t("FormationDetails.joinNow")}
          </button>
          <button
            className="FormationDetails-cancel-button"
            onClick={() => navigate("/SkillShareHub/Formations")}
          >
            {t("FormationDetails.backToFormations")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const FormationDetails = () => {
  const { t, i18n } = useTranslation();
  const { FormationId } = useParams();
  const [formation, setFormation] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completed, setCompleted] = useState(0);
  const [nbLessons, setNbLessons] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loadingEnrollmentCheck, setLoadingEnrollmentCheck] = useState(true);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme-mode") || "light"
  );

  const handleJoinSuccess = () => {
    setIsUserEnrolled(true);
    setShowJoinModal(false); // Ensure modal is closed
    fetchFormation(); // Refresh formation data if needed
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const fetchFormation = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/formations/${FormationId}`
      );
      setFormation(response.data);
      fetchLessons();
    } catch (error) {
      console.error("Erreur de chargement des formation", error);
    }
  };

  const checkUserEnrollment = async () => {
    try {
      setLoadingEnrollmentCheck(true);
      const token = localStorage.getItem("token");

      if (!token) {
        // User not logged in
        setShowJoinModal(true);
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/formations/checkIfUserJoinedFormation/${FormationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsUserEnrolled(response.data.isEnrolled);

      if (!response.data.isEnrolled) {
        setShowJoinModal(true);
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
      // Handle error appropriately
    } finally {
      setLoadingEnrollmentCheck(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/lessons/${FormationId}`
      );
      setLessons(response.data);
      setNbLessons(response.data?.length);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const handleChangeCompleted = (value) => {
    setCompleted((value / nbLessons) * 100);
  };

  useEffect(() => {
    fetchFormation();
  }, [FormationId]);

  useEffect(() => {
    checkUserEnrollment();
  }, [FormationId]);

  useEffect(() => {
    if (completed === 100) setShowCongratulations(true);
  }, [completed]);

  const { data, loading, error } = useFetchTrainer(formation?.InstructorId);

  return (
    <>
      {showJoinModal && !isUserEnrolled && (
        <JoinModal
          setShowJoinModal={setShowJoinModal}
          onJoinSuccess={handleJoinSuccess}
          FormationId={FormationId}

        />
      )}
      <div className="formation-details-container">
        <header className="formation-header">
          <div className="header-content">
            <div className="breadcrumbs">
              <Link to="/SkillShareHub/Formations">
                {t("FormationDetails.formations")}
              </Link>{" "}
              / {formation?.title}
            </div>
            <h1 className="formation-title">{formation?.title}</h1>
            <p className="formation-description">{formation?.description}</p>

            <div className="formation-stats">
              <div className="stat-item">
                <span className="stat-value">{formation?.lessons?.length}</span>
                <span className="stat-label">
                  {t("FormationDetails.lessons")}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formation?.totalHours}</span>
                <span className="stat-label">
                  {t("FormationDetails.hoursLabel")}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formation?.averageRating}</span>
                <span className="stat-label">
                  {t("FormationDetails.Rating")}
                </span>
              </div>
            </div>
          </div>

          <div className="header-image">
            <img
              src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
              alt={formation?.title}
            />
          </div>
        </header>

        <main className="formation-content">
          <section className="lessons-section">
            <div className="section-header">
              <h2>{t("FormationDetails.CourseCurriculum")}</h2>
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${completed}%` }}
                  ></div>
                </div>
                <span>
                  {completed}% {t("FormationDetails.completed")}
                </span>
              </div>
            </div>

            <div className="lessons-list">
              {lessons.map((lesson, index) => (
                <LessonContainer
                  Lesson={lesson}
                  key={lesson._id}
                  index={index}
                  FormationId={FormationId}
                  onAccountCompleted={handleChangeCompleted}
                  allLessons={lessons}
                />
              ))}
            </div>
          </section>

          <aside className="formation-sidebar">
            <div className="community-card">
              <img src={CommunityImage} alt="Community" />
              <h3>{t("FormationDetails.JoinOurCommunity")}</h3>
              <p>{t("FormationDetails.connectWithOthers")}</p>
              <button className="join-button">
                {t("FormationDetails.JoinNow")}
              </button>
            </div>

            <div className="instructor-card">
              <h3>{t("FormationDetails.AbouttheInstructor")}</h3>
              <div className="instructor-info">
                <GetProfilePicture data={data} className="" />
                <div>
                  <h4>
                    {data.lastName} {data.name}
                  </h4>
                  <p>{data.bio}</p>
                </div>
              </div>
            </div>
          </aside>
        </main>
        {showCongratulations && (
          <CongratulationsModal
            onClose={() => setShowCongratulations(false)}
          />
        )}
      </div>
    </>
  );
};

export default FormationDetails;
