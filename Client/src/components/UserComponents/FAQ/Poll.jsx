import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import "./Poll.css";

const Poll = ({ initialPoll }) => {
  const [poll, setPoll] = useState(initialPoll);
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const token = localStorage.getItem("token");
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const totalVotes = useMemo(() => {
    return poll.answers.reduce((sum, ans) => sum + ans.nbChosen, 0);
  }, [poll.answers]);

  const checkIfVoted = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/articles/Poll/${poll._id}/voted`, headers);
      if (res.data.voted) {
        setHasVoted(true);
        setSelected(res.data.selected);
        await fetchResults(); // load results immediately
      }
    } catch (err) {
      console.error("Error checking vote:", err);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/articles/Poll/${poll._id}/results`, headers);
      setPoll(res.data);
    } catch (err) {
      console.error("Error fetching poll results:", err);
    }
  };

  const handleVote = async (selectedId) => {
    if (hasVoted) return;

    try {
      await axios.post(`http://localhost:5000/api/articles/Poll/${poll._id}/vote`, {
        answerId: selectedId,
      }, headers);

      setSelected(selectedId);
      setHasVoted(true);

      // Fetch updated results
      await fetchResults();
    } catch (err) {
      console.error("Error submitting vote:", err);
    }
  };

  useEffect(() => {
    checkIfVoted();
  }, []);

  useEffect(() => {
    if (hasVoted) {
      setTimeout(() => setAnimate(true), 50);
    }
  }, [hasVoted]);

  return (
    <div className="faq-poll">
      <div className="faq-poll-question">{poll.question}</div>
      <div className="faq-poll-answers">
        {poll.answers.map((answer) => {
          const percentage = totalVotes
            ? (answer.nbChosen / totalVotes) * 100
            : 0;

          const getColorByPercentage = (percent) => {
            if (percent <= 40) return "rgb(255, 0, 0)";
            if (percent <= 75) return "rgb(6, 239, 6)";
            return "rgb(0, 81, 255)";
          };

          const isNotSelected =
            hasVoted && selected !== answer._id ? "not-selected" : "";

          return (
            <div
              key={answer._id}
              className={`faq-poll-answer-container ${isNotSelected}`}
              onClick={() => handleVote(answer._id)}
              style={{ cursor: hasVoted ? "default" : "pointer" }}
            >
              <div className="faq-poll-answer-container-color">
                <div
                  className={`faq-poll-radio ${selected === answer._id ? "selected" : ""}`}
                  onClick={() => handleVote(answer._id)}
                />
                <label htmlFor={answer._id} className="faq-poll-answer-label">
                  {answer.label}
                </label>
                {hasVoted && <span>{Math.round(percentage)}%</span>}
              </div>

              {hasVoted && (
                <div
                  className={`faq-poll-answer-fill ${animate ? "animate-fill" : ""}`}
                  style={{
                    width: animate ? `${percentage}%` : "0%",
                    backgroundColor: getColorByPercentage(percentage),
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Poll;
