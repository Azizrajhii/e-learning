import { useState, useRef, useEffect, forwardRef } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoNotifications } from "react-icons/io5";
import "./AppBar.css";
import pdp from "./../images/pdp.jpg";
import SearchBar from "./../SearchBar/SearchBar.jsx";
import { FaChevronDown } from "react-icons/fa";
import logout from "./../images/logout.png";
import profile from "./../images/profile.png";
import NotificationList from "./../NotificationList/NotificationList.jsx";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import useFetchUser from "./../utils/useFetchUser.jsx";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";
import { io } from "socket.io-client";
import axios from "axios"; 


const UserMenu = forwardRef(function UserMenu({ Data, onClose }, userMenuRef) {
  const handleProfileClick = () => {
    setTimeout(onClose, 500);
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    setTimeout(onClose, 500);
  };

  return (
    <div ref={userMenuRef} className="sub-menu-wrapper" id="sub-menu-wrapper">
      <div className="sub-menu">
        <div className="sub-menu-info">
          <GetProfilePicture data={Data} className="" />
          <h3>
            {Data.lastName} {Data.name}
          </h3>
        </div>
        <hr />
        <Link
          to={`/SkillShareHub/Profile/${Data._id}`}
          className="sub-menu-link"
          onClick={handleProfileClick}
        >
          <img src={profile} className="img_icon" />
          <p>Profile</p>
          <span>{">"}</span>
        </Link>
        <a href="/" className="sub-menu-link" onClick={handleLogoutClick}>
          <img src={logout} className="img_icon" />
          <p>Log out</p>
          <span>{">"}</span>
        </a>
      </div>
    </div>
  );
});

const AppBar = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationButtonRef = useRef(null);
  const userMenuRef = useRef(null);
  const { data: userData, loading, error } = useFetchUser();
  const [transparentSidebar, setTransparentSidebar] = useState(
    localStorage.getItem("transparent-sidebar") || false
  );

  // Dans AppBar.jsx
useEffect(() => {
  const socket = io("http://localhost:5000", { withCredentials: true });

  const handleNewNotification = (notif) => {
    setNotificationCount(prev => prev + 1);
  };

  socket.on("notification", handleNewNotification);

  // Récupérer le compteur initial
  const fetchInitialCount = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/notifications/unread-count",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error("Error fetching initial notification count", error);
    }
  };

  fetchInitialCount();

  return () => {
    socket.off("notification", handleNewNotification);
    socket.disconnect();
  };
}, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "transparent-sidebar",
      transparentSidebar
    );
  }, [transparentSidebar]);

  const [Data, setData] = useState({
    name: "Guest",
  });

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      setData(userData);
    }
  }, [userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        !event.target.closest(".user")
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const location = useLocation();

  // Hide AppBar on the Settings page
  if (location.pathname === "/Settings") {
    return null;
  }

  return (
    <>
      {showNotifications && (
        <NotificationList
          className="notification-menu"
          onClose={() => setShowNotifications(false)}
          notificationButtonRef={notificationButtonRef}
          setNotificationCount={setNotificationCount}
        />
      )}

      <nav className="app-bar">
        <div className="recherche-bar">
          <SearchBar />
        </div>
        <div className="right-side">
          <button
            ref={notificationButtonRef}
            className="notification"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-expanded={showNotifications}
          >
            {notificationCount > 0 ? (
              <>
                <IoNotifications className="text-4xl" />
                <span className="notification-count">{notificationCount}</span>
              </>
            ) : (
              <IoMdNotificationsOutline className="text-4xl" />
            )}
          </button>

          <div
            className="user rounded-full hover:bg-gray-50"
            onClick={() => setShowUserMenu(!showUserMenu)}
            tabIndex={0}
            role="button"
            aria-expanded={showUserMenu}
          >
            <p className="hhidden">{Data.name}</p>
            <GetProfilePicture data={Data} className="" />
            <span className="user-drop-down">
              <FaChevronDown className="user-drop-down-icon" />
            </span>
          </div>

          {showUserMenu && (
            <UserMenu
              Data={Data}
              onClose={() => setShowUserMenu(false)}
              ref={userMenuRef}
            />
          )}
        </div>
      </nav>
    </>
  );
};

export default AppBar;
