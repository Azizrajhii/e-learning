import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import "./Calendar.css";
import axios from "axios";
import { useTranslation } from "react-i18next";

const Calendar = () => {
  const [weekDays, setWeekDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const token = localStorage.getItem("token");
  const [deleteMessage, setDeleteMessage] = useState("");
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem("theme-mode") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const savedLangCode = localStorage.getItem("app-language-code") || "en";
    i18n.changeLanguage(savedLangCode);
    if(savedLangCode === "fr"){
      setWeekDays(["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"])
    }
  }, [i18n]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    color: "#9f42e1",
  });

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  // Fetching events from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Handle adding a new event
  const handleAddEvent = async () => {
    if (!newEvent.title) return;
    try {
      const res = await axios.post(
        "http://localhost:5000/api/events",
        {
          title: newEvent.title,
          description: newEvent.description,
          color: newEvent.color,
          date: selectedDay,
          global: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setEvents([...events, res.data]);
      setShowAddModal(false);
      setNewEvent({ title: "", description: "", color: "#9f42e1" });
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/events/${eventToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setDeleteMessage(response.data.message || "Événement supprimé.");
      setEvents(events.filter((event) => event._id !== eventToDelete));
      fetchEvents(); // Optionnel si tu veux tout resynchroniser
      setShowDeleteModal(false);
      setDeleteMessage("");
    } catch (error) {
      if (error.response) {
        setDeleteMessage(error.response.data.error || "Erreur inconnue.");
      } else {
        setDeleteMessage("Erreur de connexion au serveur.");
      }
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeleteMessage("");
      }, 3000);
    }
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (!value) {
      // Si vide, on revient au mois actuel
      const today = new Date();
      setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
      return;
    }

    const selectedDate = new Date(value);
    if (!isNaN(selectedDate)) {
      setCurrentDate(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      );
    }
  };

  // Generate calendar grid
  const generateCalendarGrid = () => {
    const grid = [];
    let week = [];

    daysInMonth.forEach((day, index) => {
      week.push(day);
      if ((index + 1) % 7 === 0 || index === daysInMonth.length - 1) {
        grid.push(week);
        week = [];
      }
    });
    return grid;
  };

  return (
    <div className="skillshare-calendar">
      <div className="skillshare-calendar-header">
        <h2 className="skillshare-calendar-title">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <p className="skillshare-calendar-subtitle">{t("calendar.title")}</p>

        <div className="skillshare-month-selector">
          <input
            type="month"
            value={format(currentDate, "yyyy-MM")}
            onChange={handleDateChange}
            className="skillshare-month-input"
          />
        </div>
      </div>

      <div className="skillshare-calendar-grid">
        <div className="skillshare-weekdays">
          {weekDays.map((day) => (
            <div key={day} className="skillshare-weekday">
              {day}
            </div>
          ))}
        </div>

        {generateCalendarGrid().map((week, wi) => (
          <div key={wi} className="skillshare-week">
            {week.map((day) => (
              <div
                key={format(day, "yyyy-MM-dd")} // Using a unique key based on the date
                className={`skillshare-day ${
                  isSameMonth(day, currentDate) ? "" : "skillshare-other-month"
                }`}
                onClick={() => {
                  setSelectedDay(day);
                  setShowAddModal(true);
                }}
              >
                <div className="skillshare-date-number">{format(day, "d")}</div>
                <div className="skillshare-events">
                  {events
                    .filter((event) => isSameDay(event.date, day))
                    .map((event) => (
                      <div
                        key={event.id} // Make sure event.id is unique
                        className="skillshare-event"
                        style={{ backgroundColor: event.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setShowEventDetails(true);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div
          className="skillshare-modal-overlay"
          onKeyDown={(e) => {
            if (e.key === "Enter" && newEvent.title) {
              handleAddEvent();
            }
          }}
          tabIndex={0}
        >
          <div className="skillshare-modal">
            <h3 className="skillshare-modal-title">
              {t("calendar.addEventTitle")}
            </h3>
            <h3 className="skillshare-modal-date">
              {format(selectedDay, "MMMM d, yyyy")}
            </h3>

            <div className="skillshare-group">
              <div className="skillshare-form-group event-name-container">
                <label className="skillshare-form-label">
                  {t("calendar.eventTitle")}
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder={t("calendar.eventTitlePlaceholder")}
                  className="skillshare-form-input"
                  autoFocus
                />
              </div>

              <div className="skillshare-form-group event-color-container">
                <label className="skillshare-form-label">
                  {t("calendar.eventColor")}
                </label>
                <input
                  type="color"
                  value={newEvent.color}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, color: e.target.value })
                  }
                  className="skillshare-color-input"
                />
              </div>
            </div>

            <div className="skillshare-form-group event-description-container">
              <label className="skillshare-form-label">
                {t("calendar.eventDescription")}
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder={t("calendar.eventDescriptionPlaceholder")}
                className="skillshare-form-textarea"
                rows={2}
              />
            </div>

            <div className="skillshare-modal-actions">
              <button
                className="skillshare-cancel-btn"
                onClick={() => {
                  setShowAddModal(false);
                  newEvent.description = "";
                  newEvent.title = "";
                  newEvent.color = "#9f42e1";
                }}
              >
                {t("calendar.cancel")}
              </button>
              <button
                className="skillshare-save-btn"
                onClick={handleAddEvent}
                disabled={!newEvent.title}
              >
                {t("calendar.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="skillshare-modal-overlay">
          <div className="skillshare-modal">
            <h1 className="skillshare-modal-title">{selectedEvent.title}</h1>
            <h3 className="skillshare-modal-text">
              {t("calendar.dateLabel")} :
              <strong> {format(selectedEvent.date, "MMMM d, yyyy")} </strong>
            </h3>

            {selectedEvent.description && (
              <p className="skillshare-modal-text skillshare-modal-description">
                Description:{" "}
                {selectedEvent.description || t("calendar.noDescription")}
              </p>
            )}

            <div className="skillshare-modal-actions">
              <button
                className="skillshare-cancel-btn"
                onClick={() => setShowEventDetails(false)}
              >
                {t("calendar.close")}
              </button>
              <button
                className="skillshare-delete-btn"
                onClick={() => {
                  setEventToDelete(selectedEvent._id);
                  setShowEventDetails(false);
                  setShowDeleteModal(true);
                }}
              >
                {t("calendar.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="skillshare-modal-overlay">
          <div className="skillshare-modal">
            <h3 className="skillshare-modal-title">
              {t("calendar.confirmDeleteTitle")}
            </h3>
            <p className="skillshare-modal-text">
              {t("calendar.confirmDeleteText")}
            </p>

            {deleteMessage && (
              <p className="skillshare-delete-message">{deleteMessage}</p>
            )}

            <div className="skillshare-modal-actions">
              <button
                className="skillshare-cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteMessage("");
                }}
              >
                {t("calendar.cancel")}
              </button>
              <button
                className="skillshare-delete-btn"
                onClick={handleDeleteEvent}
              >
                {t("calendar.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
