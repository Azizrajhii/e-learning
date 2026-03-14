import React, { useState, useEffect, useRef } from "react";
import "./FaceID.css";
import FaceIdIcon from "./assets/FaceIdIcon.png";
import { useNavigate } from "react-router-dom";
import lottie from "lottie-web";
import * as faceapi from "face-api.js";
import axios from "axios";
import detectionAnimation from "./faceid_detection.json";
import Lottie from 'lottie-react';

const FaceIDAnimation = ({ onLoginSuccess, onClose }) => {
  const [recognizedUser, setRecognizedUser] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const resultContainerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const faceMatcherRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const unknownFaceCountRef = useRef(0);
  const noFaceCountRef = useRef(0);
  const currentAnimationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300);
    }, 7000);

    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    startApp();
  }, []);

  const startApp = () => {
    if (isInitialized) return;
    setIsInitialized(true);
    loadModelsAndStart();
  };

  const cleanupAnimation = () => {
    try {
      currentAnimationRef.current?.destroy();
      currentAnimationRef.current = null;
      if (resultContainerRef.current) resultContainerRef.current.innerHTML = "";
    } catch (err) {
      console.log("Cleanup error:", err);
    }
  };

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.error("Track stop error:", e);
          }
        });
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.log("Stop camera error:", err);
    }
  };

  const resetCamera = () => {
    cleanupAnimation();
    videoRef.current?.classList.remove("video-hidden");
    videoContainerRef.current?.classList.remove("animation-active");
    unknownFaceCountRef.current = 0;
    noFaceCountRef.current = 0;
    setError(null);
    startCamera();
  };

  const getTokenName = async (email) => {
    if (!email || email === "unknown") return null;
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/get-token-email",
        { email }
      );
      return response.data?.token ? response.data : null;
    } catch (error) {
      console.log("getTokenName error:", error.response?.data || error.message);
      return null;
    }
  };

  const showSuccessAnimation = (email) => {
    cleanupAnimation();
    videoRef.current?.classList.add("video-hidden");
    videoContainerRef.current?.classList.add("animation-active");

    const animationContainer = document.createElement("div");
    animationContainer.className = "lottie-animation";
    resultContainerRef.current.appendChild(animationContainer);

    currentAnimationRef.current = lottie.loadAnimation({
      container: animationContainer,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: "/images/1.json",
    });

    currentAnimationRef.current.addEventListener("DOMLoaded", () => {
      const totalFrames = currentAnimationRef.current.getDuration(true);
      currentAnimationRef.current.playSegments([90, totalFrames], true);
    });

    // Redirection après l'animation
    
  };

  const showFailureAnimation = (message) => {
    cleanupAnimation();
    videoRef.current?.classList.add("video-hidden");
    videoContainerRef.current?.classList.add("animation-active");

    const animationContainer = document.createElement("div");
    animationContainer.className = "lottie-animation";
    resultContainerRef.current.appendChild(animationContainer);

    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    animationContainer.appendChild(messageElement);

    

    animationContainer.addEventListener("click", () => resetCamera());

    unknownFaceCountRef.current = 0;
    noFaceCountRef.current = 0;
  };

  const handleRecognizedFace = async (match) => {
    const userName = match.label;
    try {
      const tokenData = await getTokenName(userName);
      if (!tokenData) throw new Error("No token received");

      // 🔐 Sauvegarde token avant tout
      localStorage.setItem("token", tokenData.token);
      setRecognizedUser(userName);

      // ✅ Stop caméra immédiatement
      clearInterval(detectionIntervalRef.current);
      stopCamera();
      navigate("/SkillShareHub");

      // ✅ Puis animation de succès
      showSuccessAnimation(userName);
    } catch (error) {
      setError("Échec de l'authentification");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400 },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise((resolve, reject) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          resolve();
        };
        videoRef.current.onerror = () =>
          reject(new Error("Video playback failed"));
      });

      startFaceDetection();
    } catch (err) {
      setError("Caméra inaccessible");
    }
  };

  const startFaceDetection = () => {
    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (!detections.length) {
          noFaceCountRef.current++;
          if (noFaceCountRef.current >= 3) {
            clearInterval(detectionIntervalRef.current);
            showFailureAnimation("Aucun visage détecté");
          }
          return;
        }

        noFaceCountRef.current = 0;
        const bestMatch = faceMatcherRef.current.findBestMatch(
          detections[0].descriptor
        );

        if (bestMatch.label === "unknown") {
          unknownFaceCountRef.current++;
          if (unknownFaceCountRef.current >= 3) {
            clearInterval(detectionIntervalRef.current);
            showFailureAnimation("Visage non reconnu");
          }
          return;
        }

        await handleRecognizedFace(bestMatch);
      } catch (error) {
        console.error("Detection error:", error);
      }
    }, 3000);
  };

  const loadModelsAndStart = async () => {
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);

      const res = await axios.get("http://localhost:5000/api/user/users");

      const labeledDescriptors = res.data.data
        .map((userData) => {
          if (!userData.email || typeof userData.email !== "string") return null;

          if (
            !userData.descriptor ||
            !Array.isArray(userData.descriptor) ||
            userData.descriptor.length !== 128
          ) {
            return null;
          }

          return new faceapi.LabeledFaceDescriptors(userData.email, [
            new Float32Array(userData.descriptor),
          ]);
        })
        .filter(Boolean);

      if (labeledDescriptors.length === 0) {
        showFailureAnimation("Aucun descripteur facial valide");
        return;
      }

      faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.65);
      startCamera();
    } catch (err) {
      console.error("loadModels error:", err);
      showFailureAnimation("Erreur de chargement des modèles");
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div className={`face-id-container ${isClosing ? "closing" : ""}`}>
        <div className="face-id-modal">
          <div className="face-id-icon">
            <div className="face-id">
              <Lottie animationData={detectionAnimation} loop={false} />
            </div>
          </div>

          <div className="faceid-container">
            <div id="video-container" ref={videoContainerRef}>
              <video
                id="video"
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className=""
              />
            </div>

            {recognizedUser && (
              <div className="user-greeting">
                <h2>Utilisateur reconnu : {recognizedUser}</h2>
              </div>
            )}
          </div>
        </div>
        <div ref={resultContainerRef}></div>
      </div>
    </>
  );
};

export default FaceIDAnimation;
