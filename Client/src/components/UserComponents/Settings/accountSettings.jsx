import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import * as faceapi from "face-api.js";
import {
  FiMail,
  FiLock,
  FiCamera,
  FiSave,
} from "react-icons/fi";
import { motion } from "framer-motion";
import "./AccountSettings.css";

const AccountSettings = () => {
  const [userId, setUserId] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  window.face=true;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
        setLoading(false);
      } catch (error) {
        console.error("Invalid token:", error);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
        console.log("Models loaded successfully");
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      console.log("ahla");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }

        
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };
    
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const sendDescriptor = async (descriptor) => {
  if (!userId || !descriptor || descriptor.length !== 128) {
    console.error("Invalid descriptor or userId");
    return;
  }

  try {
    const response = await axios.put("http://localhost:5000/api/user/update-descriptor", {
      userId,
      descriptor,
    });

    if (response.data.success) {  // <-- This is the problem
      console.log("Face ID updated successfully");
    } else {
      console.error("Error updating descriptor:", response.data);
    }
  } catch (error) {
    console.error("Server error updating descriptor:", error);
  }
};

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !modelsLoaded) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const detection = await faceapi
      .detectSingleFace(canvas)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection && detection.descriptor) {
      const descriptorArray = Array.from(detection.descriptor);
      setFaceDescriptor(descriptorArray);
      alert("Face detected and ready to be saved.");
    } else {
      alert("No face detected.");
    }
  };

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      if (data.email) {
        await axios.put("http://localhost:5000/api/user/update-email", {
          userId,
          newEmail: data.email,
        });
      }

      if (data.password) {
        await axios.put("http://localhost:5000/api/user/update-password", {
          userId,
          newPassword: data.password,
        });
      }

      if (faceDescriptor) {
        await sendDescriptor(faceDescriptor);
      }

      alert("Update successful!");
      reset();
      setFaceDescriptor(null);
    } catch (error) {
      setServerError(error.response?.data?.message || "Error during update.");
    }
  };

  if (loading) {
    return (
      <div className="account-settings-loading-container">
        <div className="account-settings-loading-spinner"></div>
        <p>Loading your account settings...</p>
      </div>
    );
  }

  return (
    <div className="account-settings-container">
      <div className="account-settings-content">
        <div className="account-settings-sidebar">
          <div className="account-settings-card">
            <h3>Account Settings</h3>
            <p>Update your email, password, and Face ID</p>
          </div>
          <nav className="account-settings-nav">
            <button className="account-settings-nav-item">
              <FiMail className="account-settings-nav-icon" />
              Email
            </button>
            <button className="account-settings-nav-item">
              <FiLock className="account-settings-nav-icon" />
              Password
            </button>
            <button className="account-settings-nav-item">
              <FiCamera className="account-settings-nav-icon" />
              Face ID
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="account-settings-form">
          <div className="account-settings-form-content">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="account-settings-form-section"
            >
              <h2>
                <FiMail className="account-settings-section-icon" />
                Email Settings
              </h2>

              <div className="account-settings-form-group">
                <label>New Email</label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="Enter your new email"
                  className="account-settings-form-input"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="account-settings-form-section"
            >
              <h2>
                <FiLock className="account-settings-section-icon" />
                Password Settings
              </h2>

              <div className="account-settings-form-group">
                <label>New Password</label>
                <input
                  type="password"
                  {...register("password")}
                  placeholder="Enter your new password"
                  className="account-settings-form-input"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="account-settings-form-section"
            >
              <h2>
                <FiCamera className="account-settings-section-icon" />
                Face ID Settings
              </h2>

              <div className="account-settings-form-group">
                <label>Face Recognition</label>
                <div className="account-settings-faceid-container">
                  <video ref={videoRef} autoPlay muted className="account-settings-video" />
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="account-settings-capture-button"
                  >
                    Capture Face
                  </button>
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>
                <p className="account-settings-input-hint">
                  Position your face in the frame and click capture
                </p>
              </div>
            </motion.div>

            {serverError && (
              <div className="account-settings-server-error">{serverError}</div>
            )}
          </div>

          <div className="account-settings-form-actions">
            <button
              type="submit"
              className="account-settings-save-button"
              disabled={!isDirty && !faceDescriptor}
            >
              <FiSave className="account-settings-save-icon" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;