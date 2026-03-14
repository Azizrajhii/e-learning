import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./FAQ.css";
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa6";
import unSavedIcon from "./../images/unsavedIcon.png";
import savedIcon from "./../images/savedIcon.png";
import { FaRegComments } from "react-icons/fa6";
import FAQSidebar from "./FAQSidebar.jsx";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";
import dayjs from "dayjs";
import Poll from "./Poll";
import FAQPostCreator from "./FAQPostCreator.jsx";
import axios from "axios";

const FAQArticleCard = ({ article }) => {
  // Early return if article is null or undefined
  if (!article) {
    return null;
  }

  // Handle anonymous posts (where userId is null)
  const isAnonymous = !article.userId;
  const profile = isAnonymous ? null : article.userId.profile;

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

  const toggleLike = async () => {
    try {
      if (liked) {
        await axios.delete(
          `http://localhost:5000/api/articles/liked/${article._id}`,
          headers
        );
        setLiked(false);
        setLikesCount(likesCount - 1);
      } else {
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

  const toggleSave = async () => {
    try {
      if (saved) {
        await axios.delete(
          `http://localhost:5000/api/articles/saved/${article._id}`,
          headers
        );
        setSaved(false);
      } else {
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

  const countAllComments = (comments) => {
    if (!comments || !Array.isArray(comments)) {
      return 0;
    }

    let count = 0;
    comments.forEach((comment) => {
      count++;
      count += countAllComments(comment.replies || []);
    });
    return count;
  };

  const nbComments = countAllComments(article?.comments || []);

  const formatPostedAt = (date) => {
    const now = dayjs().tz("Africa/Tunis");
    const posted = dayjs(date).tz("Africa/Tunis");

    const diffInDays = now.startOf("day").diff(posted.startOf("day"), "day");
    const diffInMonths = now.diff(posted, "month");
    const diffInYears = now.diff(posted, "year");

    if (diffInDays === 0) {
      return posted.format("HH:mm");
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

  const checkIfSaved = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/articles/saved/${article._id}`,
        headers
      );
      setSaved(response.data.saved);
    } catch (error) {
      console.error("Error checking save status:", error);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const contentRef = useRef(null);
  const toggleContent = () => setIsExpanded(!isExpanded);

  useEffect(() => {
    if (contentRef.current && article.content) {
      const contentHeight = contentRef.current.scrollHeight;
      const lineHeight = parseInt(
        window.getComputedStyle(contentRef.current).lineHeight,
        10
      );
      const linesInView = Math.floor(contentHeight / lineHeight);
      setShowReadMore(linesInView > 2);
    }
  }, [article.content]);

  useEffect(() => {
    if (article?._id) {
      checkIfLiked();
      checkIfSaved();
    }
  }, [article?._id]);

  return (
    <div className="faq-article-card">
      <div className="faq-header">
        {isAnonymous ? (
          <div className="faq-user-pdp anonymous">A</div>
        ) : (
          <Link to={`/SkillShareHub/Profile/${profile?._id}`}>
            <GetProfilePicture
              data={profile}
              className="faq-user-pdp"
            />
          </Link>
        )}

        <div className="faq-header-user-and-time">
          {isAnonymous ? (
            <span className="faq-user">Anonymous</span>
          ) : (
            <Link to={`/SkillShareHub/Profile/${profile?._id}`}>
              <span className="faq-user">
                {profile?.lastName} {profile?.name}
              </span>
            </Link>
          )}

          <span className="faq-date">
            {formatPostedAt(article.postedAt)}
            <span className="faq-full-date">
              {dayjs(article.postedAt).format("MMM D, YYYY")}
            </span>
          </span>
        </div>
      </div>
      
      {article.title && <h3>{article.title}</h3>}
      
      {article.content && (
        <>
          <p
            className={`faq-article-content ${isExpanded ? "expanded" : ""}`}
            ref={contentRef}
          >
            {article.content}
          </p>
          {showReadMore && (
            <button className="faq-toggle-button" onClick={toggleContent}>
              {isExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </>
      )}

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
        
        <Link to={`/SkillShareHub/Article/${article._id}`}>
          <div className="faq-comments-container">
            <FaRegComments size={28} />
            {nbComments}
          </div>
        </Link>
        
        <div className="faq-saves-container" onClick={toggleSave}>
          <button>
            <img src={saved ? savedIcon : unSavedIcon} alt="" />
          </button>
          <span>{saved ? "saved" : "save"}</span>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [articles, setArticles] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchArticles = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/articles");
      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.error || "Error loading articles");
      }

      setArticles(data.articles);
    } catch (error) {
      console.error("Error fetching articles:", error.message);
      setArticles([]);
    }
  };

  // This useEffect will run on initial render and whenever refreshTrigger changes
  useEffect(() => {
    fetchArticles();
  }, [refreshTrigger]);

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="faq-container">
      <div className="faq-main-content">
        <FAQPostCreator onPostCreated={handlePostCreated} />
        {articles.map((article) => (
          <FAQArticleCard key={article._id} article={article} />
        ))}
      </div>
      <FAQSidebar />
    </div>
  );
};

export default FAQ;
