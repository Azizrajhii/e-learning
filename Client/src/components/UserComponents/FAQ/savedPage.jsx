import { useEffect, useState } from 'react';
import "./savedPage.css";
import historicalIcon from "./../images/historicalIcon.png";
import pollingImage from "./../images/pollingImage.png";
import videoImage from "./../images/VideoImage.png";
import axios from "axios";
import { articlesData } from "./data";
import { Link } from 'react-router-dom';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";
import MiniLinkIcon from "./../images/MiniLinkIcon.png";

const searchHistorical = [
  { _id: "83738JFJHE", searchHistorical: "python" },
  { _id: "A9837FJSJ2", searchHistorical: "javascript" },
  { _id: "B2827HJSH7", searchHistorical: "react" },
  { _id: "C4928DJSD9", searchHistorical: "node.js" },
  { _id: "D7482FHJS3", searchHistorical: "express" },
  { _id: "E6573GKJS1", searchHistorical: "mongodb" },
  { _id: "F2847JHJS4", searchHistorical: "html" },
  { _id: "G9731KJSS5", searchHistorical: "css" }
];

function savedPage() {
  const [savedArticles, setSavedArticles] = useState([]);

  const token = localStorage.getItem("token");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const fetchAllSaved = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/articles/saved", headers);
      if (response.data) {
        setSavedArticles(response.data)
      }
    } catch (err) {
      console.error("Failed to fetch saved articles", err);
    }
  }
  const sortedSavedArticles = [...savedArticles].sort(
    (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
  );

  const articleFormatSavedAt = (savedAt) => {
    const now = dayjs().tz("Africa/Tunis");
    const posted = dayjs(savedAt).tz("Africa/Tunis").subtract(2, 'hour');

    if (posted.isAfter(now)) {
      return "Saved just now";
    }

    const years = now.diff(posted, "year");
    const months = now.diff(posted, "month") % 12;
    const weeks = Math.floor(now.diff(posted, "day") / 7);
    const days = now.diff(posted, "day");
    const hours = now.diff(posted, "hour");
    const minutes = now.diff(posted, "minute");

    if (years > 0) return `Saved ${years} ${years === 1 ? "year" : "years"} ago`;
    if (months > 0) return `Saved ${months} ${months === 1 ? "month" : "months"} ago`;
    if (weeks > 0) return `Saved ${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    if (days > 0) return `Saved ${days} ${days === 1 ? "day" : "days"} ago`;
    if (hours > 0) return `Saved ${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    if (minutes > 0) return `Saved ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    return "Saved just now";
  };

  useEffect(() => {
    fetchAllSaved();
  }, []);


  return (
    <div className='saved-page-container'>
      <div className='saved-page-search-container'>
        <div className="saved-page-search-input">
          <input type="text" placeholder="Rechercher un article..." />
        </div>
        <div className="saved-page-search-line"></div>
        <div className="saved-page-search-Historical">
          <ul>
            {searchHistorical.map((historical) => (
              <li key={historical._id}>
                <img src={historicalIcon} alt="historical icon" />
                <span>{historical.searchHistorical}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="saved-page-articles-container">
        {sortedSavedArticles.map((saved) => {
          const article = saved.articleId;
          if (!article) return null;

          const user = article.userId;
          const profile = user?.profile;

          return (
            <Link to={`/SkillShareHub/article/${article._id}`} key={saved._id}>
              <div className="saved-page-article-container">
                <div className="saved-page-article-cover">
                  <img
                    src={
                      article.image
                        ? article.image
                        : article.poll
                          ? pollingImage
                          : article.video
                            ? videoImage
                            : article.link
                              ? MiniLinkIcon
                              : ""
                    }
                    alt={article.title}
                    className="saved-page-article-image"
                  />
                </div>
                <div className="saved-page-article-infos">
                  <div className="saved-page-article-header">
                    <div className="saved-page-article-user">
                      <GetProfilePicture data={profile} />
                      <span>{profile?.lastName} {profile?.name}</span>
                    </div>
                    <div className="saved-page-article-time">
                      <div className="faq-wrapper">
                        <span>{articleFormatSavedAt(saved.savedAt)}</span>
                        <span className="faq-full-date" style={{ color: 'white' }}>
                          {dayjs(saved.savedAt).format("MMM D, YYYY")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="saved-page-article-description">
                    {article?.title ? (
                      <>
                        <h3>{article.title}</h3>
                        <p>{article.content}</p>
                      </>
                    ) : (
                      <>
                        <h3>{article?.poll?.question}</h3>
                        {article?.poll?.answers?.slice(0, 2).map((answer, i) => (
                          <p key={i}>{answer.label}</p>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

      </div>
    </div>
  );
}

export default savedPage;
