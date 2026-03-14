import React from "react";
import "./ProfSpaceHome.scss";
import { FaGraduationCap, FaBookOpen, FaChartLine } from "react-icons/fa";
import { Link } from "react-router-dom";
function Formations() {
  return (
    <>
      <div className="PROF-SPACE-container">
        <div className="PROF-SPACE-header-title">
          <h1>
            PROF SPACE<span>MY FORMATIONS</span>
          </h1>
        </div>
        <div className="PROF-SPACE-formations-intro">
          <div className="hero-text">
            <h3>Elevate Your Professional Journey</h3>
            <p>
              Explore and manage all your professional training programs in one
              place. Track your progress, access materials, and discover new
              learning opportunities tailored to your career path.
            </p>
            <div className="cta-container">
              <Link to="/SkillShareHub/ProfSpace/MyFormations">
                <button className="primary-btn">
                  <FaBookOpen className="btn-icon" />
                  Consult My Formations
                </button>
              </Link>
              <Link to="/SkillShareHub/ProfSpace/MyFormations/Progress">
                <button className="secondary-btn">
                  <FaChartLine className="btn-icon" />
                  View Progress
                </button>
              </Link>
            </div>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h4>Comprehensive Catalog</h4>
              <p>
                Access hundreds of courses across multiple disciplines and skill
                levels.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h4>Progress Tracking</h4>
              <p>
                Visualize your learning journey with detailed analytics and
                milestones.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>Personalized Recommendations</h4>
              <p>
                Get course suggestions based on your interests and career goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Formations;
