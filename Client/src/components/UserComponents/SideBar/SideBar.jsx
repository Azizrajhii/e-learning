import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./SideBar.css";

// Import des images
import logo from "./../images/LS.png";
import QandA from "./../images/QandA.png";
import Puzzle from "./../images/puzzle.png";
import home from "./../images/home.png";
import formation from "./../images/formation.png";
import trainer from "./../images/trainer.png";
import settings from "./../images/settings.png";
import calendarIcon from "./../images/calendarIcon.png";

const SideBar = () => {
  const { t, i18n } = useTranslation();
  const [showTrainerSpace, setShowTrainerSpace] = useState(true);

  // Récupération de la langue au démarrage
  useEffect(() => {
    const savedLangCode = localStorage.getItem("app-language-code") || "en";
    i18n.changeLanguage(savedLangCode);
  }, [i18n]);

  return (
    <div className="p-0">
      <div className="sidebar">
        <div className="Logo">
          <img src={logo} alt="HR Logo" />
          <div className="Sopra-Name">
            <span className="Sopra-Name1">Sopra hr</span>
            <span className="Sopra-Name2">SOFTWARE</span>
          </div>
        </div>

        <ul className="ul">
          <li className="li">
          <Link to="/SkillShareHub/">
          <span className="icon">
                <img src={home} className="img_icon_s" alt="Home Icon" />
              </span>
              <span className="text">{t("sidebar.home")}</span>
            </Link>
          </li>

          <li className="li">
            <Link to="/SkillShareHub/puzzle">
              <span className="icon">
                <img src={Puzzle} className="img_icon_s" alt="Puzzle Icon" />
              </span>
              <span className="text">{t("sidebar.puzzle")}</span>
            </Link>
          </li>

          <li className="li">
            <Link to="/SkillShareHub/FAQ">
              <span className="icon">
                <img src={QandA} className="img_icon_s" alt="FAQ Icon" />
              </span>
              <span className="text">{t("sidebar.qa")}</span>
            </Link>
          </li>

          <li className="li">
            <Link to="/SkillShareHub/Calendar">
              <span className="icon">
                <img src={calendarIcon} className="img_icon_s" alt="Calendar Icon" />
              </span>
              <span className="text">{t("sidebar.calendar")}</span>
            </Link>
          </li>

          <li className="li">
            <Link to="/SkillShareHub/Formations">
              <span className="icon">
                <img src={formation} className="img_icon_s" alt="Formation Icon" />
              </span>
              <span className="text">{t("sidebar.formation")}</span>
            </Link>
          </li>

          {showTrainerSpace && (
            <li className="li">
              <Link to="/SkillShareHub/ProfSpace">
                <span className="icon">
                  <img src={trainer} className="img_icon_s" alt="Trainer Icon" />
                </span>
                <span className="text">{t("sidebar.trainer")}</span>
              </Link>
            </li>
          )}

          <li className="li">
            <Link to="/SkillShareHub/Settings">
              <span className="icon">
                <img src={settings} className="img_icon_s" alt="Settings Icon" />
              </span>
              <span className="text">{t("sidebar.settings")}</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
