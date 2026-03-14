import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa6";
import axios from "axios";
import unSavedIcon from "./../images/unsavedIcon.png";
import savedIcon from "./../images/savedIcon.png";
import { FaRegComments } from "react-icons/fa6";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
import Poll from "./Poll";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";
import { Link } from "react-router-dom";

const ArticleInfos = ({ article }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(article?.nbLikes?.length || 0);

  const token = localStorage.getItem("token");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const checkIfLiked = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/articles/liked/${article._id}`,
        headers
      );
      setLiked(response.data.liked);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/articles/saved/${article._id}`,
        headers
      );
      setSaved(response.data.saved);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const toggleLike = async () => {
    try {
      if (liked) {
        // Un-like the article
        await axios.delete(
          `http://localhost:5000/api/articles/liked/${article._id}`,
          headers
        );
        setLiked(false);
        setLikesCount(likesCount - 1);
      } else {
        // Like the article
        await axios.post(
          `http://localhost:5000/api/articles/liked/${article._id}`,
          {},
          headers
        );

        setLiked(true);
        setLikesCount(likesCount + 1);
      }
    } catch (error) {
      console.error("Error toggling like status:", error);
    }
  };

  const countAllComments = (comments) => {
    if (!comments || !Array.isArray(comments)) {
      return 0;
    }

    let count = 0;
    comments.forEach((comment) => {
      count++; // Count the main comment
      // Count replies recursively, with a fallback for undefined replies
      count += countAllComments(comment.replies || []);
    });
    return count;
  };

  const nbComments = countAllComments(article?.comments || []);

  const formatPostedAt = (date) => {
    const now = dayjs().tz("Africa/Tunis");
    const posted = dayjs(date).tz("Africa/Tunis"); // Adjust if needed

    const diffInDays = now.startOf("day").diff(posted.startOf("day"), "day");
    const diffInMonths = now.diff(posted, "month");
    const diffInYears = now.diff(posted, "year");

    if (diffInDays === 0) {
      return posted.format("HH:mm"); // Same day → show time
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays <= 7) {
      return `${diffInDays} days ago`;
    } else if (diffInMonths < 1) {
      const weeksAgo = Math.floor(diffInDays / 7);
      return `${weeksAgo} ${weeksAgo > 1 ? "weeks" : "week"} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths > 1 ? "months" : "month"} ago`;
    } else {
      return `${diffInYears} ${diffInYears > 1 ? "years" : "year"} ago`;
    }
  };

  const toggleSave = async () => {
    try {
      if (saved) {
        // Unsave the article
        await axios.delete(
          `http://localhost:5000/api/articles/saved/${article._id}`,
          headers
        );
        setSaved(false);
      } else {
        // Save the article
        await axios.post(
          `http://localhost:5000/api/articles/saved/${article._id}`,
          {},
          headers
        );
        setSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save status:", error);
    }
  };

  useEffect(() => {
    if (article?._id) {
      checkIfLiked();
      checkIfSaved();
    }
  }, [article?._id]);

  return (
    <>
      <div className="faq-header">
        {article.userId?.profile && (
          <>
            <Link to={`/SkillShareHub/Profile/${article.userId.profile._id}`}>
              <GetProfilePicture
                data={article.userId.profile}
                className="faq-user-pdp"
              />
            </Link>
            <div className="faq-header-user-and-time">
              <Link to={`/SkillShareHub/Profile/${article.userId.profile._id}`}>
                <span className="faq-user">
                  {article.userId.profile.lastName}{" "}
                  {article.userId.profile.name}
                </span>
              </Link>

              <span className="faq-date">
                {formatPostedAt(article.postedAt)}
                <span className="faq-full-date">
                  {dayjs(article.postedAt).format("MMM D, YYYY")}
                </span>
              </span>
            </div>
          </>
        )}
      </div>
      <h3>{article.title}</h3>
      <p>{article.content}</p>
      {article.image && (
        <img src={article.image} alt="article" className="faq-article-image" />
      )}
      {article.poll && <Poll initialPoll={article.poll} />}
      {article.link && (
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="article-link"
        >
          {article.link}
        </a>
      )}
      {article.video && (
        <video src={article.video} controls className="faq-article-image">
          Your browser does not support the video tag.
        </video>
      )}
      <div className="faq-actions">
        <div className="faq-likes-container" onClick={toggleLike}>
          <button>
            {liked ? <FcLike size={28} /> : <FaRegHeart size={26} />}
          </button>
          {likesCount > 0 && likesCount}
        </div>
        <div className="faq-comments-container">
          <FaRegComments size={28} />
          {nbComments}
        </div>
        <div className="faq-saves-container" onClick={toggleSave}>
          <button>
            <img src={saved ? savedIcon : unSavedIcon} alt="" />
          </button>
          <span>{saved ? "saved" : "save"}</span>
        </div>
      </div>
    </>
  );
};

export default ArticleInfos;
