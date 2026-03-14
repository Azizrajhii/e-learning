import "./NavBar.scss";
import { useState, useRef, useEffect } from "react";

export default function NavBar() {
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const profileRef = useRef(null);

  const adminName = "Admin User";
  const adminPdp = "https://i.pravatar.cc/150?img=12";

  const handleClickOutside = (e) => {
    if (profileRef.current && !profileRef.current.contains(e.target)) {
      setShowProfilePanel(false);
    }
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // Rediriger vers login après déconnexion
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="Admin-NavBar">
      <div className="Admin-NavBar__left"></div>

      <div className="Admin-NavBar__right">
        <div className="admin-info" ref={profileRef}>
          <span
            className="admin-name"
            onClick={() => setShowProfilePanel((prev) => !prev)}
          >
            {adminName}
          </span>
          <img
            src={adminPdp}
            alt="Admin Profile"
            className="admin-pdp"
            onClick={() => setShowProfilePanel((prev) => !prev)}
          />

          {showProfilePanel && (
            <div className="profile-panel">
              <button className="logout-btn" onClick={handleLogoutClick}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}