import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import LessonIcon from "./../images/LessonIcon.png";
import MessageIcon from "./../images/MessageIcon.png";
import FollowIcon from "./../images/FollowIcon.png";
import "./Lesson.css";
import "./LessonInfo.css";
import "./LessonCours.css";
import "./LessonExam.css";
import "./LessonUsersCommentaires.css";
import "./user-popup.css";
import axios from "axios";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import StarIcon from "@mui/icons-material/Star";
import PaperSend from "./../images/PaperSend.png";
import screenfull from "screenfull";
import Error from "./../images/Error!.png";
import whistle from "./../images/whistle.png";
import pdpImage from "./../images/pdp.jpg";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { dropPlugin } from "@react-pdf-viewer/drop";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearchPlus,
  FaSearchMinus,
  FaExpand,
  FaDownload,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { FaHeart, FaEnvelope, FaUserFriends } from "react-icons/fa";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/drop/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";

const labels = {
  0.5: "Very Poor 😞",
  1: "Poor 😕",
  1.5: "Needs Improvement 😐",
  2: "Not Bad 🙂",
  2.5: "Okay 🤔",
  3: "Good 🙂",
  3.5: "Nice 😊",
  4: "Very Good 😀",
  4.5: "Excellent 🤩",
  5: "Outstanding! 🚀",
};

