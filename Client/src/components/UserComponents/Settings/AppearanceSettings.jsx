import { useEffect, useState } from "react";
import LightMod from "../images/lightMod.png";
import DarkMod from "../images/lightMod.png"; // ✅ Make sure it's the correct dark mode image
import "./AppearanceSettings.css";
import UsFlag from "../images/usFlag.png";
import FrFlag from "../images/frFlag.png";
import { FaChevronDown } from "react-icons/fa";
import { useTranslation } from "react-i18next"; // 🌍 i18n support

const AppearanceSettings = () => {
  const { t, i18n } = useTranslation();

  const getInitialTheme = () => localStorage.getItem("theme-mode") || "light";
  const getInitialSidebarPreference = () =>
    localStorage.getItem("transparent-sidebar") === "true";
  const getInitialLanguage = () =>
    localStorage.getItem("app-language") || "English (US)";
  const getInitialLanguageCode = () =>
    localStorage.getItem("app-language-code") || "en";

  const [transparentSidebar, setTransparentSidebar] = useState(
    getInitialSidebarPreference
  );
  const [selectedMode, setSelectedMode] = useState(getInitialTheme);
  const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage);
  const [selectedFlag, setSelectedFlag] = useState();
  const [showDropdown, setShowDropdown] = useState(false);

  const languages = [
    { name: "English (US)", flag: UsFlag, code: "en" },
    { name: "French (FR)", flag: FrFlag, code: "fr" },
  ];

  // Initialize language on mount
  useEffect(() => {
    const lang = languages.find((l) => l.name === selectedLanguage);
    if (lang) {
      setSelectedFlag(lang.flag);
      i18n.changeLanguage(lang.code);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-transparent-sidebar",
      transparentSidebar
    );
    localStorage.setItem("transparent-sidebar", transparentSidebar);
  }, [transparentSidebar]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", selectedMode);
    localStorage.setItem("theme-mode", selectedMode);
  }, [selectedMode]);

  // Initial setting on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", selectedMode);
    document.documentElement.setAttribute(
      "data-transparent-sidebar",
      transparentSidebar
    );
  }, []);

  const handleLanguageChange = (language) => {
    localStorage.setItem("app-language", language.name);
    localStorage.setItem("app-language-code", language.code);
    i18n.changeLanguage(language.code);
    setSelectedLanguage(language.name);
    setSelectedFlag(language.flag);
    setShowDropdown(false);
  };

  const handleSidebarToggle = () => {
    const newValue = !transparentSidebar;
    setTransparentSidebar(newValue);
  };

  return (
    <>
      <div className="appearance-settings">
        <div className="display-preference">
          <div>
            <p className="title">{t("displayPreference.title")}</p>
            <p className="subtitle">{t("displayPreference.subtitle")}</p>
          </div>
          <div className="block-system">
            <div className="mode-options">
              <div
                className={`mode-option ${
                  selectedMode === "light" ? "selected" : ""
                }`}
                onClick={() => setSelectedMode("light")}
              >
                <img src={LightMod} alt="Light mode" />
              </div>
              <div
                className={`mode-option ${
                  selectedMode === "dark" ? "selected" : ""
                }`}
                onClick={() => setSelectedMode("dark")}
              >
                <img src={DarkMod} alt="Dark mode" />
              </div>
            </div>
            <div className="mode-options-text">
              <p className="mode-options-text-p">
                {t("displayPreference.light")}
              </p>
              <p>{t("displayPreference.dark")}</p>
            </div>
          </div>
        </div>

        <hr />

        <div className="sidebar-toggle">
          <div>
            <p className="title">{t("displayPreference.sidebar.title")}</p>
            <p className="subtitle">
              {t("displayPreference.sidebar.subtitle")}
            </p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={transparentSidebar}
              onChange={handleSidebarToggle}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <hr />

        <div className="language-settings">
          <div className="language-info">
            <p className="title">{t("displayPreference.language.title")}</p>
            <p className="subtitle">
              {t("displayPreference.language.subtitle")}
            </p>
          </div>
          <div
            className={`custom-dropdown ${
              showDropdown ? "custom-dropdown-showed" : ""
            }`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img src={selectedFlag} alt="Selected Flag" className="flag-icon" />
            <span className="custom-dropdown-name">{selectedLanguage}</span>
            <FaChevronDown className="drop-down-icon" />
            <div className={`dropdown-menu ${showDropdown ? "show" : ""}`}>
              {languages.map((language) => (
                <div
                  key={language.name}
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLanguageChange(language);
                  }}
                >
                  <img
                    src={language.flag}
                    alt={`${language.name} Flag`}
                    className="flag-icon"
                  />
                  <span>{language.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppearanceSettings;
