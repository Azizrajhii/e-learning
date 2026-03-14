import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ReactCountryFlag from "react-country-flag";
import {
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiCamera,
  FiUpload,
  FiUser,
  FiInfo,
  FiMapPin,
  FiPhone,
  FiAward,
} from "react-icons/fi";
import { motion } from "framer-motion";
import "./ProfileSettings.css";
window.face=false;

const ProfileCompletionMeter = ({ completion }) => {
  return (
    <div className="profile-settings-completion-meter">
      <svg className="profile-settings-completion-svg" viewBox="0 0 36 36">
        <path
          className="profile-settings-completion-circle-bg"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="profile-settings-completion-circle"
          strokeDasharray={`${completion}, 100`}
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="profile-settings-completion-value">{completion}%</div>
    </div>
  );
};

const ProfilePictureUpload = ({ src, onChange }) => {
  const [preview, setPreview] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  return (
    <motion.div
      className="profile-settings-profile-picture-upload"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
    >
      <img
        src={preview || src || "/default-profile.png"}
        alt="Profile"
        className="profile-settings-profile-picture"
      />
      <div
        className={`profile-settings-profile-picture-overlay ${
          isHovered ? "visible" : ""
        }`}
      >
        <label className="profile-settings-upload-label">
          <FiUpload className="profile-settings-upload-icon" />
          <span>Change Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="profile-settings-upload-input"
          />
        </label>
      </div>
      <div className="profile-picture-edit-icon">
        <FiEdit2 />
      </div>
    </motion.div>
  );
};

const ProfileCoverUpload = ({ src, onChange }) => {
  const [preview, setPreview] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  return (
    <motion.div
      className="profile-settings-cover-upload"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={preview || src || "/default-cover.jpg"}
        alt="Cover"
        className="profile-settings-cover-image"
      />
      <div
        className={`profile-settings-cover-overlay ${
          isHovered ? "visible" : ""
        }`}
      >
        <label className="profile-settings-upload-label">
          <FiCamera className="profile-settings-upload-icon" />
          <span>Change Cover Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="profile-settings-upload-input"
          />
        </label>
      </div>
    </motion.div>
  );
};

const ProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Refs for each section
  const personalRef = useRef(null);
  const bioRef = useRef(null);
  const locationRef = useRef(null);
  const skillsRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm();

  const selectedCountry = watch("country");

  // Extract userId from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const sortedCountries = response.data
          .map((country) => ({
            code: country.cca2,
            name: country.name.common,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(sortedCountries);
        setCountriesLoading(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountriesLoading(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      const fetchCities = async () => {
        setCitiesLoading(true);
        try {
          const mockCities = {
            US: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
            FR: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
            TN: [
              "Tunis",
              "Ariana",
              "Ben Arous",
              "Manouba",
              "Nabeul",
              "Zaghouan",
              "Bizerte",
              "Béja",
              "Jendouba",
              "Kef",
              "Siliana",
              "Sousse",
              "Monastir",
              "Mahdia",
              "Kairouan",
              "Kasserine",
              "Sidi Bouzid",
              "Sfax",
              "Gabès",
              "Medenine",
              "Tataouine",
              "Gafsa",
              "Tozeur",
              "Kebili",
            ],
          };

          setCities(mockCities[selectedCountry] || []);
        } catch (error) {
          console.error("Error fetching cities:", error);
          setCities([]);
        } finally {
          setCitiesLoading(false);
        }
      };

      fetchCities();
    } else {
      setCities([]);
    }
  }, [selectedCountry]);

  // Fetch profile data
  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:5000/api/profile/user/${userId}`)
        .then((res) => {
          setProfileData(res.data);
          reset({
  ...res.data,
  profilePicture: null,
  profileCover: null,
});

          setLoading(false);
          calculateCompletion(res.data);
        })
        .catch((err) => {
          console.error("Error loading profile:", err);
          setLoading(false);
        });
    }
  }, [userId, reset]);

  const calculateCompletion = (data) => {
    let completion = 0;
    if (data.name && data.lastName) completion += 20;
    if (data.tel) completion += 10;
    if (data.location) completion += 5;
    if (data.government) completion += 5;
    if (data.country) completion += 5;
    if (data.bio) completion += 20;
    if (data.specialty) completion += 10;
    if (data.profilePicture) completion += 10;
    if (data.profileCover) completion += 15;
    setProfileCompletion(Math.min(100, completion));
  };

  // Définition unique des gestionnaires de fichiers
  const handleProfilePictureChange = (file) => {
    setValue("profilePicture", file, { shouldDirty: true });
  };

  const handleCoverPhotoChange = (file) => {
    setValue("profileCover", file, { shouldDirty: true });
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

const onSubmit = async (data) => {
  setServerError(null);

  try {
    const formData = new FormData();

    // Ajout des champs standards
    Object.keys(data).forEach(key => {
      if (key !== 'profilePicture' && key !== 'profileCover' && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Ajout des fichiers avec les noms exacts attendus par le backend
    if (data.profilePicture instanceof File) {
      formData.append('profilePicture', data.profilePicture);
    }

if (data.profileCover instanceof File) {
  formData.append('profileCover', data.profileCover); // Utilisez profileCover partout
}

    // Debug: Affiche le contenu de FormData
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await axios.put(
      `http://localhost:5000/api/profile/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    setProfileData(response.data);
    calculateCompletion(response.data);
    setShowSuccessModal(true);
  } catch (error) {
    console.error('Error updating profile:', error);
    setServerError(
      error.response?.data?.message || 'Échec de la mise à jour du profil'
    );
  }
};



  if (loading) {
    return (
      <div className="profile-settings-loading-container">
        <div className="profile-settings-loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-settings-container">
      <div className="profile-settings-profile-content">
        <div className="profile-settings-profile-sidebar">
          <div className="profile-settings-profile-card">
            <ProfilePictureUpload
              src={profileData?.profilePicture || null}
              onChange={handleProfilePictureChange}
            />
            <h3>
              {profileData?.name || "User"} {profileData?.lastName}
            </h3>
            <p className="profile-settings-profile-title">
              {profileData?.specialty || "Your Profession"}
            </p>

            <ProfileCompletionMeter completion={profileCompletion} />

            <div className="profile-settings-completion-text">
              {profileCompletion === 100 ? (
                <p>Your profile is complete! 🎉</p>
              ) : (
                <p>Complete your profile to unlock all features</p>
              )}
            </div>
          </div>
          <nav className="profile-settings-profile-nav">
            <button
              className="profile-settings-nav-item"
              onClick={() => scrollToSection(personalRef)}
            >
              <FiUser className="profile-settings-nav-icon" />
              Personal Info
            </button>
            <button
              className="profile-settings-nav-item"
              onClick={() => scrollToSection(bioRef)}
            >
              <FiInfo className="profile-settings-nav-icon" />
              About You
            </button>
            <button
              className="profile-settings-nav-item"
              onClick={() => scrollToSection(skillsRef)}
            >
              <FiAward className="profile-settings-nav-icon" />
              Skills
            </button>
            <button
              className="profile-settings-nav-item"
              onClick={() => scrollToSection(locationRef)}
            >
              <FiMapPin className="profile-settings-nav-icon" />
              Location
            </button>
          </nav>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="profile-settings-profile-form"
        >
          <ProfileCoverUpload
            src={profileData?.ProfileCover || null}
            onChange={handleCoverPhotoChange}
          />

          <div className="profile-settings-form-content">
            {/* Personal Info Section */}
            <div ref={personalRef} className="profile-settings-form-section">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2>
                  <FiUser className="profile-settings-section-icon" />
                  Personal Information
                </h2>

                <div className="profile-settings-form-grid">
                  <div className="profile-settings-form-group">
                    <label>First Name</label>
                    <input
                      {...register("name", {
                        required: "First name is required",
                      })}
                      placeholder="Enter your first name"
                      className={`profile-settings-form-input ${
                        errors.name ? "profile-settings-error" : ""
                      }`}
                    />
                    {errors.name && (
                      <span className="profile-settings-error-message">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div className="profile-settings-form-group">
                    <label>Last Name</label>
                    <input
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      placeholder="Enter your last name"
                      className={`profile-settings-form-input ${
                        errors.lastName ? "profile-settings-error" : ""
                      }`}
                    />
                    {errors.lastName && (
                      <span className="profile-settings-error-message">
                        {errors.lastName.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="profile-settings-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    {...register("tel")}
                    placeholder="(123) 456-7890"
                    className="profile-settings-form-input"
                  />
                </div>
              </motion.div>
            </div>

            {/* About You Section */}
            <div ref={bioRef} className="profile-settings-form-section">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2>
                  <FiInfo className="profile-settings-section-icon" />
                  About You
                </h2>

                <div className="profile-settings-form-group">
                  <label>Bio</label>
                  <textarea
                    {...register("bio")}
                    placeholder="Tell us about yourself, your skills, and experiences..."
                    className="profile-settings-form-textarea"
                    rows={6}
                  />
                </div>
              </motion.div>
            </div>

            {/* Skills Section */}
            <div ref={skillsRef} className="profile-settings-form-section">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2>
                  <FiAward className="profile-settings-section-icon" />
                  Skills & Specialty
                </h2>

                <div className="profile-settings-form-group">
                  <label>Specialty</label>
                  <input
                    {...register("specialty")}
                    placeholder="e.g., UX Designer, Web Developer, Graphic Artist"
                    className="profile-settings-form-input"
                  />
                </div>
              </motion.div>
            </div>

            {/* Location Section */}
            <div ref={locationRef} className="profile-settings-form-section">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2>
                  <FiMapPin className="profile-settings-section-icon" />
                  Location
                </h2>

                <div className="profile-settings-form-grid">
                  <div className="profile-settings-form-group">
                    <label>Country</label>
                    {countriesLoading ? (
                      <div className="profile-settings-country-loading">
                        Loading countries...
                      </div>
                    ) : (
                      <div className="profile-settings-country-select-wrapper">
                        <select
                          {...register("country")}
                          className="profile-settings-form-input"
                        >
                          <option value="">Select country</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                        {selectedCountry && (
                          <div className="profile-settings-country-flag">
                            <ReactCountryFlag
                              countryCode={selectedCountry}
                              svg
                              style={{
                                width: "1.5em",
                                height: "1.5em",
                                margin: "0 10px",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="profile-settings-form-actions">
              <button
                type="submit"
                className="profile-settings-save-button"
                disabled={!isDirty}
              >
                <FiCheck className="profile-settings-button-icon" />
                Save Changes
              </button>
            </div>

            {serverError && (
              <div className="profile-settings-server-error">
                <FiX className="profile-settings-error-icon" />
                {serverError}
              </div>
            )}
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className="profile-settings-success-modal">
          <div className="profile-settings-success-content">
            <div className="profile-settings-success-icon">
              <FiCheck />
            </div>
            <h3>Profile Updated Successfully!</h3>
            <p>Your profile information has been updated.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="profile-settings-success-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
