import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../quiz/quiz.css";
const Puzzlebylesson = () => {
  const { name } = useParams(); 
  const [quizData, setQuizData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState(null);

  // Charger les questions du quiz par nom
  useEffect(() => {
    fetch(`http://localhost:5000/api/questionnaire/getQuestionnaire/${name}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQuizData(data);
        } else if (Array.isArray(data.data)) {
          setQuizData(data.data);
        } else if (Array.isArray(data.quiz)) {
          setQuizData(data.quiz);
        } else {
          console.error("Format de données inattendu :", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement du quiz :", err);
        setLoading(false);
      });
  }, [name]);

  // Gestion du timer
  useEffect(() => {
    if (quizFinished || loading) return;

    if (timeLeft === 0) {
      handleNextQuestion();
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizFinished, loading]);

  const handleOptionClick = (optionIndex) => {
    setSelectedOption(optionIndex);
    const correctIndex = quizData[currentQuestion].reponse.charCodeAt(0) - 65;
    if (optionIndex === correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < quizData.length) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(10);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizFinished(false);
    setTimeLeft(10);
    setSelectedOption(null);
  };

  if (loading) return <p>Chargement du quiz...</p>;

  if (!quizData.length || !quizData[currentQuestion]) {
    return <p>Aucune question disponible pour le quiz "{name}".</p>;
  }

  if (quizFinished) {
    return (
      <div className="container">
        <h2>Quiz "{name}" Terminé !</h2>
        <p>Score Final : {score} / {quizData.length}</p>
        <button onClick={restartQuiz}>Recommencer</button>
      </div>
    );
  }

  const question = quizData[currentQuestion];
  const timerClass = timeLeft > 6 ? "high" : timeLeft > 3 ? "medium" : "low";

  return (
    <div className="container">
      <h1>Quiz : {name}</h1>
      <h2>{currentQuestion + 1}. {question.text}</h2>
      <div className={`timer ${timerClass} ${timeLeft <= 3 ? "pulse" : ""}`}>
        {timeLeft}s
      </div>
      <ul>
        {question.options.map((option, index) => (
          <li
            key={index}
            className={selectedOption === index ? 'selected' : ''}
            onClick={() => handleOptionClick(index)}
          >
            {String.fromCharCode(65 + index)}. {option}
          </li>
        ))}
      </ul>
      <button onClick={handleNextQuestion}>Suivant</button>
      <div className="index">{currentQuestion + 1} / {quizData.length}</div>
    </div>
  );
};

export default Puzzlebylesson;
