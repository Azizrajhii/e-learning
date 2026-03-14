import "./ViewProgress.scss";
import { Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import GetProfilePicture from "./../../../utils/GetProfilePicture.jsx";

const FormationMumbres = ({ FormationId }) => {
  const [FormationMumbres, setFormationMumbres] = useState([]);

  const fetchMembres = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/formations/fetchMembres/${FormationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setFormationMumbres(response.data);
    } catch (error) {
      console.error("Erreur de chargement des formations");
    }
  };

  useEffect(() => {
    fetchMembres();
  }, [FormationId]);

  return (
    <div className="ViewProgress-members">
      {FormationMumbres.slice(0, 20).map((member, idx) => (
        <div key={idx} className="ViewProgress-member">
          <div className="ViewProgress-avatarWrapper">
            <GetProfilePicture data={member?.userId?.profile} className="" />
            <div className="ViewProgress-tooltip">
              {member?.userId?.profile?.lastName} {member?.userId?.profile?.name} 
            </div>
          </div>
        </div>
      ))}
      {FormationMumbres.length > 20 && (
        <div className="ViewProgress-number-more">
          +{FormationMumbres.length - 20}
        </div>
      )}
    </div>
  );
};

function ViewProgress() {
  const [myFormations, setMyFormations] = useState([]);
  const FALLBACK_COVER = "https://via.placeholder.com/64x64?text=Course";

  const getCompletion = (formation) => {
    const enrolled = formation?.enrolledSeats?.length || 0;
    const maxSeats = Number(formation?.maxSeats) || 0;
    if (!maxSeats) return 0;
    return Math.min(100, Math.round((enrolled / maxSeats) * 100));
  };

  const getStatusLabel = (status) => {
    if (!status) return "Draft";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const fetchMyFormations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/formations/MyFormations",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMyFormations(response.data);
    } catch (error) {
      console.error("Erreur de chargement des formations");
    }
  };

  useEffect(() => {
    fetchMyFormations();
  }, []);
  return (
    <div className="ViewProgress-projects">
      <div className="ViewProgress-header">
        <h2>Formations</h2>
      </div>
      <div className="ViewProgress-table">
        <div className="ViewProgress-tableHeader">
          <span>Formations</span>
          <span>Members</span>
          <span>Completion</span>
          <span style={{ margin: "0 auto" }}>Status</span>
        </div>
        {myFormations.map((project) => (
          <Link
            to={`/SkillShareHub/ProfSpace/MyFormations/Details/${project._id}`}
            key={project._id}
            className="ViewProgress-link"
          >
            <div className="ViewProgress-row">
              <div className="ViewProgress-company">
                <img
                  src={project.coverImage || FALLBACK_COVER}
                  alt={project.title || "Formation"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_COVER;
                  }}
                />
                <span>{project.title || "Untitled formation"}</span>
              </div>
              <FormationMumbres FormationId={project._id} />
              <div className="ViewProgress-progress">
                <div className="ViewProgress-progressBar">
                  <div
                    className="ViewProgress-progressFill"
                    style={{
                      width: `${getCompletion(project)}%`,
                      backgroundColor: getCompletion(project) === 100 ? "#4caf50" : "#1e88e5",
                    }}
                  />
                </div>
                <span className="ViewProgress-progressText">{getCompletion(project)}%</span>
              </div>
              <div className="ViewProgress-Status">
                <span className={`ViewProgress-statusBadge ViewProgress-status-${project.status || "draft"}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {myFormations.length === 0 && (
          <div className="ViewProgress-row">
            <div className="ViewProgress-company">
              <span>No formations found.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewProgress;
