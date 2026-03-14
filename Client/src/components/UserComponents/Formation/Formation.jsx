import { Link } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";
import "./Formation.css";
import UserIcon from "../images/UserIcon.png";
import { useState, useEffect } from "react";
import axios from "axios";
import useFetchTrainer from "./../utils/useFetchTrainer.jsx";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";
import unavailableFile from "./../images/unavailableFile.png";

const Card = ({ formation }) => {
  const [showModal, setShowModal] = useState(false);

  const getSituationColor = (status) => {
    switch (status) {
      case "upcoming":
        return "blue";
      case "ongoing":
        return "green";
      case "completed":
        return "red";
      case "cancelled":
        return "purple";
      default:
        return "black";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const HeaderColor =
    formation.title === "php"
      ? "red"
      : formation.title === "Python"
      ? "rgb(195, 0, 255)"
      : formation.title === "Html"
      ? "rgb(158, 117, 41)"
      : formation.title === "Java"
      ? "orange"
      : "black";

  const { data, loading, error } = useFetchTrainer(formation.InstructorId);

  const handleClick = (e) => {
    if (formation.enrolledSeats === formation.maxSeats) {
      e.preventDefault();
      setShowModal(true); // Afficher le modal si le nombre de places est atteint
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Link
        to={`/SkillShareHub/Formation/${formation._id}`}
        onClick={handleClick}
      >
        <Box className="Formation-card-container">
          <Box
            className="Formation-card-header"
            style={{ background: HeaderColor }}
          >
            <img src={formation.coverImage} alt={formation.title} />
          </Box>
          <Box className="Formation-card-content">
            <Box className="Formation-card-Title">
              <p>{formation.title}</p>
              <Box className="Formation-card-Places">
                <img src={UserIcon} alt="User Icon" />
                <span>
                  {formation?.enrolledSeats?.length} / {formation.maxSeats}
                </span>
              </Box>
            </Box>
            <Box className="Formation-card-category">
              <span style={{ color: "#4361ee" }}>{formation.category}</span>
            </Box>
            <Box className="Formation-card-Sub-Title">
              <span>{formation.description}</span>
              <p>Published {formatDate(formation.createdAt)}</p>
            </Box>
            <Box className="Formation-card-Footer">
              <Box className="Formation-card-Formateur">
                <GetProfilePicture data={data} className="" />
                <span className="Formateur-name">{data.lastName}</span>
              </Box>
              <Box
                className="Formation-card-Tag"
                style={{ background: getSituationColor(formation.status) }}
              >
                {formation.status}
              </Box>
            </Box>
          </Box>
        </Box>
      </Link>
      {showModal && <CourseFullModal closeModal={closeModal} />}
    </>
  );
};

const CourseFullModal = ({ closeModal }) => {
  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="image-container">
            <img
              src={unavailableFile}
              alt="Course Full"
              className="modal-image"
            />
          </div>
          <h2 className="modal-title">Course Full</h2>
          <p className="modal-message">
            Unfortunately, there are no more available seats for this course.
          </p>
          <button className="close-button" onClick={closeModal}>
            Close
          </button>
        </div>
      </div>
    </>
  );
};

const Formation = () => {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const isMediumScreen = useMediaQuery("(max-width: 1024px)");
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const fetchFormations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/formations/GetAllFormations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setFormations(response.data);
    } catch (error) {
      setError("Erreur de chargement des formations");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFormations();
  }, []);

  return (
    <Box
      sx={{
        padding: isSmallScreen
          ? "10px"
          : isMediumScreen
          ? "20px 50px"
          : "15px 25px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "20px",
        alignItems : formations.length == 0 && "center",
                height : formations.length == 0 && "90%"

      }}
    >
      {formations.length == 0 ? (
        <div className="FormationPage-empty-state-container">
          <img 
            src={unavailableFile} 
            alt="No formations available"
            className="FormationPage-empty-state-image"
          />
          <h2 className="FormationPage-empty-state-title">No Formations Available</h2>
          <p className="FormationPage-empty-state-message">
            Currently there are no formations to display.
          </p>
        </div>
      ) : (
        <>
          {formations.map((formation, index) => (
            <Card key={index} formation={formation} />
          ))}
        </>
      )}
    </Box>
  );
};

export default Formation;
