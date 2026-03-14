import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ArticlePage.css";
import { FaPaperPlane } from "react-icons/fa";
import Comment from "./Comment";
import ArticleInfos from "./ArticleInfos";
import MentionInput from "./MentionInput";
import { articlesData, users } from "./data";
import pdp from "./../images/pdp.jpg";
import FAQSidebar from "./FAQSidebar";
import axios from "axios";

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/commentaires/${id}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error loading comments");
      }

      const formattedComments = data.map((comment) => ({
        _id: comment._id,
        id: comment._id, // For compatibility
        content: comment.content,
        userId: comment.userId?.profile?._id || "",
        name: comment.userId?.profile?.name || "Unknown",
        lastName: comment.userId?.profile?.lastName || "Unknown",
        postedAt: comment.postedAt,
        nbLikes: comment.nbLikes || [],
        replies: comment.replies || [],
        mentions: comment.mentions || [],
        sex: comment.userId?.profile?.sex,
        profilePicture:
          comment.userId?.profile?.profilePicture ||
          comment.userId?.profile?.name,
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error("Error fetching comments:", error.message);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticle = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/articles/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error loading article");
      }

      setArticle(data.article);
      await fetchComments();
    } catch (error) {
      console.error("Error fetching article:", error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const token = localStorage.getItem("token");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const handleAddComment = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/commentaires",
        {
          content: newComment,
          mentions: [],
          articleId: id,
        },
        headers
      );

      setNewComment("");
      await fetchComments();
    } catch (error) {
      console.error("Erreur :", error.response?.data?.message || error.message);
    }
  };

  const addReply = async (commentId, replyContent) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${commentId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content: replyContent }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to post reply");
      }

      // Refresh comments after successful reply
      await fetchComments();
    } catch (error) {
      console.error("Error posting reply:", error.message);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // Prevent default behavior (like new line in textarea)
    if (newComment.trim()) { // Only post if there's content
      handleAddComment();
    }
  }
};

  return (
    <div className="faq-article-page">
      <div className="faq-article-card">
        <ArticleInfos article={article} />
        <div className="faq-page-line-between-article-and-post"></div>
        <div className="faq-comment-section">
          <div className="faq-write-comment">
            <MentionInput
              styles={{ marginLeft: "0px", width: "100%" }}
              value={newComment}
              onChange={setNewComment}
              placeholder="Write a comment..."
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleAddComment} className="faq-post-btn">
              <FaPaperPlane size={28} />
            </button>
          </div>
          {comments.length > 0 && (
            <div className="faq-comments">
              {comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  addReply={addReply}
                  users={comment?.userId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <FAQSidebar />
    </div>
  );
};

export default ArticlePage;
