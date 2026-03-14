import { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import SideBar from "./SideBar/SideBar.jsx";
import AppBar from "./AppBar/AppBar.jsx";
import Home from "./Home/Home.jsx";
import Formation from "./Formation/Formation.jsx";
import Settings from "./Settings/Settings.jsx";
import Profile from "./Profile/Profile.jsx";
import FormationDetails from "./Formation/FormationDetails.jsx";
import Lesson from "./Formation/Lesson.jsx";
import ProfSpace from "./Prof/Pages/ProfSpaceHome/ProfSpaceHome.jsx";
import MyFormations from "./Prof/Pages/MyFormations/MyFormations.jsx";
import MyFormationsDetails from "./Prof/Pages/MyFormationsDetails/MyFormationsDetails.jsx";
import EditFormation from "./Prof/Pages/EditFormation/EditFormation.jsx";
import CreateFormation from "./Prof/Pages/EditFormation/EditFormation.jsx";
import EditLesson from "./Prof/Pages/EditLesson/EditLesson.jsx";
import CreateLesson from "./Prof/Pages/CreateLesson/CreateLesson.jsx";
import SearchResults from "./SearchResults/SearchResults.jsx";
import BackgroundMusic from "./BackgroundMusic/BackgroundMusic.jsx";
import ProfViewProgress from "./Prof/Pages/ViewProgress/ViewProgress.jsx";
import CertificateViewer from "./CertificateViewer/CertificateViewer.jsx";
import FAQ from "./FAQ/FAQ.jsx";
import ArticlePage from "./FAQ/ArticlePage.jsx";
import SavedPage from "./FAQ/savedPage.jsx";
import Calendar from "./Calendar/Calendar.jsx";
import ChatBox from "./ChatBox/ChatBox.jsx";
import Quiz from "./quiz/quiz.jsx";
import logo from "./images/LS.png";
import Puzzle from "./puzzle/puzzle.jsx";
import Puzzlebylesson from "./puzzle/puzzlebylesson.jsx";
import "./UserApp.css";
import "./i18n";

const UserApp = () => {
  const location = useLocation();
  const hasAppBar = location.pathname !== "/SkillShareHub/Settings";

  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme-mode") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const LoadingScreen = () => (
    <div className={`loading-screen ${!isLoading ? "fade-out" : ""}`}>
      <img src={logo} alt="Logo" className="rotating-logo" />
      <div className="text-">
        <span className="sopra-hr">Sopra hr</span>
        <span className="software">SOFTWARE</span>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <BackgroundMusic />
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          {hasAppBar && <AppBar className="appbar" />}
          <SideBar className="sidebar" />
          <div className={`content ${hasAppBar ? "content-app" : ""}`}>
            <ChatBox />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Formations" element={<Formation />} />
              <Route path="/Settings" element={<Settings />} />
              <Route path="/Profile/:id" element={<Profile />} />
              <Route path="/CertificateViewer/:certificateId" element={<CertificateViewer />} />
              <Route path="/ProfSpace" element={<ProfSpace />} />
              <Route path="/ProfSpace/MyFormations" element={<MyFormations />} />
              <Route path="/ProfSpace/MyFormations/Details/:FormationId" element={<MyFormationsDetails />} />
              <Route path="/ProfSpace/MyFormations/Details/:FormationId/edit" element={<EditFormation />} />
              <Route path="/ProfSpace/MyFormations/:FormationId/EditLesson/:LessonId" element={<EditLesson />} />
              <Route path="/ProfSpace/MyFormations/CreateNew" element={<CreateFormation />} />
              <Route path="/ProfSpace/MyFormations/:FormationId/CreateLesson" element={<CreateLesson />} />
              <Route path="/ProfSpace/MyFormations/Progress" element={<ProfViewProgress />} />
              <Route path="/Formation/:FormationId" element={<FormationDetails />} />
              <Route path="/Formation/:FormationId/Lesson/:LessonId" element={<Lesson />} />
              <Route path="/search-results" element={<SearchResults />} />
              <Route path="/FAQ" element={<FAQ />} />
              <Route path="/Article/:id" element={<ArticlePage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/Calendar" element={<Calendar />} />
              <Route path="*" element={<div>Section non trouvée</div>} />
              <Route path="/Quiz" element={<Quiz />} />
                <Route path="/Puzzle" element={<Puzzle />} />
              <Route path="questionnaires/:name" element={<Puzzlebylesson />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
};

export default UserApp;
