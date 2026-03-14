import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./quiz.css";

const Quiz = () => {
  // Récupération des paramètres (LessonId et FormationId)
  const location = useLocation();
  const { LessonId, FormationId } = location.state || {};

  // États du quiz
  const [quizData, setQuizData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem("token");


  // Chargement du quiz depuis l'API
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/quiz/generer-quiz/${LessonId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: LessonId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQuizData(data);
        } else if (Array.isArray(data?.data)) {
          setQuizData(data.data);
        } else if (Array.isArray(data?.quiz)) {
          setQuizData(data.quiz);
        } else {
          console.error("Format de données inattendu :", data);
          setError("Erreur de chargement du quiz");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement du quiz :", err);
        setError("Impossible de charger le quiz");
        setLoading(false);
      });
  }, [LessonId]);

  // Gestion du timer
  useEffect(() => {
    if (quizFinished || loading || !quizData.length) return;

    if (timeLeft === 0) {
      handleNextQuestion();
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizFinished, loading, quizData]);

  // Sauvegarde des résultats et mise à jour de la progression
  const saveQuizResults = async (lessonId, score, totalQuestions) => {
    try {
      const note = Math.round((score / totalQuestions) * 100);
      const response = await fetch("http://localhost:5000/api/progress/mark-complete", {
        method: "POST",
          headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
        body: JSON.stringify({
          note,
          formationId: FormationId,
          lessonId: lessonId,
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour de la progression");
      }

      const data = await response.json();
      console.log("Progression mise à jour :", data);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
      throw err;
    }
  };

  // Gestion des réponses
  const handleOptionClick = (optionIndex) => {
    setSelectedOption(optionIndex);
    const correctIndex = quizData[currentQuestion].reponse.charCodeAt(0) - 65;
    if (optionIndex === correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  // Passage à la question suivante ou fin du quiz
  const handleNextQuestion = async () => {
    if (currentQuestion + 1 < quizData.length) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(10);
      setSelectedOption(null);
    } else {
      try {
        await saveQuizResults(LessonId, score, quizData.length);
        setQuizFinished(true);
      } catch (err) {
        console.error("Erreur lors de la sauvegarde :", err);
        setQuizFinished(true); // On termine le quiz même en cas d'erreur
        setError("Erreur lors de l'enregistrement des résultats");
      }
    }
  };



  // Affichage pendant le chargement
  if (loading) return <div className="container">Chargement du quiz...</div>;

  // Gestion des erreurs
  if (error) return <div className="container">{error}</div>;

  // Vérification des données
  if (!quizData.length) return <div className="container">Aucune question disponible.</div>;

  // Écran de fin de quiz
  if (quizFinished) {
    const percentage = Math.round((score / quizData.length) * 100);
    return (
      <div className="container">
        <h2>Quiz Terminé !</h2>
        <p>Score Final : {score} / {quizData.length}</p>
        <p>Note : {percentage}%</p>
      </div>
    );
  }

  // Affichage de la question actuelle
  const question = quizData[currentQuestion];
  const timerClass = timeLeft > 6 ? "high" : timeLeft > 3 ? "medium" : "low";

  return (
    <div className="container">
      <h1>Quiz</h1>
      <h2>
        {currentQuestion + 1}. {question.question}
      </h2>
      <div className={`timer ${timerClass} ${timeLeft <= 3 ? "pulse" : ""}`}>
        {timeLeft}s
      </div>
      <ul>
        {question.options.map((option, index) => (
          <li
            key={index}
            className={selectedOption === index ? "selected" : ""}
            onClick={() => handleOptionClick(index)}
          >
            {String.fromCharCode(65 + index)}. {option}
          </li>
        ))}
      </ul>
      <button onClick={handleNextQuestion}>
        {currentQuestion + 1 === quizData.length ? "Terminer" : "Suivant"}
      </button>
      <div className="index">
        {currentQuestion + 1} / {quizData.length}
      </div>
    </div>
  );
};

export default Quiz;