import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const Capture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Charger les modèles face-api.js
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
        console.log('Modèles chargés ✅');
      } catch (error) {
        console.error('Erreur lors du chargement des modèles :', error);
      }
    };

    loadModels();
  }, []);

  // Ouvrir la caméra
  useEffect(() => {
    const openCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
  
          // Attendre que la vidéo soit prête
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      } catch (err) {
        console.error("Erreur lors de l'ouverture de la caméra :", err);
      }
    };
  
    openCamera();
  
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  

  // Fonction pour envoyer le descripteur et le nom à la route /update-aziz
  const sendToServer = async (email, descriptor) => {
    try {
      if (!descriptor || descriptor.length !== 128) {
        console.error('Le descripteur est invalide ou n\'a pas la bonne longueur');
        return;
      }
  
      const response = await fetch('http://localhost:5000/api/user/updateDescriptor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          descriptor,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        console.log('Utilisateur mis à jour avec succès', data);
      } else {
        console.error('Erreur mise à jour', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du descripteur au serveur:', error);
    }
  };
  
  

  // Capturer et analyser le visage
  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !modelsLoaded) return;
  
    // Dessiner dans le canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("Vidéo non prête ou dimensions invalides");
      return;
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // Utiliser face-api.js pour détecter le visage et obtenir un descripteur
    const detection = await faceapi
      .detectSingleFace(canvas)
      .withFaceLandmarks()
      .withFaceDescriptor();
  
    // Vérifier si un visage a été détecté
    if (detection && detection.descriptor) {
      console.log('Descripteur du visage :', detection.descriptor);
  
      // Convertir Float32Array en un tableau ordinaire
      const descriptorArray = Array.from(detection.descriptor);  // ou detection.descriptor.slice()
  
      // Vérifier si le descripteur a 128 valeurs
      if (descriptorArray.length === 128) {
        const email = "admin10@soprastaff.com";  // Remplace par le nom approprié
        sendToServer(email, descriptorArray);  // Envoie à la route /update-aziz
      } else {
        console.error('Descripteur invalide, longueur incorrecte');
      }
    } else {
      console.log('Aucun visage détecté ou descripteur manquant');
    }
  };
  
  
  

  return (
    <div className="flex flex-col items-center gap-4">
      <video ref={videoRef} autoPlay muted className="rounded shadow-lg w-full max-w-md" />
      <button
        onClick={handleCapture}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Capturer et détecter
      </button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Capture;
