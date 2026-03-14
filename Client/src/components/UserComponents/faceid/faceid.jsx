import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import lottie from 'lottie-web';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import "./styles.css"

function Faceid({ onLoginSuccess }) {
  const [recognizedUser, setRecognizedUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const faceMatcherRef = useRef(null);
  const videoRef = useRef(null);
  const resultContainerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const unknownFaceCountRef = useRef(0);
  const noFaceCountRef = useRef(0);
  const currentAnimationRef = useRef(null);

  // Cleanup animation resources
  const cleanupAnimation = () => {
    try {
      if (currentAnimationRef.current) {
        currentAnimationRef.current.destroy();
        currentAnimationRef.current = null;
      }
      if (resultContainerRef.current) {
        resultContainerRef.current.innerHTML = '';
      }
    } catch (err) {
      console.log('Error cleaning up animation:', err);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    try {
      if (streamRef.current) {
        console.log('Stopping camera stream');
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped track: ${track.kind}`);
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.log('Error stopping camera:', err);
    }
  };

  // Reset camera and detection
  const resetCamera = () => {
    try {
      console.log('Resetting camera');
      cleanupAnimation();
      if (videoContainerRef.current) {
        videoContainerRef.current.classList.remove('animation-active');
      }
      unknownFaceCountRef.current = 0;
      noFaceCountRef.current = 0;
      setError(null);
      startCamera();
    } catch (err) {
      console.log('Error resetting camera:', err);
      setError('Failed to reset camera');
    }
  };

  // Initial setup and cleanup
  useEffect(() => {
    if (isInitialized) return;
    
    console.log('Initializing FaceID component');
    setIsInitialized(true);
    loadModelsAndStart();

    return () => {
      console.log('Cleaning up FaceID component');
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      stopCamera();
      cleanupAnimation();
    };
  }, []);

  // Fetch token by name from backend
  const getTokenName = async (name) => {
    if (!name || name === "unknown") {
      console.warn("No recognized face or label is unknown");
      return null;
    }

    try {
      console.log(`Fetching token for user: ${name}`);
      const response = await axios.post('http://localhost:8000/api/auth/get-token-name', { name });
      
      if (response.data && response.data.token) {
        console.log('Successfully retrieved token');
        return response.data;
      } else {
        console.warn('No token received in response');
        return null;
      }
    } catch (error) {
      console.log('Error in getTokenName:', error.response?.data || error.message);
      throw error;
    }
  };

  // Show success animation when face is recognized
  const showSuccessAnimation = (name) => {
    try {
      console.log(`Showing success animation for: ${name}`);
      cleanupAnimation();
      
      if (!videoContainerRef.current || !resultContainerRef.current) {
        console.warn('Video or result container not available');
        return;
      }

      videoContainerRef.current.classList.add('animation-active');

      const animationContainer = document.createElement('div');
      animationContainer.className = 'lottie-animation';
      resultContainerRef.current.appendChild(animationContainer);

  

      currentAnimationRef.current = lottie.loadAnimation({
        container: animationContainer,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/images/1.json'
      });

      currentAnimationRef.current.addEventListener('DOMLoaded', () => {
        const totalFrames = currentAnimationRef.current.getDuration(true);
        currentAnimationRef.current.playSegments([90, totalFrames], true);
      });

      // Handle login success after animation
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(name);
        }
      }, 2000);
    } catch (err) {
      console.log('Error showing success animation:', err);
    }
  };

  // Handle detection failure (unknown face or no face)
  const handleDetectionFailure = (reason) => {
    console.log(`Detection failed: ${reason}`);
    stopCamera();
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    showFailureAnimation(reason);
  };

  // Show failure animation with message
  const showFailureAnimation = (message) => {
    cleanupAnimation();
    
    if (videoContainerRef.current) {
      videoContainerRef.current.classList.add('animation-active');
    }

    const animationContainer = document.createElement('div');
    animationContainer.className = 'lottie-animation';
    resultContainerRef.current.appendChild(animationContainer);

    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    animationContainer.appendChild(messageElement);

    currentAnimationRef.current = lottie.loadAnimation({
      container: animationContainer,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/images/2.json'
    });
    animationContainer.addEventListener('click', () => {
      console.log('Animation clicked - restarting detection');
      resetCamera();
    });

    // Reset counters
    unknownFaceCountRef.current = 0;
    noFaceCountRef.current = 0;
  };

  // Handle recognized face
  const handleRecognizedFace = async (match) => {
    const userName = match.label;
    const distance = match.distance;
  
    try {
      console.log(`Handling recognized face: ${userName}`);
      console.log(`Distance: ${distance}`);
  
      
        unknownFaceCountRef.current += 1;
        console.log(`Unknown face detected (attempt ${unknownFaceCountRef.current}/3)`);
  
        if (unknownFaceCountRef.current >= 3) {
          handleDetectionFailure("Visage non reconnu");
        }
      
  
      const tokenData = await getTokenName(userName);
      if (!tokenData) {
        throw new Error('No token received');
      }
  
      localStorage.setItem('token', tokenData.token);
      console.log('Token stored successfully');
  
      setRecognizedUser(userName);
      showSuccessAnimation(userName);
  
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      stopCamera();
  
    } catch (error) {
      console.log('Error handling recognized face:', error);
      setError('Failed to authenticate recognized face');
    }
  };
  

  // Start camera stream
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        console.log('Camera is already running');
        return;
      }

      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      console.log('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 400, height: 400 } 
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise((resolve, reject) => {
        if (!videoRef.current) return reject(new Error('Video element not available'));
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current.play();
          resolve();
        };
        
        videoRef.current.onerror = (err) => {
          console.log('Video error:', err);
          reject(new Error('Video playback failed'));
        };
      });

      startFaceDetection();
    } catch (err) {
      console.log("Camera error:", err);
      setError("Permission de la caméra refusée ou appareil non disponible");
      showIdleAnimation();
    }
  };

  // Start face detection process (every 3 seconds)
  const startFaceDetection = () => {
    try {
      console.log('Starting face detection (every 3 seconds)');
      cleanupAnimation();

      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }

      detectionIntervalRef.current = setInterval(async () => {
        try {
          if (!videoRef.current || !faceMatcherRef.current) {
            console.warn('Video or face matcher not ready');
            return;
          }

          console.log('Running face detection...');
          const detections = await faceapi
            .detectAllFaces(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptors();

          if (!detections.length) {
            noFaceCountRef.current += 1;
            console.log(`No face detected (attempt ${noFaceCountRef.current}/3)`);
            
            if (noFaceCountRef.current >= 3) {
              handleDetectionFailure("Aucun visage détecté");
            }
            return;
          }

          // Reset no face counter if face detected
          noFaceCountRef.current = 0;

          const bestMatch = faceMatcherRef.current.findBestMatch(detections[0].descriptor);
          console.log('All descriptors:', faceMatcherRef.current);
console.log('Input descriptor:', detections[0].descriptor);

          console.log('Face match result:', {
            label: bestMatch.label,
            distance: bestMatch.distance
          });

          await handleRecognizedFace(bestMatch);
        } catch (err) {
          console.log("Detection error:", err);
        }
      }, 3000); // Detection every 3 seconds
    } catch (err) {
      console.log('Error starting face detection:', err);
      setError('Failed to start face detection');
    }
  };

  // Load face detection models and initialize
  const loadModelsAndStart = async () => {
    try {
      console.log('Loading models...');
      setIsLoading(true);
      setError(null);

      await Promise.all([ 
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      console.log('All models loaded successfully');

      const response = await axios.get('http://localhost:8000/api/auth/users');
      console.log('Users data response:', response.data);

      if (response.data?.data?.length > 0) {
        const labeledDescriptors = response.data.data.map(user => {
          if (!user.descriptor || !user.name) {
            console.warn('Invalid user data:', user);
            return null;
          }
          return new faceapi.LabeledFaceDescriptors(
            user.name,
            [new Float32Array(user.descriptor)]
          );
        }).filter(Boolean);

        if (labeledDescriptors.length > 0) {
          faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.65);
          console.log(`Loaded ${labeledDescriptors.length} user descriptors`);
        } else {
          console.warn('No valid user descriptors found');
          setError('No valid user data available');
          return;
        }
      } else {
        console.warn('No users data received');
        setError('No registered users found');
        return;
      }

      await startCamera();
    } catch (err) {
      console.log("Initialization error:", err);
      
      let errorMessage = err.message;
      if (err.response) {
        console.log('API response error:', err.response.status, err.response.data);
        if (err.response.status === 404) {
          errorMessage = "Endpoint API non trouvé - Vérifiez la configuration du serveur";
        } else if (err.response.status === 401) {
          errorMessage = "Authentification requise";
        }
      }
      setError(errorMessage);
      setIsLoading(false);
      showIdleAnimation();
    }
  };

  const showIdleAnimation = () => {
    cleanupAnimation();
    if (videoContainerRef.current) {
      videoContainerRef.current.classList.remove('animation-active');
    }
    setRecognizedUser(null);
    unknownFaceCountRef.current = 0;
    noFaceCountRef.current = 0;
  };

  return (
    <div className="faceid-container">
      <div id="video-container" ref={videoContainerRef}>
        <video 
          id="video" 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
        />
        <div 
          id="result-container" 
          ref={resultContainerRef}
        />
      </div>
      
      {recognizedUser && (
        <div className="user-greeting">
          <h2>Utilisateur reconnu : {recognizedUser}</h2>
        </div>
      )}
    </div>
  );
}

export default Faceid;