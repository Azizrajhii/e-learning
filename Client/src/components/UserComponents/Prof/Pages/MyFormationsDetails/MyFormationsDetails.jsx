import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaPlus,
  FaChevronRight,
  FaTimes
} from "react-icons/fa";
import axios from "axios";
import "./MyFormationsDetails.scss";

const MyFormationLessonCard = ({ lesson, index, onEdit, onDelete }) => {
  const averageRating = lesson.rating ? 
    (lesson.rating.length > 0
      ? lesson.rating.reduce((sum, r) => sum + r.value, 0) / lesson.rating.length
      : 0)
    : 0;

  return (
    <div className={`lesson-card ${lesson.status?.toLowerCase() || 'draft'}`}>
      <div className="lesson-card__header">
        <div className="lesson-number">{index + 1}</div>
        <div className="lesson-content">
          <h3>{lesson.title}</h3>
          <div className="lesson-meta">
            <span className="duration">{lesson.duration || 0} hours</span>
            <span className="rating">
              {lesson.rating && lesson.rating.length > 0 ? (
                <>
                  {averageRating.toFixed(1)} <FaStar className="star" /> (
                  {lesson.rating.length} reviews)
                </>
              ) : (
                "No reviews yet"
              )}
            </span>
          </div>
          <p className="lesson-description">{lesson.description}</p>
        </div>
      </div>
      <div className="lesson-actions">
        <span className={`status-badge ${lesson.status?.toLowerCase() || 'draft'}`}>
          {lesson.status || 'Draft'}
        </span>
        <button className="btn-icon edit" onClick={() => onEdit(lesson._id)}>
          <FaEdit />
        </button>
        <button
          className="btn-icon delete"
          onClick={() => onDelete(lesson)}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ lesson, onClose, onConfirm }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (error) setError("");
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setError("Pasting is not allowed. Please type the lesson name manually.");
    return false;
  };

  const handleConfirm = () => {
    if (inputValue !== lesson.title) {
      setError("The entered text doesn't match the lesson name.");
      return;
    }
    onConfirm();
  };

  return (
    <div className="MyFormation-Delete-modal-overlay">
      <div className="delete-confirmation-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <h3>Delete Lesson</h3>
        <p>
          Are you sure you want to delete the lesson <strong>"{lesson.title}"</strong>?
          This action cannot be undone.
        </p>
        <p>
          To confirm, please type <strong>"{lesson.title}"</strong> below:
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onPaste={handlePaste}
          placeholder="Type the lesson name to confirm"
          className="confirmation-input"
        />
        {error && <p className="error-message">{error}</p>}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={inputValue !== lesson.title}
          >
            Delete Lesson
          </button>
        </div>
      </div>
    </div>
  );
};

function MyFormationsDetails() {
  const { FormationId } = useParams();
  const navigate = useNavigate();
  const [formation, setFormation] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme-mode") || "light"
  );
  const [lessonToDelete, setLessonToDelete] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const fetchFormation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/formations/${FormationId}`);
      setFormation(response.data);

      // Fetch lessons for this formation
      if (response.data) {
        fetchLessons();
      }
    } catch (err) {
      console.error("Error loading formation", err);
      setError("Failed to load formation data");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/lessons/${FormationId}`
      );
      setLessons(response.data);
      console.log(response.data)
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const handleEditFormation = () => {
    navigate(`/SkillShareHub/ProfSpace/MyFormations/Details/${FormationId}/edit`);
  };

  const handleEditLesson = (lessonId) => {
    navigate(`/SkillShareHub/ProfSpace/MyFormations/${FormationId}/EditLesson/${lessonId}`);
  };

  const handleDeleteClick = (lesson) => {
    setLessonToDelete(lesson);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/lessons/${lessonToDelete._id}`);
      setLessons(lessons.filter((lesson) => lesson._id !== lessonToDelete._id));
      
      const updatedFormation = {
        ...formation,
        lessons: formation.lessons.filter(l => l.lessonId !== lessonToDelete._id)
      };
      setFormation(updatedFormation);
      
      setLessonToDelete(null);
    } catch (err) {
      console.error("Error deleting lesson", err);
      setError("Failed to delete lesson");
    }
  };

  const handleDeleteCancel = () => {
    setLessonToDelete(null);
  };

  const handleAddLesson = () => {
    navigate(`/SkillShareHub/ProfSpace/MyFormations/${FormationId}/CreateLesson`);
  };

  useEffect(() => {
    fetchFormation();
  }, [FormationId]);


  const totalHours = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

  return (
    <div className="formation-details">
      {lessonToDelete && (
        <DeleteConfirmationModal
          lesson={lessonToDelete}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      )}

      <div className="breadcrumb">
        <Link to="/SkillShareHub/ProfSpace/MyFormations">Formations</Link>
        <FaChevronRight className="chevron" />
        <span>{formation?.title}</span>
      </div>

      <div className="formation-header">
        <div className="formation-info">
          <div className="title-wrapper">
            <h1>{formation?.title}</h1>
            <button className="btn-edit" onClick={handleEditFormation}>
              <FaEdit /> Edit Formation
            </button>
          </div>

          <p className="description">{formation?.description}</p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{lessons.length}</div>
              <div className="stat-label">Lessons</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalHours}</div>
              <div className="stat-label">Total Hours</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {formation?.averageRating?.toFixed(1) || 0}
              </div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formation?.enrolledSeats.length || 0}</div>
              <div className="stat-label">Students</div>
            </div>
          </div>
        </div>

        <div className="formation-cover">
          <img 
            src={formation?.coverImage} 
            alt={formation?.title} 
          />
          <div className="formation-status">{formation?.status}</div>
        </div>
      </div>

      <div className="lessons-section">
        <div className="section-header">
          <h2>Lessons</h2>
          <button className="btn-add-lesson" onClick={handleAddLesson}>
            <FaPlus /> Add New Lesson
          </button>
        </div>

        <div className="lessons-list">
          {lessons.length > 0 ? (
            lessons.map((lesson, index) => (
              <MyFormationLessonCard
                key={lesson._id}
                lesson={lesson}
                index={index}
                onEdit={handleEditLesson}
                onDelete={handleDeleteClick}
              />
            ))
          ) : (
            <div className="no-lessons">
              <p>No lessons added yet. Create your first lesson!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyFormationsDetails;
