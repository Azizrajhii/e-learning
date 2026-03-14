import { useEffect, useRef } from "react";
import musicTest from "./../music/the-best-jazz-club-in-new-orleans-164472.mp3";

const BackgroundMusic = () => {
  const audioRef = useRef(new Audio(musicTest));

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;

    const enableAudio = () => {
      audio.volume = 0; // Start at 0 volume
      audio.play().catch((error) => console.log("Audio play error:", error));

      let volume = 0;
      const fadeIn = setInterval(() => {
        if (volume < 0.015) { // Target volume
          //volume += 0.005;
          audio.volume = volume;
        } else {
          clearInterval(fadeIn);
        }
      }, 1000); // Adjusts volume every 1000ms

      // Remove event listeners after the first interaction
      window.removeEventListener("scroll", enableAudio);
      window.removeEventListener("keydown", enableAudio);
      window.removeEventListener("click", enableAudio);
    };

    // Add event listeners for user interaction
    window.addEventListener("scroll", enableAudio);
    window.addEventListener("keydown", enableAudio);
    window.addEventListener("click", enableAudio);

    return () => {
      audio.pause();
      window.removeEventListener("scroll", enableAudio);
      window.removeEventListener("keydown", enableAudio);
      window.removeEventListener("click", enableAudio);
    };
  }, []);

  return null; 
};

export default BackgroundMusic;