const LessonInfo = ({ title, formationId, createdAt }) => {
  const { LessonId } = useParams();
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(-1);
  const [comment, setComment] = useState("");
  const [trainerProfile, setTrainerProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const token = localStorage.getItem("token");
  console.log(token);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleRatingSubmit = async () => {
    if (!token || ratingSubmitted) {
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/lessons/Rating/${LessonId}`,
        { rating: ratingValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setRatingSubmitted(true);
    } catch (err) {
      console.error("Error submitting rating", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token || !comment.trim()) {
      console.error("Authentication or empty comment");
      return;
    }
    console.log(LessonId);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/lessons/Comment/${LessonId}`,
        { comment: comment.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      setComment("");
      // Optionally refresh comments or update state with new comment
      console.log("Comment submitted:", response.data);
      
    } catch (err) {
      console.error("Error submitting comment", err);
      if (err.response) {
        console.error("Server response:", err.response.data);
      }
    }
  };

  useEffect(() => {
    const fetchTrainerProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/lessons/trainerProfile/${LessonId}`
        );
        setTrainerProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Une erreur s'est produite");
        setLoading(false);
      }
    };

    const fetchUserRating = async () => {
      if (!token) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/lessons/userRating/${LessonId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data) {
          setRatingValue(res.data.rating || 0);
          setComment(res.data.comment || "");
          if (res.data.rating) {
            setRatingSubmitted(true);
          }
        }
      } catch (err) {
        console.warn("Aucune évaluation trouvée ou erreur.");
      }
    };

    fetchTrainerProfile();
    fetchUserRating();
  }, [LessonId, token]);

  useEffect(() => {
    if (ratingValue > 0 && !ratingSubmitted) {
      const timer = setTimeout(() => {
        handleRatingSubmit();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [ratingValue]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="Cours-information-container">
      <div className="Cours-details">
        <div className="Cours-details-image">
          <img src={LessonIcon} alt="Lesson Icon" />
        </div>
        <div className="Cours-details-infos">
          <h2>{title}</h2>
          <span>
            {trainerProfile?.lastName || ""} {trainerProfile?.name || ""}
            &nbsp; &nbsp;
            {formatDate(createdAt)}
          </span>
        </div>
      </div>

      <div className="Cours-details-rating">
        <h2>Rate this course</h2>
        <div className="rating-span-container">
          <span className="rating-span">
            {ratingSubmitted
              ? "Thank you for your rating!"
              : "How would you rate this course?"}
          </span>
        </div>
        <Rating
          name="hover-feedback"
          value={ratingValue}
          size="large"
          precision={0.5}
          getLabelText={getLabelText}
          onChange={(event, newValue) => {
            if (!ratingSubmitted) {
              setRatingValue(newValue);
            }
          }}
          onChangeActive={(event, newHover) => {
            if (!ratingSubmitted) {
              setRatingHover(newHover);
            }
          }}
          emptyIcon={
            <StarIcon
              style={{
                opacity: ratingSubmitted ? 0.3 : 0.55,
                fontSize: "30px"
              }}
              fontSize="inherit"
            />
          }
          readOnly={ratingSubmitted}
        />
        <div>
          {ratingValue !== null && (
            <Box sx={{ ml: 2, fontSize: "20px" }}>
              {labels[ratingHover !== -1 ? ratingHover : ratingValue]}
            </Box>
          )}
        </div>
      </div>

      <div className="Cours-details-message">
        <h2>Write a comment</h2>
        <form onSubmit={handleCommentSubmit}>
          <input
            type="text"
            placeholder="Write your comment..."
            value={comment}
            onChange={handleCommentChange}
          />
          <button
            type="submit"
            disabled={!comment.trim()}
          >
            <img src={PaperSend} alt="Send" />
          </button>
        </form>
      </div>
    </div>
  );
};

const LessonCours = ({ lessonContent }) => {
  const zoomPluginInstance = zoomPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const dropPluginInstance = dropPlugin();

  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;
  const {
    CurrentPageLabel,
    GoToNextPageButton,
    GoToPreviousPageButton,
    jumpToPage,
  } = pageNavigationPluginInstance;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageNumberInput, setPageNumberInput] = useState("");
  const [pdfError, setPdfError] = useState("");

  const handleGoToPage = (pageNumber) => {
    if (!isNaN(pageNumber) && pageNumber > 0) {
      jumpToPage(pageNumber - 1);
    }
  };

  const handleFullscreen = () => {
    if (screenfull.isEnabled) {
      const pdfContainer = document.querySelector(".cours-pdf-container");
      if (pdfContainer) {
        screenfull.toggle(pdfContainer);
        setIsFullscreen(!isFullscreen);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(screenfull.isFullscreen);
    };

    if (screenfull.isEnabled) {
      screenfull.on("change", handleFullscreenChange);
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off("change", handleFullscreenChange);
      }
    };
  }, []);

  const isPdf = lessonContent?.type === "pdf";
  const isVideo = lessonContent?.type === "video";
  const resolvedContentUrl = (() => {
    const originalUrl = lessonContent?.url;

    if (!originalUrl) return "";

    try {
      const parsedUrl = new URL(originalUrl);
      if (parsedUrl.pathname.startsWith("/static/")) {
        return parsedUrl.pathname;
      }
      return originalUrl;
    } catch {
      return originalUrl;
    }
  })();

  return (
    <div className={`cours-pdf-container ${isFullscreen ? "fullscreen" : ""}`}>
      <div className="toolbar">
        {isPdf ? (
          <>
            <GoToPreviousPageButton>
              {({ onClick }) => (
                <button className="toolbar-button" onClick={onClick}>
                  <FaChevronLeft />
                </button>
              )}
            </GoToPreviousPageButton>

            <GoToNextPageButton>
              {({ onClick }) => (
                <button className="toolbar-button" onClick={onClick}>
                  <FaChevronRight />
                </button>
              )}
            </GoToNextPageButton>

            <div className="page-label">
              Page <CurrentPageLabel />
            </div>

            <div className="container-page-input">
              <input
                type="number"
                value={pageNumberInput}
                onChange={(e) => {
                  setPageNumberInput(e.target.value);
                  handleGoToPage(parseInt(e.target.value, 10));
                }}
                className="page-input"
                placeholder="Aller à la page..."
                min="1"
              />
            </div>
          </>
        ) : (
          <div className="page-label">{isVideo ? "Video Lesson" : "Lesson Content"}</div>
        )}

        <div className="bouttons-zoom-in-out-fullScreen">
          {isPdf && (
            <>
              <ZoomOutButton>
                {({ onClick }) => (
                  <button className="toolbar-button" onClick={onClick}>
                    <FaSearchMinus />
                  </button>
                )}
              </ZoomOutButton>

              <ZoomInButton>
                {({ onClick }) => (
                  <button className="toolbar-button" onClick={onClick}>
                    <FaSearchPlus />
                  </button>
                )}
              </ZoomInButton>
            </>
          )}

          <button className="toolbar-button" type="button" onClick={handleFullscreen}>
            <FaExpand />
          </button>

          <a
            href={resolvedContentUrl}
            target="_blank"
            rel="noreferrer"
            download={isPdf ? "python_lesson.pdf" : undefined}
            className="toolbar-button"
          >
            <FaDownload />
          </a>
        </div>
      </div>

      <div className="pdf-viewer-container">
        {isPdf ? (
          <Worker workerUrl={pdfWorkerUrl}>
            <Viewer
              fileUrl={resolvedContentUrl}
              defaultScale={SpecialZoomLevel.PageWidth}
              plugins={[
                zoomPluginInstance,
                pageNavigationPluginInstance,
                dropPluginInstance,
              ]}
              renderError={() => (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <p>Impossible d'afficher le PDF dans la page.</p>
                  <a href={resolvedContentUrl} target="_blank" rel="noreferrer">
                    Ouvrir le PDF dans un nouvel onglet
                  </a>
                </div>
              )}
            />
          </Worker>
        ) : isVideo ? (
          <iframe
            src={resolvedContentUrl}
            title="Lesson Video"
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            Impossible d'afficher ce contenu.
          </div>
        )}
      </div>
    </div>
  );
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

const LessonExam = () => {
  const { LessonId } = useParams();
  const { FormationId } = useParams();

  return (
    <div className="exam-card">
      <div className="exam-content">
        <div className="exam-header">
          <div className="exam-badge">Ready for Exam</div>
        </div>
        <h3 className="exam-title">Course mastered? Prove it!</h3>
        <p className="exam-description">
          Completing the readings is just the first step. Take the exam to
          demonstrate your expertise and track your progress.
        </p>
        <button className="exam-cta">
          <Link to={`/SkillShareHub/Quiz`} state={{ LessonId: LessonId, FormationId: FormationId }}>
            {" "}
            <span>Start Exam Now</span>{" "}
          </Link>
          <img src={whistle} alt="Whistle" className="Exam-button-icon" />
        </button>
      </div>
      <div className="exam-decoration">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
    </div>
  );
};

const Commentaires = ({ lessonId, newCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullComment, setShowFullComment] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const hoverTimeout = useRef(null);
  const popupRef = useRef(null);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/lessons/comments/${lessonId}`
      );
      setComments(response.data);
      
      const initialShowState = response.data.slice(0, 4).reduce(
        (acc, _, index) => ({
          ...acc,
          [index]: false,
        }),
        {}
      );
      setShowFullComment(initialShowState);
      
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load comments");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [lessonId, newCommentAdded]); // Ajout de newCommentAdded comme dépendance

  const handleMouseEnter = (user, event) => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }

    hoverTimeout.current = setTimeout(() => {
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      setPopupPosition({
        top: mouseY + window.scrollY - 10,
        left: mouseX + window.scrollX - 10,
      });

      setSelectedUser(user);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setSelectedUser(null);
  };

  const toggleComment = (index) => {
    setShowFullComment((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>Error: {error}</div>;
  if (comments.length === 0) return <div>No comments yet</div>;

  return (
    <div className="Lesson-users-commentaires-container">
      {comments.slice(0, 4).map((comment, index) => (
        <div key={index} className="Lesson-users-commentaire-container">
          <div className="commentaire-home-user_info">
            <div
              className="commentaire-home-user_info-pdp-name"
              onMouseEnter={(e) => handleMouseEnter(comment, e)}
              onMouseLeave={handleMouseLeave}
            >
              <img src={comment.user?.profilePicture || pdpImage} alt="Profil" />
              <p>{comment.user?.name || "Anonymous"}</p>
            </div>

            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="commentaire-home-content">
            <p>
              {showFullComment[index]
                ? comment.content
                : comment.content.length > 115
                ? comment.content.slice(0, 115) + "..."
                : comment.content}
            </p>
            {comment.content.length > 115 && (
              <button
                onClick={() => toggleComment(index)}
                className="show-more-button"
              >
                {showFullComment[index] ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            )}
          </div>
        </div>
      ))}

      {selectedUser && (
        <div
          className="custom-popup-container"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
          }}
          ref={popupRef}
          onMouseEnter={() => setSelectedUser(selectedUser)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="custom-popup-content">
            <div className="custom-popup-content-pdp-name">
              <img
                src={selectedUser.user?.profilePicture || pdpImage}
                alt="Profil"
                className="custom-popup-profile-img"
              />
              <div>
                <h3 className="custom-popup-name">{selectedUser.user?.name || "Anonymous"}</h3>
                <span>Member</span>
              </div>
            </div>
            <div className="custom-popup-content-buttons">
              <button>
                <FaHeart size={34} className="custom-popup-content-button" />
              </button>
              <button>
                <FaEnvelope size={34} className="custom-popup-content-button" />
              </button>
              <button>
                <FaUserFriends
                  size={34}
                  className="custom-popup-content-button"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Lesson = () => {
  const { LessonId } = useParams();
  const [lesson, setLesson] = useState([]);
  const [commentAdded, setCommentAdded] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/lessons/Files/${LessonId}`)
      .then((response) => {
        setLesson(response.data);
      })
      .catch((error) => {
        console.error("Error fetching lessons:", error);
      });
  }, [LessonId]);

  if (!lesson || !lesson.title || !lesson?.content) {
    return (
      <>
        <div className="Lesson-not-found">
          <img src={Error} alt="" />
          <h2>Oops! Lesson Not Found</h2>
          <p>
            We couldn't find the lesson you're looking for. Please check the URL
            or go back to the homepage.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="Cours-container">
        <LessonCours lessonContent={lesson?.content} />
        <div className="MessageAndExam">
          <LessonInfo {...lesson} onCommentAdded={() => setCommentAdded(!commentAdded)} />
          <LessonExam />
        </div>
        <Commentaires lessonId={LessonId} newCommentAdded={commentAdded} />
      </div>
    </>
  );
};

export default Lesson;