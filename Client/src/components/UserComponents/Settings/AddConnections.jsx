import { useState, useEffect } from "react";
import "./AddConnections.css";
import { FaLinkedin, FaGithub, FaChevronDown } from "react-icons/fa";
import { IoIosLink } from "react-icons/io";
import { IoAddCircle } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import axios from "axios";

const renderIcon = (iconType) => {
  switch (iconType.toLowerCase()) {
    case "linkedin":
      return <FaLinkedin className="react-icon linkedin" />;
    case "github":
      return <FaGithub className="react-icon github" />;
    case "default":
    default:
      return <IoIosLink className="react-icon link" />;
  }
};

const iconOptions = ["default", "linkedin", "github"];

const DeleteConnectionModal = ({
  isOpen,
  onClose,
  connectionToDelete,
  handleDeleteConnection,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3>Confirm Deletion</h3>
        <p>
          Are you sure you want to delete the connection to{" "}
          {connectionToDelete.platform}?
        </p>

        <div className="DeleteConnectionModal-modal-actions">
          <button
            className="DeleteConnectionModal-cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="DeleteConnectionModal-delete-button"
            onClick={() => {
              handleDeleteConnection(connectionToDelete._id);
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AddConnectionsModal = ({
  isOpen,
  onClose,
  newConnection,
  setNewConnection,
  handleInputChange,
  handleAddConnection,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleIconChange = (iconType) => {
    setNewConnection({ ...newConnection, icon: iconType });
    setShowDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="AddConnectionsModal-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3>Add New Connection</h3>

        <div className="AddConnections-form-group">
          <label htmlFor="Link">Link (unique)</label>
          <input
            type="text"
            id="Link"
            name="Link"
            value={newConnection.Link}
            onChange={handleInputChange}
            placeholder="Ex: yourlink.com"
          />
        </div>

        <div className="AddConnections-form-group">
          <label htmlFor="UserName">UserName</label>
          <input
            type="text"
            id="UserName"
            name="UserName"
            value={newConnection.UserName}
            onChange={handleInputChange}
            placeholder="Ex: Jhon07"
          />
        </div>

        <div className="AddConnections-form-group">
          <label>Icon Type</label>
          <div className="AddConnectionsModal-custom-dropdown-wrapper">
            <div
              className="AddConnectionsModal-custom-dropdown"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <div className="AddConnectionsModal-custom-dropdown-icon-text">
                <div className="AddConnectionsModal-custom-dropdown-icon-preview">
                  {renderIcon(newConnection.icon)}
                </div>
                <span className="AddConnectionsModal-custom-dropdown-text">
                  {newConnection.icon.charAt(0).toUpperCase() +
                    newConnection.icon.slice(1)}
                </span>
              </div>
              <FaChevronDown className="AddConnectionsModal-custom-dropdown-chevron" />
            </div>
            {showDropdown && (
              <div className="AddConnectionsModal-custom-dropdown-menu">
                {iconOptions.map((iconType) => (
                  <div
                    key={iconType}
                    className="AddConnectionsModal-custom-dropdown-item"
                    onClick={() => handleIconChange(iconType)}
                  >
                    <span className="AddConnectionsModal-custom-dropdown-icon">
                      {renderIcon(iconType)}
                    </span>
                    <span className="AddConnectionsModal-custom-dropdown-label">
                      {iconType.charAt(0).toUpperCase() + iconType.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="AddConnectionsModal-form-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleAddConnection}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const AddConnections = () => {
  const [connections, setConnections] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConnection, setNewConnection] = useState({
    Link: "",
    UserName: "",
    icon: "default",
    connected: true,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState(null);

  const fetchConnections = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/ConnectionPlatform/getSocials`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setConnections(res.data.socials);
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  const handleConnect = async (ConnectionId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/ConnectionPlatform/patchSocials/${ConnectionId}/status`,
        {},
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.data;
      fetchConnections();
    } catch (err) {
      console.error("Erreur lors de la mise à jour", err);
    }
  };

  const handleDeleteConnection = async (ConnectionId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/ConnectionPlatform/deleteSocials/${ConnectionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchConnections(); // refresh list
    } catch (err) {
      console.error("Error deleting connection:", err);
    }
  };

  const handleAddConnection = () => {
    if (!newConnection.Link.trim() || !newConnection.UserName.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (connections.some((conn) => conn.Link === newConnection.Link)) {
      alert("A connection with this Link already exists");
      return;
    }

    setConnections([...connections, newConnection]);
    setNewConnection({
      Link: "",
      UserName: "",
      icon: "default",
      connected: false,
    });
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewConnection({ ...newConnection, [name]: value });
  };

  const openDeleteModal = (connection) => {
    setConnectionToDelete(connection);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return (
    <div className="connections-container">
      <div className="connections-grid">
        {connections.map((conn) => (
          <div key={conn._id} className="connection-card">
            <button
              className="connection-card-remove"
              onClick={() => openDeleteModal(conn)}
            >
              <IoMdClose />
            </button>
            <div className="connection-icon-container">
              {renderIcon(conn.icon)}
            </div>
            <div className="connection-name">{conn?.userName}</div>
            <button
              className={`connection-button ${
                conn.connected ? "connected" : ""
              }`}
              onClick={() => handleConnect(conn._id)}
            >
              {conn.connected ? "Connected" : "Connect"}
            </button>
          </div>
        ))}

        <div
          className="connection-card add-card"
          onClick={() => setShowAddForm(true)}
        >
          <div className="connection-icon-container add-icon">
            <IoAddCircle className="react-icon Add" />
          </div>
          <div className="connection-name">Add New</div>
          <button className="connection-button add-button">Add</button>
        </div>
      </div>

      {/* ✅ Modal for Adding Connection */}
      <AddConnectionsModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        newConnection={newConnection}
        setNewConnection={setNewConnection}
        handleInputChange={handleInputChange}
        handleAddConnection={handleAddConnection}
      />

      {/* ✅ Modal for Deleting Connection */}
      <DeleteConnectionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        connectionToDelete={connectionToDelete}
        handleDeleteConnection={handleDeleteConnection}
      />
    </div>
  );
};

export default AddConnections;
