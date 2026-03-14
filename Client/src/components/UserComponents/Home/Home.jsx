import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Home.css";
import headerImage from "./../images/HomePageImage.png";
import feature1Icon from "./../images/pdp.jpg";
import feature2Icon from "./../images/pdp.jpg";
import feature3Icon from "./../images/pdp.jpg";
import testimonial1 from "./../images/pdp.jpg";
import testimonial2 from "./../images/pdp.jpg";
import testimonial3 from "./../images/pdp.jpg";
import { Link } from "react-router-dom";
import axios from "axios";

function Home() {
  const { t } = useTranslation();

  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    instructors: 0,
  });
  const [theme, setTheme] = useState(
    localStorage.getItem("theme-mode") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    const fetchHomeData = async () => {
      try {
        const statsRes = await axios.get("http://localhost:5000/api/home");
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error fetching home data:", err);
      }
    };

    fetchHomeData();
  }, [theme]);

  return (
    <div className="Home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>{t("Home.title")}</h1>
          <p className="hero-subtitle">{t("Home.subtitle")}</p>
          <div className="hero-buttons">
            <Link to={`/SkillShareHub/Formations`}>
              <button className="primary-button">
                {t("Home.startNow")}
              </button>
            </Link>
            <Link to={`/SkillShareHub/Formations`}>
              <button className="secondary-button">
                {t("Home.exploreCourses")}
              </button>
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.courses}</span>
              <span className="stat-label">{t("Home.availableCourses")}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.students}</span>
              <span className="stat-label">{t("Home.students")}</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.instructors}</span>
              <span className="stat-label">{t("Home.expertInstructors")}</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img src={headerImage} alt={t("Home.heroImageAlt")} />
        </div>
      </section>
    </div>
  );
}

export default Home;