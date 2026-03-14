import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./SearchResults.css";
import pdp from "./../images/pdp.jpg";
import {
  FaUserPlus,
  FaUserMinus,
  FaEnvelope,
  FaUserFriends,
} from "react-icons/fa";
import axios from "axios";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";
import ConfirmationUnfriendModal from "./../Profile/ConfirmationUnfriendModal.jsx";

const PeopleCard = ({ item }) => {
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(item.isFollowing);
  const [isFriend, setIsFriend] = useState(item.isFriend);
  const [hovering, setHovering] = useState(false);
  const token = localStorage.getItem("token");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const checkIfFriend = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/follow/${item.userId}`,
        headers
      );

      setIsFriend(response.data.isFriend);
    } catch (err) {
      console.error("Erreur lors de la vérification d'amitié :", err);
    }
  };

  useEffect(() => {
    checkIfFriend();
  }, [item._id]);

  const handleFollow = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/follow/${item.userId}`,
        {},
        headers
      );
      setIsFollowing(true);
      checkIfFriend(); // re-check si la relation est maintenant mutuelle
    } catch (err) {
      console.error("Erreur lors du follow :", err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/follow/${item.userId}`,
        headers
      );
      setIsFollowing(false);
      setIsFriend(false);
    } catch (err) {
      console.error("Erreur lors de l'unfollow :", err);
    }
  };

  return (
    <>
      <div className="SearchResults-item people-card">
        <Link to={item.path}>
          <div className="card-link">
            <div className="SearchResults-item-image">
              <GetProfilePicture data={item} />
            </div>

            <div className="profile-details">
              <h3>
                {item.lastName} {item.name}
              </h3>
              <p>{item.specialty || "Membre"}</p>

              <div className="profile-stats">
                <div className="stat">
                  <div className="stat-value">
                    {item.followers}
                  </div>
                  <div className="stat-label">Followers</div>
                </div>
                <div className="stat">
                  <div className="stat-value">
                    {item.following}
                  </div>
                  <div className="stat-label">Following</div>
                </div>
                <div className="stat">
                  <div className="stat-value">
                    {item.uploads}
                  </div>
                  <div className="stat-label">Uploads</div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <div className="profile-actions">
          {isFriend ? (
            <>
              <button
                className="action-btn profile-actions-unfollow"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onClick={() => setShowUnfriendModal(true)}
                aria-label="Unfollow"
              >
                {hovering ? <FaUserMinus /> : <FaUserFriends />}
              </button>
              <button
                className="action-btn profile-actions-message"
                aria-label="Message"
              >
                <FaEnvelope />
              </button>
            </>
          ) : isFollowing ? (
            <button
              className="action-btn profile-actions-unfollow"
              onClick={handleUnfollow}
              aria-label="Unfollow"
            >
              <FaUserMinus />
            </button>
          ) : (
            <button
              className="action-btn profile-actions-follow"
              onClick={handleFollow}
              aria-label="Follow"
            >
              <FaUserPlus />
            </button>
          )}
        </div>
      </div>
      <ConfirmationUnfriendModal
        show={showUnfriendModal}
        onClose={() => setShowUnfriendModal(false)}
        onConfirm={() => {
          handleUnfollow();
          setShowUnfriendModal(false);
        }}
        Data={item}
      />
    </>
  );
};

const ArticleCard = ({ item }) => {
  return (
    <div className="SearchResults-item article-card">
      <Link to={item.path} className="card-link">
        {" "}
        {/* Wrap everything with Link */}
        <div className="SearchResults-item-image">
          <GetProfilePicture data={item} className="" />
        </div>
        <div className="SearchResults-item-content">
          <h3>{item.label}</h3>
          <p>Article</p>
          {item.description && (
            <p className="article-excerpt">
              {item.description.substring(0, 100)}...
            </p>
          )}
          <p className="author-time">
            By {item.author || "Unknown Author"} | {item.time || "Unknown Time"}
          </p>
        </div>
      </Link>
    </div>
  );
};

const getAvailableSections = (results) => {
  if (!results || !results.length) return [];

  const typesSet = new Set(results.map((item) => item.type?.toLowerCase()));
  const sections = [];

  if (typesSet.has("user")) sections.push("People");
  if (typesSet.has("article")) sections.push("Articles");

  if (sections.length > 1) {
    sections.unshift("All");
  }

  return sections;
};

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");
  const [activeSection, setActiveSection] = useState("All");
  const [underlineStyle, setUnderlineStyle] = useState({});
  const [results, setResults] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const buttonsRef = useRef([]);
  const token = localStorage.getItem("token");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    const activeButtonIndex = sections.indexOf(activeSection);
    if (buttonsRef.current[activeButtonIndex]) {
      const activeButton = buttonsRef.current[activeButtonIndex];
      setUnderlineStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
        opacity: 1,
      });
    }
  }, [activeSection, sections]);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/search/searchMany?q=${query}` , headers
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setResults(data);
        setSections(getAvailableSections(data));
        setActiveSection("All"); // Reset to All when new search
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) fetchResults();
    else {
      setResults([]);
      setSections([]);
    }
  }, [query]);

  const filterResultsByType = (type) => {
    if (!results || !results.length) return [];

    return results.filter((item) => {
      if (type === "People") return item.type === "user";
      if (type === "Articles") return item.type === "article";
      return true; // For "All" section
    });
  };

  const filteredResults = useMemo(() => {
    return filterResultsByType(activeSection === "All" ? null : activeSection);
  }, [results, activeSection]);

  const renderResultItem = (item) => {
    switch (item.type) {
      case "user":
        return <PeopleCard key={`user-${item._id}`} item={item} />;
      case "article":
        return <ArticleCard key={`article-${item._id}`} item={item} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="SearchResults-loading">Loading...</div>;
  }

  if (!results.length && !isLoading) {
    return <div className="SearchResults-empty">No results found.</div>;
  }

  return (
    <div className="SearchResults">
      <div className="SearchResults-nav">
        <div className="SearchResults-nav-container">
          {sections.map((section, index) => (
            <button
              key={section}
              ref={(el) => (buttonsRef.current[index] = el)}
              className={`SearchResults-nav-button ${
                activeSection === section ? "active" : ""
              }`}
              onClick={() => setActiveSection(section)}
              disabled={
                section !== "All" && filterResultsByType(section).length === 0
              }
            >
              {section}
            </button>
          ))}
          <div className="SearchResults-nav-underline" style={underlineStyle} />
        </div>
      </div>

      <hr className="SearchResults-divider" />

      <div className="SearchResults-grid" key={activeSection}>
        {filteredResults.map(renderResultItem)}
      </div>
    </div>
  );
};

export default SearchResults;
