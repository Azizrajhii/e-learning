import { useState, useEffect } from "react";
import ProfileCover from "./../images/ProfileCover.png";
import "./Profile.css";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import useFetchProfileData from "./../utils/useFetchProfile.jsx";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";
import { useParams } from "react-router-dom";
import LinkedinIcon from "./../images/LinkedinIcon.png";
import githubIcon from "./../images/githubIcon.png";
import { MdEmail, MdPhone } from "react-icons/md";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import {
  FaUserPlus,
  FaUserMinus,
  FaEnvelope,
  FaUserFriends,
} from "react-icons/fa";
import axios from "axios";
import ConfirmationUnfriendModal from "./ConfirmationUnfriendModal";
import { Link, useNavigate } from "react-router-dom";

const SkillBar = ({ name, percentage, color, delay }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setProgress(percentage);
    }, delay);
  }, [percentage, delay]);

  return (
    <div className="SkillBar-skill">
      <span>{name}</span>
      <div className="SkillBar-skill-bar">
        <div
          className={`SkillBar-fill ${color}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

const SkillsSection = ({ skills }) => {
  const getPercentageFromLevel = (level) => {
    switch (level) {
      case "Beginner":
        return 30;
      case "Intermediate":
        return 60;
      case "Advanced":
        return 80;
      case "Expert":
        return 95;
      default:
        return 50;
    }
  };

  const getColorFromLevel = (level) => {
    switch (level) {
      case "Beginner":
        return "red";
      case "Intermediate":
        return "orange";
      case "Advanced":
        return "blue";
      case "Expert":
        return "green";
      default:
        return "blue";
    }
  };

  return (
    <div className="SkillBar-skills-section">
      <h2 className="SkillBar-title">Professional Skills</h2>
      <div className="SkillBar-skills-grid">
        {skills?.map((skill, index) => (
          <SkillBar
            key={index}
            name={skill.name}
            percentage={getPercentageFromLevel(skill.level)}
            color={getColorFromLevel(skill.level)}
            delay={index * 500}
          />
        ))}
      </div>
    </div>
  );
};

const CircularProgress = ({ percentage, color, delay }) => {
  const [progress, setProgress] = useState(0);
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    setTimeout(() => {
      setProgress(percentage);
    }, delay);
  }, [percentage, delay]);

  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      className="circle-container"
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="#ddd"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={progressOffset}
        className="Circle-progress-circle"
        style={{
          transition: "stroke-dashoffset 1.5s ease-in-out",
        }}
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dy="8"
        className="Circle-percentage-text"
      >
        {progress}%
      </text>
    </svg>
  );
};

const LanguageSection = ({ languages }) => {
  const getPercentageFromLevel = (level) => {
    switch (level) {
      case "Basic":
        return 30;
      case "Conversational":
        return 60;
      case "Fluent":
        return 80;
      case "Native":
        return 95;
      default:
        return 50;
    }
  };

  const getColorFromLevel = (level) => {
    switch (level) {
      case "Basic":
        return "red";
      case "Conversational":
        return "blue";
      case "Fluent":
        return "green";
      case "Native":
        return "green";
      default:
        return "blue";
    }
  };

  return (
    <div className="Circle-Languages-section">
      <h2 className="Circle-title">Language Skills</h2>
      <div className="Circle-Languages-grid">
        {languages?.map((language, index) => (
          <div key={index} className="Circle-Language-item">
            <CircularProgress
              percentage={getPercentageFromLevel(language.level)}
              color={getColorFromLevel(language.level)}
              delay={index * 500}
            />
            <span className="Circle-Language-name">{language.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExperienceCard = ({
  title,
  company,
  period,
  description,
  startDate,
  endDate,
  delay,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric" });
  };

  return (
    <div
      className={`ExperienceCard-timeline-card ${
        visible ? "fade-in" : "hidden"
      }`}
    >
      <div className="ExperienceCard-card-body">
        <h5 className="ExperienceCard-card-title">
          {title}
          <span className="ExperienceCard-company-name"> at {company}</span>
        </h5>
        <p className="ExperienceCard-period">{period}</p>
        <p className="ExperienceCard-description">{description}</p>
        {startDate && (
          <p className="Education-period">Graduated {formatDate(startDate)}</p>
        )}
      </div>
    </div>
  );
};

const WorkExperience = ({ experiences }) => {
  return (
    <div className="ExperienceCard-work-experience-section">
      <h2 className="ExperienceCard-title">Work Experience</h2>
      <div className="ExperienceCard-timeline">
        {experiences?.map((exp, index) => (
          <ExperienceCard
            key={index}
            title={exp.title}
            company={exp.company}
            startDate={exp.startDate}
            endDate={exp.endDate}
            description={exp.description}
            delay={index * 500}
          />
        ))}
      </div>
    </div>
  );
};

const EducationCard = ({
  degree,
  institution,
  field,
  graduationYear,
  delay,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric" });
  };

  return (
    <div
      className={`Education-timeline-card ${visible ? "fade-in" : "hidden"}`}
    >
      <div className="Education-card-body">
        <h5 className="Education-card-title">
          {degree}
          <span className="ExperienceCard-company-name">
            {field && ` in ${field}`}
          </span>
        </h5>
        <p className="ExperienceCard-description">{institution}</p>
        {graduationYear && (
          <p className="Education-period">
            Graduated {formatDate(graduationYear)}
          </p>
        )}
      </div>
    </div>
  );
};

const Education = ({ education }) => {
  return (
    <div className="Education-work-experience-section">
      <h2 className="Education-title">Education</h2>
      <div className="Education-timeline">
        {education?.map((edu, index) => (
          <EducationCard
            key={index}
            degree={edu.degree}
            institution={edu.institution}
            field={edu.field}
            graduationYear={edu.graduationYear}
            delay={index * 500}
          />
        ))}
      </div>
    </div>
  );
};

const ProfileInfos = ({ Data }) => {
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [isMyProfile, setIsMyProfile] = useState(true);
  const [numberFollowers, setNumberFollowers] = useState(0);
  const [numberFollowing, setNumberFollowing] = useState(0);
  const token = localStorage.getItem("token");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const checkIsMyProfile = async () => {
    try {
      if (!Data._id) return;
      const response = await axios.get(
        `http://localhost:5000/api/profile/checkIsMyProfile/${Data._id}`,
        headers
      );
      setIsMyProfile(response.data.isMine);
    } catch (error) {
      console.error("Erreur lors de la vérification du profil :", error);
    }
  };

  useEffect(() => {
    checkIsMyProfile();
  }, [Data._id]);

  const checkIfFriend = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/follow/${Data.userId?._id}`,
        headers
      );
      setIsFriend(response.data.isFriend);
    } catch (err) {
      console.error("Erreur lors de la vérification d'amitié :", err);
    }
  };

  useEffect(() => {
    setNumberFollowers(Data.followers?.length);
    setNumberFollowing(Data.following?.length);
  }, [Data]);

  useEffect(() => {
    if (!isMyProfile) {
      checkIfFriend();
    }
  }, [isMyProfile]);

  const handleFollow = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/follow/${Data.userId?._id}`,
        {},
        headers
      );
      setIsFollowing(true);
      checkIfFriend();
      setNumberFollowers(numberFollowers + 1);
    } catch (err) {
      console.error("Erreur lors du follow :", err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/follow/${Data.userId?._id}`,
        headers
      );
      setIsFollowing(false);
      setIsFriend(false);
      setNumberFollowers(numberFollowers - 1);
    } catch (err) {
      console.error("Erreur lors de l'unfollow :", err);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num;
  };

  return (
    <>
      <div className="Profile-Content-Left">
        <div className="Profile-Pdp">
          <GetProfilePicture data={Data} className="width : 100%;" />
        </div>
        <h4 className="Profile-name">
          {Data.lastName} {Data.name}
        </h4>
        <p className="Profile-info">{Data.specialty}</p>
        <div
          className="stats"
          style={!isMyProfile ? { borderBottom: "1px solid #7d7979" } : {}}
        >
          <div className="stat" style={{ paddingRight: "50px" }}>
            <p className="number-stat">{formatNumber(numberFollowers) || 0}</p>
            <p className="desc-stat">Followers</p>
          </div>
          <div className="stat">
            <p className="number-stat">{formatNumber(numberFollowing) || 0}</p>
            <p className="desc-stat">Following</p>
          </div>
          <div className="stat" style={{ paddingLeft: "50px" }}>
            <p className="number-stat">{Data.uploads?.length || 0}</p>
            <p className="desc-stat">Uploads</p>
          </div>
        </div>
        {!isMyProfile && (
          <div className="Profile-follow-infollow-actions-button">
            {isFriend ? (
              <>
                <button
                  className="Profile-follow-infollow-actions-button profile-actions-unfollow"
                  onMouseEnter={() => setHovering(true)}
                  onMouseLeave={() => setHovering(false)}
                  onClick={() => setShowUnfriendModal(true)}
                  aria-label="Unfollow"
                >
                  {hovering ? <FaUserMinus /> : <FaUserFriends />}
                  <span className="button-label">
                    {hovering ? "Unfriend" : "Friends"}
                  </span>
                </button>
                <button
                  className="Profile-follow-infollow-actions-button profile-actions-message"
                  aria-label="Message"
                >
                  <FaEnvelope />
                  <span className="button-label">Message</span>
                </button>
              </>
            ) : isFollowing ? (
              <button
                className="Profile-follow-infollow-actions-button profile-actions-unfollow"
                onClick={handleUnfollow}
                aria-label="Unfollow"
              >
                <FaUserMinus />
                <span className="button-label">Unfollow</span>
              </button>
            ) : (
              <button
                className="Profile-follow-infollow-actions-button profile-actions-follow"
                onClick={handleFollow}
                aria-label="Follow"
              >
                <FaUserPlus />
                <span className="button-label">Follow</span>
              </button>
            )}
          </div>
        )}
      </div>
      <ConfirmationUnfriendModal
        show={showUnfriendModal}
        onClose={() => setShowUnfriendModal(false)}
        onConfirm={() => {
          handleUnfollow();
          setShowUnfriendModal(false);
        }}
        Data={Data}
      />
    </>
  );
};

const AboutProfile = ({ Data }) => {
  return (
    <div className="AboutProfile-container">
      {Data.bio && (
        <>
          <p className="Profile-bio">🧠 {Data.bio}</p>
          <div className="AboutProfile-Line" />
        </>
      )}

      {Data.userId?.email && (
        <>
          <div className="AboutProfile-row">
            <MdEmail className="icon" />
            <a href={`mailto:${Data.userId.email}`} className="Profile-link">
              {Data.userId.email}
            </a>
          </div>
          <div className="AboutProfile-Line" />
        </>
      )}

      {Data.tel && (
        <>
          <div className="AboutProfile-row">
            <MdPhone className="icon" />
            <a href={`tel:${Data.tel.toString()}`} className="Profile-link">
              {Data.tel}
            </a>
          </div>
          <div className="AboutProfile-Line" />
        </>
      )}

      <div className="Profile-connections">
        <a
          href="https://www.linkedin.com/in/username"
          target="_blank"
          rel="noopener noreferrer"
          className="connection-link"
        >
          <FaLinkedin className="icon" />
          <span>LinkedIn</span>
        </a>
        <a
          href="https://github.com/username"
          target="_blank"
          rel="noopener noreferrer"
          className="connection-link"
        >
          <FaGithub className="icon" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );
};

const CertificateCard = ({
  name,
  institution,
  link,
  date,
  delay,
  certificateId,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`CertificateCard-timeline-card ${
        visible ? "fade-in" : "hidden"
      }`}
    >
      <div className="CertificateCard-card-body">
        <h5 className="CertificateCard-card-title">{name}</h5>
        <p className="CertificateCard-institution">{institution}</p>
        {date && (
          <p className="CertificateCard-date">Issued: {formatDate(date)}</p>
        )}
        {link && (
          <Link
            to={`/SkillShareHub/CertificateViewer/${certificateId}`}
            className="CertificateCard-link"
          >
            View Certificate
          </Link>
        )}
      </div>
    </div>
  );
};

const CertificateSection = ({ certificates }) => {
  return (
    <div className="CertificateSection-certificates-section">
      <h2 className="CertificateSection-title">Certificates</h2>
      <div className="CertificateSection-timeline">
        {certificates?.map((cert, index) => (
          <CertificateCard
            key={index}
            name={cert.name}
            institution={cert.institution}
            link={cert.link}
            date={cert.date}
            delay={index * 500}
            certificateId={cert._id}
          />
        ))}
      </div>
    </div>
  );
};

const Profile = () => {
  const [value, setValue] = useState("1");
  const { id } = useParams();
  const [cvData, setCvData] = useState(null);
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { data: userData, loading, error } = useFetchProfileData({ Id: id });

  const [Data, setData] = useState({
    name: "Guest",
  });

  const fetchCvData = async (userId) => {
    console.log(userId)
    try {
      const response = await axios.get(`http://localhost:5000/api/Cv/${userId}`);
      console.log(response.data)
      setCvData(response.data);
      console.log("ahlaaa",response.data)
    } catch (error) {
      console.error("Error fetching CV data:", error);
    }
  };

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      setData(userData);
      fetchCvData(userData.userId?._id);
    }
  }, [userData]);

  

  const [isMyProfile, setIsMyProfile] = useState(true);
  const token = localStorage.getItem("token");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const checkIsMyProfile = async () => {
    try {
      if (!Data._id) return;
      const response = await axios.get(
        `http://localhost:5000/api/profile/checkIsMyProfile/${Data._id}`,
        headers
      );
      setIsMyProfile(response.data.isMine);
    } catch (error) {
      console.error("Erreur lors de la vérification du profil :", error);
    }
  };

  useEffect(() => {
    checkIsMyProfile();
  }, [Data._id]);

  // Check if CV sections are empty
  const isCvEmpty =
    cvData &&
    (!cvData.skills || cvData.skills.length === 0) &&
    (!cvData.languages || cvData.languages.length === 0) &&
    (!cvData.education || cvData.education.length === 0) &&
    (!cvData.experience || cvData.experience.length === 0);

  // Check if certificates are empty
  const isCertificatesEmpty =
    cvData && (!cvData.certificates || cvData.certificates.length === 0);

  const handleNavigateToCvSettings = () => {
    navigate("/SkillShareHub/Settings");
  };

  const handleNavigateToCertificateSettings = () => {
    navigate("/SkillShareHub/Formations");
  };

  return (
    <div className="Profile-container">
      <div className="Profile-header">
        <img src={Data.ProfileCover || ProfileCover} alt="Profile cover" />
      </div>
      <div className="Profile-Line"></div>
      <div className="Profile-Content">
        <ProfileInfos Data={Data} />
        <div className="Profile-Content-Right">
          <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={value}>
              <div className="Profile-Content-Right-header">
                <div className="Profile-Content-Right-header-Menu">
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList
                      onChange={handleChange}
                      aria-label="lab API tabs example"
                    >
                      <Tab label="About" value="1" />
                      <Tab label="CV" value="2" />
                      {isMyProfile && <Tab label="CERTIFICATE" value="3" />}
                    </TabList>
                  </Box>
                </div>
              </div>
              <div className="Profile-Content-Right-header-Content">
                <TabPanel value="1">
                  <AboutProfile Data={Data} />
                </TabPanel>
                <TabPanel value="2">
                  {isCvEmpty && isMyProfile ? (
                    <div className="Profile-empty-section">
                      <p className="Profile-info">
                        Your CV is empty. Complete it to showcase your skills!
                      </p>
                      <button
                        className="Profile-empty-button"
                        onClick={handleNavigateToCvSettings}
                      >
                        Complete your CV
                      </button>
                    </div>
                  ) : (
                    cvData?.skills?.length > 0 && (
                      <SkillsSection skills={cvData.skills} />
                    )
                  )}
                </TabPanel>
                {isMyProfile && (
                  <TabPanel value="3">
                    {isCertificatesEmpty ? (
                      <div className="Profile-empty-section">
                        <p className="Profile-info">
                          You haven't added any certificates yet.
                        </p>
                        <button
                          className="Profile-empty-button"
                          onClick={handleNavigateToCertificateSettings}
                        >
                          Register for formation
                        </button>
                      </div>
                    ) : (
                      cvData?.certificates?.length > 0 && (
                        <CertificateSection
                          certificates={cvData.certificates}
                        />
                      )
                    )}
                  </TabPanel>
                )}
              </div>
              
            </TabContext>
          </Box>
        </div>
      </div>
      {value === "2" && !isCvEmpty && (
        <>
          {cvData?.languages?.length > 0 && (
            <>
              <hr />
              <LanguageSection languages={cvData.languages} />
            </>
          )}
          {(cvData?.education?.length > 0 ||
            cvData?.experience?.length > 0) && (
            <>
              <hr />
            </>
          )}
          <div className="WorkEducation">
            {cvData?.education?.length > 0 && (
              <Education education={cvData.education} />
            )}
            {cvData?.experience?.length > 0 && (
              <WorkExperience experiences={cvData.experience} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
