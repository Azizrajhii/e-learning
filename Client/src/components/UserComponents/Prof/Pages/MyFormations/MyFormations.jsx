import React, { useEffect, useState } from "react";
import "./MyFormations.scss";
import { FiPlus } from "react-icons/fi";
import FormationCard from "../../Components/FormationCard/FormationCard";
import { Link } from "react-router-dom";
import axios from "axios";
import unavailableFile from "./../../../images/unavailableFile.png";

function MyFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/formations/MyFormations",
          headers
        ); // Adjust this endpoint if needed
        setFormations(response.data);
      } catch (err) {
        console.error("Error fetching formations:", err);
        setError("Failed to load formations.");
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  return (
    <div className="my-formations">
      <header className="my-formations__header">
        <div className="my-formations__title-container">
          <h1 className="my-formations__title">My Formations</h1>
          <p className="my-formations__subtitle">
            Manage your training programs
          </p>
        </div>
        <Link to="/SkillShareHub/ProfSpace/MyFormations/CreateNew">
          <button className="my-formations__cta">
            <FiPlus className="icon" />
            Create Formation
          </button>
        </Link>
      </header>

      <div className="my-formations__content">
        {loading && <p>Loading formations...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && formations.length === 0 && (
          <div className="FormationPage-empty-state-container">
            <img
              src={unavailableFile}
              alt="No formations available"
              className="FormationPage-empty-state-image"
            />
            <h2 className="FormationPage-empty-state-title">
              No Formations Available
            </h2>
            <span>
              <p className="FormationPage-empty-state-message">
                You don’t have any formations yet.
              </p>
              <p className="FormationPage-empty-state-message">
                Start by creating your firstformation to get started!
              </p>
            </span>
          </div>
        )}

        {formations.map((formation) => {
          if (!formation || typeof formation !== "object") {
            console.error("Invalid formation data:", formation);
            return null; // or render an error message
          }
          return <FormationCard key={formation._id} formation={formation} />;
        })}
      </div>
    </div>
  );
}

export default MyFormations;
