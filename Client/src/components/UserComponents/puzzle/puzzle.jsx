import { Link } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";
import "./Puzzle.css";
import UserIcon from "../images/UserIcon.png";
import { useState, useEffect } from "react";
import axios from "axios";
import useFetchTrainer from "./../utils/useFetchTrainer.jsx";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";
import unavailableFile from "./../images/unavailableFile.png";

const Card = ({ Puzzle }) => {
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
    Puzzle.title === "php"
      ? "red"
      : Puzzle.title === "Python"
      ? "rgb(195, 0, 255)"
      : Puzzle.title === "Html"
      ? "rgb(158, 117, 41)"
      : Puzzle.title === "Java"
      ? "orange"
      : "black";

  const { data, loading, error } = useFetchTrainer(Puzzle.InstructorId);
  
  const handleClick = (e) => {
    if (Puzzle.enrolledSeats === Puzzle.maxSeats) {
      e.preventDefault();
      setShowModal(true); // Afficher le modal si le nombre de places est atteint
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Link to={`/SkillShareHub/questionnaires/${Puzzle.title}`} onClick={handleClick}>
        <Box className="Puzzle-card-container">
          <Box
            className="Puzzle-card-header"
            style={{ background: HeaderColor }}
          >
            <img src={`/src/components/UserComponents/images/${Puzzle.coverImage}`} alt={Puzzle.title} />
          </Box>
          <Box className="Puzzle-card-content">
            <Box className="Puzzle-card-Title">
              <p>{Puzzle.title}</p>
                
                
            </Box>
  
          </Box>
        </Box>
      </Link>
      {showModal && <CourseFullModal closeModal={closeModal} />}
    </>
  );
};



const Puzzle = () => {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const isMediumScreen = useMediaQuery("(max-width: 1024px)");
  const [Puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPuzzles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/Formations/all");
      setPuzzles(response.data);
    } catch (error) {
      setError("Erreur de chargement des Puzzles");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPuzzles();
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
      }}
    >
      {Puzzles.map((Puzzle, index) => (
        <Card key={index} Puzzle={Puzzle} />
      ))}
    </Box>
  );
};

export default Puzzle;
