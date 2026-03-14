import { useState, useRef, useEffect } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SearchBar.css";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";

const SearchBar = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const resultsRef = useRef(null);
  const resultItemsRef = useRef([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const [theme, setTheme] = useState(
    localStorage.getItem("theme-mode") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleChange = async (event) => {
  const value = event.target.value;
  setInput(value);
  setErrorMessage("");
  setShowErrorMessage(false);

  if (value.length) {
    try {
      // Check if token exists
      const token = localStorage.getItem("token");
      const config = token ? {
        params: { q: value },
        headers: { Authorization: `Bearer ${token}` }
      } : { params: { q: value } };

      const response = await axios.get("http://localhost:5000/api/search", config);
      setResults(response.data);
      setShowResults(true);
      setSelectedIndex(-1);
      resultItemsRef.current = [];
    } catch (error) {
      console.error("Error fetching search results:", error);
      setErrorMessage(error.response?.data?.message || "Error fetching results");
      setShowErrorMessage(true);
    }
  } else {
    setResults([]);
    setShowResults(false);
  }
};

  const handleBlur = () => {
    setTimeout(() => {
      if (!resultsRef.current?.contains(document.activeElement)) {
        setShowResults(false);
      }
    }, 200);
  };

  const handleResultClick = (word) => {
    setInput(word.label);
    setShowResults(false);
  };

  const handleSearch = () => {
    const searchTerm = input.toLowerCase();
    const matchedResults = results.filter((word) =>
      word.label.toLowerCase().includes(searchTerm)
    );

    if (matchedResults.length === 1) {
      navigate(matchedResults[0].path);
    } else if (matchedResults.length > 1) {
      navigate(`/SkillShareHub/search-results?query=${searchTerm}`);
    } else {
      setErrorMessage(
        "😕 Oops! No results found. Try another keyword or check your spelling."
      );
      setShowErrorMessage(true);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        navigate(results[selectedIndex].path);
        handleResultClick(results[selectedIndex]);
      } else {
        handleSearch();
      }
      setShowResults(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const newIndex = (selectedIndex + 1) % results.length;
      setSelectedIndex(newIndex);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const newIndex = selectedIndex <= 0 ? results.length - 1 : selectedIndex - 1;
      setSelectedIndex(newIndex);
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && resultItemsRef.current[selectedIndex]) {
      resultItemsRef.current[selectedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [selectedIndex]);

  const closeErrorMessage = () => {
    setShowErrorMessage(false);
  };

  useEffect(() => {
    if (showErrorMessage) {
      const timer = setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorMessage]);

  useEffect(() => {
    if (!showErrorMessage) {
      const fadeOutTimer = setTimeout(() => {
        setErrorMessage("");
      }, 500);
      return () => clearTimeout(fadeOutTimer);
    }
  }, [showErrorMessage]);

  return (
    <>
      <div className="container-fluid">
        <div
          className={`search-box ${
            showResults ? "showing-results change-back" : ""
          }`}
        >
          <div className="row-box">
            <input
              type="text"
              id="input-search"
              placeholder="Rechercher..."
              autoComplete="off"
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowResults(true)}
              onBlur={handleBlur}
              className="searchBarInput"
            />
            <button className="searchBarButton" onClick={handleSearch}>
              <AiOutlineSearch className="search-icon" />
            </button>
          </div>

          {showResults && results.length > 0 && (
            <div className="padd" ref={resultsRef}>
              <div className="searchBarResult-box">
                <ul>
                  {results.map((word, index) => (
                    <li
                      key={index}
                      ref={(el) => (resultItemsRef.current[index] = el)}
                      className={
                        index === selectedIndex ? "Resultselected" : ""
                      }
                    >
                      <Link
                        to={word.path}
                        className="result-link"
                        onClick={() => handleResultClick(word)}
                      >
                        <GetProfilePicture
                          data={word}
                          className="result-image"
                        />
                        {word.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {showErrorMessage && errorMessage && (
        <div className={`SearchBar-error-message ${!showErrorMessage ? "SearchBar-fade-out" : ""}`}>
          <button className="SearchBar-close-btn" onClick={closeErrorMessage}>
            ✖
          </button>
          <p>{errorMessage}</p>
        </div>
      )}
    </>
  );
};

export default SearchBar;