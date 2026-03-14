import { useState, useRef, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaPaperPlane } from "react-icons/fa6";
import MentionInput from "./MentionInput";
import { renderReplyText } from "./../utils/renderReplyText";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";
import GetProfilePicture from "./../utils/GetProfilePicture.jsx";
dayjs.extend(utc);
dayjs.extend(timezone);

const Comment = ({ comment, addReply, users }) => {
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const replyInputRef = useRef(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.nbLikes.length || 0);

  const token = localStorage.getItem("token");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    const checkIfILiked = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/commentaires/${comment._id}/liked`,
          headers
        );
        setIsLiked(response.data.liked);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkIfILiked();
  }, [comment._id]);

  const handleLike = async (like) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/commentaires/${comment._id}/like`,
        { like },
        headers
      );

      // Update state based on successful API response
      setIsLiked(like);
      if (like) {
        setLikeCount(likeCount + 1);
      } else {
        setLikeCount(likeCount - 1);
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      // Revert UI state if API call fails
      setIsLiked(!like);
    }
  };

  const handleLikeClick = () => {
    const newLikeStatus = !isLiked;
    setIsLiked(newLikeStatus); // Optimistic update
    setLikeCount(newLikeStatus ? likeCount + 1 : likeCount - 1);
    handleLike(newLikeStatus);
  };

  const handleReplyClick = () => {
    // Prepend the mention when clicking reply
    setReplyText(`@${comment.lastName} ${comment.name} `);
    setShowReplyInput(!showReplyInput);
  };

  const handleReply = () => {
    if (replyText.trim()) {
      addReply(comment.id, replyText);
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  useEffect(() => {
    if (showReplyInput && replyInputRef.current) {
      replyInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      // Focus the input field
      const input = replyInputRef.current.querySelector("input");
      if (input) {
        input.focus();
        // Move cursor to end of text
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  }, [showReplyInput]);

  const commentFormatPostedAt = (postedAt) => {
    const now = dayjs().tz("Africa/Tunis"); // Current time in Tunis timezone
    const posted = dayjs(postedAt).tz("Africa/Tunis"); // Posted date adjusted to Tunis timezone

    // If the post is in the future, return "Just now"
    if (posted.isAfter(now)) {
      return "Just now";
    }

    const years = now.diff(posted, "year");
    const months = now.diff(posted, "month") % 12;
    const weeks = Math.floor(now.diff(posted, "day") / 7);
    const days = now.diff(posted, "day");
    const hours = now.diff(posted, "hour");
    const minutes = now.diff(posted, "minute");

    // Format depending on the largest difference
    if (years > 0) return `${years}y`;
    if (months > 0) return `${months}m`;
    if (weeks > 0) return `${weeks}w`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`; // Show minutes if the difference is > 0
    return "Just now"; // For very recent posts
  };

  return (
    <>
      <div className="faq-comment">
        <Link to={`/SkillShareHub/Profile/${comment.userId}`}>
          <GetProfilePicture data={comment} className="faq-user-pdp" />
        </Link>

        <div className="faq-comment-container">
          <div className="faq-comment-content">
            <Link to={`/SkillShareHub/Profile/${comment.userId}`}>
              <span className="faq-user">
                {comment.lastName} {comment.name}
              </span>
            </Link>
            <p>
              {comment.mentions?.length > 0 &&
                comment.mentions.map((mention) => (
                  <Link key={mention.userId} to={`/profile/${mention.userId}`}>
                    <span className="mention">
                      @{mention.lastName} {mention.name}
                    </span>
                  </Link>
                ))}
              {renderReplyText(comment.content)}
            </p>
          </div>
          <div className="faq-comment-actions">
            <div className="faq-comment-actions-time-and-reply">
              <span className="faq-date">
                {commentFormatPostedAt(comment.postedAt)}
                <span className="faq-full-date">
                  {dayjs(comment.postedAt).format("MMM D, YYYY")}
                </span>
              </span>
              <button
                onClick={handleReplyClick}
                className="faq-comment-button-reply"
              >
                Reply
              </button>
            </div>
            <div className="faq-comment-actions-likes-container">
              {likeCount > 0 && likeCount}
              <button onClick={handleLikeClick}>
                {isLiked ? (
                  <FaHeart size={20} color="red" />
                ) : (
                  <FaRegHeart size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
        {showReplyInput && (
          <div className="faq-write-comment" ref={replyInputRef}>
            <MentionInput
              styles={{ marginLeft: "40px", width: "70%" }}
              value={replyText}
              onChange={setReplyText}
              placeholder={`Reply to @${comment.name} ${comment.lastName}...`}
            />
            <button onClick={handleReply} className="faq-post-btn">
              <FaPaperPlane size={20} />
            </button>
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div className="faq-comments" style={{ marginLeft: "30px" }}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id || reply.id}
              comment={{
                postedAt: reply.postedAt,

                id: reply._id || reply.id,
                content: reply.content,
                name: reply.name || reply.userId?.profile?.name || "Unknown",
                lastName:
                  reply.lastName ||
                  reply.userId?.profile?.lastName ||
                  "Unknown",
                nbLikes: reply.nbLikes || [],
                replies: reply.replies || [],
                mentions: reply.mentions || [],
                sex: reply.sex || reply.userId?.profile?.sex,
                profilePicture:
                  reply.profilePicture || reply.userId?.profile?.profilePicture,
              }}
              addReply={addReply}
              users={users}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Comment;
