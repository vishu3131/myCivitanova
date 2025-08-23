"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const INTRO_KEY = 'introUnlockedV1';

export default function IntroOverlay() {
  const [visible, setVisible] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showPasswordScreen, setShowPasswordScreen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if intro should be shown on mount and listen for storage changes
  useEffect(() => {
    const checkIntroStatus = () => {
      const introSeen = localStorage.getItem(INTRO_KEY);
      if (!introSeen) {
        setShowVideo(true);
        setShowPasswordScreen(false);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === INTRO_KEY || e.key === null) {
        checkIntroStatus();
      }
    };

    const handleCustomIntroTrigger = () => {
      checkIntroStatus();
    };

    checkIntroStatus();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('triggerIntro', handleCustomIntroTrigger);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('triggerIntro', handleCustomIntroTrigger);
    };
  }, []);

  const handleSkip = () => {
    try {
      videoRef.current?.pause();
    } catch {}
    setShowVideo(false);
    setShowPasswordScreen(true); // Transition to password screen after video
  };

  const handleEnded = () => handleSkip();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'civitanova2024') {
      localStorage.setItem(INTRO_KEY, 'true');
      setShowPasswordScreen(false);
      setVisible(false);
      setError('');
    } else {
      setError('Password non corretta');
      setPassword('');
    }
  };

  // Show overlay when video or password screen should be displayed
  useEffect(() => {
    if (showVideo || showPasswordScreen) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [showVideo, showPasswordScreen]);

  // Auto-play video when it becomes visible
  useEffect(() => {
    if (showVideo && visible && videoRef.current) {
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (error) {
          console.log('Auto-play failed:', error);
        }
      };
      playVideo();
    }
  }, [showVideo, visible]);

  if (!visible) return null;

  if (showPasswordScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Benvenuto a Civitanova
            </h2>
            <p className="text-gray-600">
              Inserisci la password per accedere
            </p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accedi
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showVideo) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            onEnded={handleEnded}
            playsInline
            muted
          >
            <source src="/intro/nuova-intro.mp4" type="video/mp4" />
            Il tuo browser non supporta il tag video.
          </video>
          
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded hover:bg-opacity-70 transition-opacity"
          >
            Salta
          </button>
        </div>
      </div>
    );
  }

  return null;
}