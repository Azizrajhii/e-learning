import { useState, useEffect, useMemo, useCallback } from "react";
import "./TableEvents.scss";
import {
  MdOutlineEdit,
  MdDeleteOutline,
  MdSearch,
  MdClear,
} from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { FaRegSave } from "react-icons/fa";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TableEvents() {
  const [events, setEvents] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedEvent, setEditedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
    color: "#3498db"
  });

  const colorOptions = [
    { value: "#3498db", label: "Blue" },
    { value: "#9f42e1", label: "Purple" },
    { value: "#ff0000", label: "Red" },
    { value: "#2ecc71", label: "Green" },
    { value: "#f39c12", label: "Orange" },
  ];

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewEvent({
      title: "",
      description: "",
      date: new Date(),
      color: "#3498db"
    });
  };

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/events/adminevents");
      const data = await response.json();
      const formattedEvents = data.map(event => ({
        ...event,
        userName: event.global || !event.userName ? "Global" : event.userName
      }));
      setEvents(formattedEvents);
    } catch (error) {
      toast.error("Error fetching events");
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    const term = searchTerm.toLowerCase();
    return events.filter(
      (event) =>
        event.title?.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        (event.userName && event.userName.toLowerCase().includes(term))
    );
  }, [events, searchTerm]);

  const handleEdit = useCallback(
    (index) => {
      setEditIndex(index);
      setEditedEvent({ 
        ...filteredEvents[index],
        date: new Date(filteredEvents[index].date)
      });
    },
    [filteredEvents]
  );

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setEditedEvent((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  }, []);

  const handleDateChange = useCallback((date) => {
    setEditedEvent((prev) => ({ ...prev, date }));
  }, []);

  const handleSave = useCallback(
    async (index) => {
      if (!editedEvent) return;
      try {
        setIsLoading(true);
        const eventId = filteredEvents[index]._id;
        const response = await fetch(`http://localhost:5000/api/events/update-event/${eventId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editedEvent,
            global: editedEvent.global === "true" || editedEvent.global === true
          }),
        });

        const data = await response.json();
        if (response.ok) {
          toast.success("Event updated successfully");
          fetchEvents();
          setEditIndex(null);
        } else {
          throw new Error(data.message || "Failed to update event");
        }
      } catch (error) {
        toast.error(error.message);
        console.error("Update error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [editedEvent, filteredEvents, fetchEvents]
  );

  const handleDelete = useCallback(
    async (index) => {
      if (window.confirm("Are you sure you want to delete this event?")) {
        try {
          setIsLoading(true);
          const eventId = filteredEvents[index]._id;
          const response = await fetch(
            `http://localhost:5000/api/events/delete-event/${eventId}`,
            { method: "DELETE" }
          );
          if (response.ok) {
            toast.success("Event deleted successfully");
            fetchEvents();
          } else {
            throw new Error("Failed to delete event");
          }
        } catch (error) {
          toast.error(error.message);
          console.error("Delete error:", error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [filteredEvents, fetchEvents]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleNewEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewDateChange = (date) => {
    setNewEvent((prev) => ({ ...prev, date }));
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast.warn("Title and date are required");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("http://localhost:5000/api/events/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEvent,
          global: true // Forcer l'événement à être global
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Event created successfully");
        fetchEvents();
        closeAddModal();
      } else {
        throw new Error(data.message || "Failed to create event");
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Create event error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && events.length === 0) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="table-events-wrapper">
      <div className="table-events-additional-table">
        <div className="table-events-header">
          <h3>Event Management</h3>
          <button className="table-events-add-button" onClick={openAddModal}>
            <FaPlus /> Add Event
          </button>
        </div>

        <div className="table-events-search">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, description or user..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search">
              <MdClear />
            </button>
          )}
        </div>

        <div className="table-events-table-container">
          {filteredEvents.length === 0 ? (
            <div className="no-results">No events found</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>User</th>
                  <th>Type</th>
                  <th style={{ width: "140px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event, index) => (
                  <tr key={event._id} className="table-events-row">
                    {editIndex === index ? (
                      <>
                        <td>
                          <input
                            name="title"
                            value={editedEvent?.title || ""}
                            onChange={handleChange}
                            placeholder="Event title"
                          />
                        </td>
                        <td>
                          <input
                            name="description"
                            value={editedEvent?.description || ""}
                            onChange={handleChange}
                            placeholder="Event description"
                          />
                        </td>
                        <td>
                          <DatePicker
                            selected={editedEvent?.date}
                            onChange={handleDateChange}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="date-picker-input"
                          />
                        </td>
                        <td>{event.global ? "Global" : event.userName || "Global"}</td>
                        <td>
                          <select
                            name="global"
                            value={editedEvent?.global ? "true" : "false"}
                            onChange={handleChange}
                          >
                            <option value="false">Personal</option>
                            <option value="true">Global</option>
                          </select>
                        </td>
                        <td>
                          <div className="table-events-action-buttons">
                            <button
                              className="table-events-save-button"
                              onClick={() => handleSave(index)}
                              disabled={isLoading}
                            >
                              <FaRegSave />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{event.title}</td>
                        <td>{event.description || "—"}</td>
                        <td>{new Date(event.date).toLocaleString()}</td>
                        <td>{event.global ? "Admin" : event.userName || "Global"}</td>
                        <td>{event.global ? "Global" : "Personal"}</td>
                      
                        <td>
                          <div className="table-events-action-buttons">
                            <button
                              className="table-events-modify-button"
                              onClick={() => handleEdit(index)}
                              disabled={isLoading}
                            >
                              <MdOutlineEdit />
                            </button>
                            <button
                              className="table-events-delete-button"
                              onClick={() => handleDelete(index)}
                              disabled={isLoading}
                            >
                              <MdDeleteOutline />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="table-events-modal-overlay">
          <div className="table-events-modal-content">
            <div className="table-events-modal-header">
              <h3>Create New Event</h3>
              <button
                className="table-events-modal-close"
                onClick={closeAddModal}
              >
                &times;
              </button>
            </div>

            <div className="table-events-modal-body">
              <div className="table-events-modal-form-group">
                <label>Title*</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleNewEventChange}
                  placeholder="Event title"
                  required
                />
              </div>

              <div className="table-events-modal-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleNewEventChange}
                  placeholder="Event description"
                  rows="3"
                />
              </div>

              <div className="table-events-modal-form-group">
                <label>Date*</label>
                <DatePicker
                  selected={newEvent.date}
                  onChange={handleNewDateChange}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="date-picker-input"
                />
              </div>

              <div className="table-events-modal-form-group">
                <label>Color</label>
                <select
                  name="color"
                  value={newEvent.color}
                  onChange={handleNewEventChange}
                >
                  {colorOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-events-modal-footer">
              <button
                className="table-events-modal-cancel"
                onClick={closeAddModal}
              >
                Cancel
              </button>
              <button
                className="table-events-modal-confirm"
                onClick={handleCreateEvent}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}