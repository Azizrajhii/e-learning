import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios"; 
import "./NotificationList.css";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

export default function NotificationList({
  onClose,
  notificationButtonRef,
  setNotificationCount,
}) {
  const [notifications, setNotifications] = useState([]);
  const NotifsRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/notifications`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setNotifications(response.data);
        setNotificationCount(
          response.data.filter((notif) => notif.unread).length
        );
      } catch (error) {
        console.error("Erreur lors du chargement des notifications :", error);
      }
    };

    fetchNotifications();
  }, [token]); // ✅ Correction : dépendance correcte

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        NotifsRef.current &&
        !NotifsRef.current.contains(event.target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, notificationButtonRef]);

  useEffect(() => {
    const socket = io("http://localhost:5000", { withCredentials: true });

    const handleNewNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setNotificationCount((prev) => prev + 1);
    };

    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
      socket.disconnect();
    };
  }, [setNotificationCount]);

  const markAllAsRead = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/notifications/mark-all-read`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      setNotificationCount(0);
    } catch (error) {
      console.error(
        "Erreur lors du marquage des notifications comme lues :",
        error
      );
    }
  };

  useEffect(() => {
    const handleNotificationsMarkedAsRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

    socket.on("notificationsMarkedAsRead", handleNotificationsMarkedAsRead);

    return () => {
      socket.off("notificationsMarkedAsRead", handleNotificationsMarkedAsRead);
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      // Si la date est aujourd'hui, on affiche seulement l'heure
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Sinon, on affiche seulement la date
      return date.toLocaleDateString();
    }
  };

  const getSenderProfile = (notification) => {
    const profile = notification?.sender?.profile;

    return {
      name: profile?.name || "Utilisateur",
      lastName: profile?.lastName || "",
      profilePicture: profile?.profilePicture || "",
    };
  };

  return (
    <div className="notification-container" ref={NotifsRef}>
      <div className="notification-header">
        <h2>Notifications</h2>
        <button className="mark-all-read" onClick={markAllAsRead}>
          Marquer tout comme lu
        </button>
      </div>
      <div className="notification-list">
        {notifications.map((notif) => {
          const senderProfile = getSenderProfile(notif);
          const senderName = `${senderProfile.lastName} ${senderProfile.name}`.trim();

          return (
            <div
              key={notif._id || notif.id}
              className={`notification-item ${notif.unread ? "unread" : ""}`}
            >
              <GetProfilePicture
                data={senderProfile}
                className="notification-avatar"
              />
              <div className="notification-content">
                <p className="notification-name">{senderName}</p>
                <p className="notification-message">{notif.message}</p>
              </div>
              <div className="notification-meta">
                <span className="notification-time">
                  {notif.time ? formatDate(notif.time) : ""}
                </span>
                {notif.unread && <span className="notification-dot"></span>}
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <p className="no-notifications">Aucune notification</p>
        )}
      </div>
    </div>
  );
}
