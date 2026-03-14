import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ProfileForm.css";
import LogoSopra from "./../images/LS.png";

export default function ProfileForm() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme-mode") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.id;
  const [validationErrors, setValidationErrors] = useState({});

  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const genders = [
    { value: "Man", label: "Man", icon: "♂" },
    { value: "Woman", label: "Woman", icon: "♀" },
  ];

  const [profile, setProfile] = useState({
    name: "",
    lastName: "",
    sex: "",
    speciality: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load existing profile
  useEffect(() => {
    if (userId) {
fetch(`http://localhost:5000/api/profile/user/${userId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error fetching profile");
          return res.json();
        })
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [userId]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const errors = {};
    if (!profile.name) errors.name = "First name is required";
    if (!profile.lastName) errors.lastName = "Last name is required";
    if (!profile.sex) errors.sex = "Gender is required";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    console.log(profile);
    try {
      const response = await fetch(
        `http://localhost:5000/api/profile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profile),
        }
      );

      if (!response.ok) {
        throw new Error("Update error");
      }

      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (error) return <div className="profile-error">Error: {error}</div>;

  return (
    <div className="profile-page-wrapper">
      <div className="profile-content-container">
        <div className="profile-decorative-elements">
          <div className="profile-decor-circle-large"></div>
          <div className="profile-decor-circle-medium"></div>
          <div className="profile-decor-circle-small"></div>
          <div className="profile-decor-circle-right"></div>
        </div>

        <div className="profile-welcome-section">
          <img src={LogoSopra} alt="" className="profile-welcome-image" />
          <h1 className="profile-welcome-title">PROFILE</h1>
          <h2 className="profile-welcome-subtitle">SETUP</h2>
          <p className="profile-welcome-text">
            Complete your profile to get the most out of SkillShare Hub
          </p>
        </div>

        <div className="profile-form-container">
          <h1 className="profile-form-title">Complete Profile</h1>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-form-box">
              <div className="profile-input-group">
                <label htmlFor="lastName" className="profile-input-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="profile-input-field"
                  value={profile.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
                {validationErrors.lastName && (
                  <span className="profile-error-message">
                    {validationErrors.lastName}
                  </span>
                )}
              </div>

              <div className="profile-input-group">
                <label htmlFor="name" className="profile-input-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="profile-input-field"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
                {validationErrors.name && (
                  <span className="profile-error-message">
                    {validationErrors.name}
                  </span>
                )}
              </div>
            </div>

            <div className="profile-form-box">
              <div className="profile-input-group">
                <label className="profile-input-label">Gender</label>
                <div
                  className={`profile-form-custom-select ${
                    validationErrors.sex ? "profile-form-error" : ""
                  }`}
                  onClick={() => setIsGenderOpen(!isGenderOpen)}
                >
                  <div className="profile-form-custom-select-header">
                    {profile.sex ? (
                      <span className="profile-form-gender-option">
                        <span>
                          {genders.find((g) => g.value === profile.sex)?.icon}
                        </span>
                        <span> {profile.sex}</span>{" "}
                      </span>
                    ) : (
                      "Select Your Gender"
                    )}
                    <span
                      className={`profile-form-custom-select-arrow ${
                        isGenderOpen ? "profile-form-open" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                  {isGenderOpen && (
                    <div className="profile-form-custom-select-options">
                      {genders.map((gender) => (
                        <div
                          key={gender.value}
                          className={`profile-form-custom-select-option ${
                            profile.sex === gender.value
                              ? "profile-form-selected"
                              : ""
                          }`}
                          onClick={() => {
                            setProfile({ ...profile, sex: gender.value });
                            setIsGenderOpen(false);
                            setValidationErrors({
                              ...validationErrors,
                              sex: "",
                            });
                          }}
                        >
                          <span className="profile-form-gender-icon">
                            {gender.icon}
                          </span>
                          {gender.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {validationErrors.sex && (
                  <span className="profile-error-message">
                    {validationErrors.sex}
                  </span>
                )}
              </div>

              <div className="profile-input-group">
                <label htmlFor="speciality" className="profile-input-label">
                  Speciality
                </label>
                <input
                  type="text"
                  id="speciality"
                  name="speciality"
                  className="profile-input-field"
                  value={profile.speciality}
                  onChange={handleChange}
                  placeholder="E.g. Software Developer, Designer, etc."
                />
              </div>
            </div>

            <div className="profile-input-group">
              <label htmlFor="bio" className="profile-input-label">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                className="profile-textarea-field"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself, your skills, and experience..."
                rows="4"
              />
            </div>

            <div className="profile-action-buttons">
              <button type="submit" className="profile-primary-button">
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
