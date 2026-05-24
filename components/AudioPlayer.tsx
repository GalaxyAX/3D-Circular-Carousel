'use client';

import { useEffect, useRef, useState } from 'react';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current && !hasPlayed) {
        audioRef.current.play().then(() => {
          setHasPlayed(true);
          window.removeEventListener('click', playAudio);
          window.removeEventListener('keydown', playAudio);
          window.removeEventListener('pointerdown', playAudio);
        }).catch((err) => {
          console.log("Autoplay blocked, waiting for user interaction:", err);
        });
      }
    };

    // Try playing immediately
    playAudio();

    // If blocked, wait for user interaction to start playing
    window.addEventListener('click', playAudio, { once: true });
    window.addEventListener('keydown', playAudio, { once: true });
    window.addEventListener('pointerdown', playAudio, { once: true });

    return () => {
      window.removeEventListener('click', playAudio);
      window.removeEventListener('keydown', playAudio);
      window.removeEventListener('pointerdown', playAudio);
    };
  }, [hasPlayed]);

  return (
    <audio ref={audioRef} loop src="/soundtrack.mp3" />
  );
}
