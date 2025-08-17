'use client';

import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  // State for the list of music tracks
  const [tracks, setTracks] = useState<string[]>([]);
  // State to manage the currently playing track index
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  // State to manage the playing status
  const [isPlaying, setIsPlaying] = useState(false);
  // Ref for the audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Effect to fetch the list of music tracks from the API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/api/music');
        const tracks = await response.json();
        setTracks(tracks);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      }
    };

    fetchTracks();
  }, []);

  // Effect to play or pause the audio when isPlaying state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  // Function to toggle play/pause
  const togglePlayPause = () => {
    if (tracks.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  // Function to play the next track
  const playNext = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    setIsPlaying(true);
  };

  // Function to play the previous track
  const playPrev = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(event.target.value);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getTrackName = (trackPath: string) => {
    if (!trackPath) return "Nessuna traccia";
    const parts = trackPath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.(mp3|wav|ogg)$/i, '');
  };


  const MusicIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      className="animate-[spin_10s_linear_infinite]"
    >
      <defs>
        <linearGradient id="noteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C6FF00" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <filter id="noteGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g fill="none" stroke="url(#noteGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" filter="url(#noteGlow)">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3" fill="url(#noteGrad)"></circle>
        <circle cx="18" cy="16" r="3" fill="url(#noteGrad)"></circle>
      </g>
    </svg>
  );

  return (
    <>
      {/* Audio sempre montato per continuare la riproduzione anche a UI chiusa */}
      <audio
        ref={audioRef}
        src={tracks.length > 0 ? tracks[currentTrackIndex] : undefined}
        onEnded={playNext}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="sr-only"
      />
      {/* Pulsante fluttuante per aprire il player */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-16 right-5 z-50 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all touch-manipulation touch-feedback no-select will-change-transform"
        aria-label="Apri o chiudi lettore musicale"
      >
        <MusicIcon />
      </button>

      
      {/* Contenitore del lettore musicale posizionato vicino all'icona */}
      {isOpen && (
        <div
          className="absolute top-32 right-5 z-40"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative transition-all duration-300 transform-origin-top-right animate-pop-in">
            {/* Contenuto del player */}
            {tracks.length > 0 ? (
              <div className="flex flex-col items-center group/he select-none no-select touch-manipulation">
                                <div
                  className="relative z-0 h-16 -mb-2 transition-all duration-200 group-hover/he:h-0"
                >
                  <svg
                    width="128"
                    height="128"
                    viewBox="0 0 128 128"
                    className={`duration-500 border-4 rounded-full shadow-md border-zinc-400 border-spacing-5 ${isPlaying ? 'animate-[spin_3s_linear_infinite]' : ''} transition-all`}
                  >
                    <svg>
                      <rect width="128" height="128" fill="black"></rect>
                      <circle cx="20" cy="20" r="2" fill="white"></circle>
                      <circle cx="40" cy="30" r="2" fill="white"></circle>
                      <circle cx="60" cy="10" r="2" fill="white"></circle>
                      <circle cx="80" cy="40" r="2" fill="white"></circle>
                      <circle cx="100" cy="20" r="2" fill="white"></circle>
                      <circle cx="120" cy="50" r="2" fill="white"></circle>
                      <circle cx="90" cy="30" r="10" fill="white" fillOpacity="0.5"></circle>
                      <circle cx="90" cy="30" r="8" fill="white"></circle>
                      <path
                        d="M0 128 Q32 64 64 128 T128 128"
                        fill="purple"
                        stroke="black"
                        strokeWidth="1"
                      ></path>
                      <path
                        d="M0 128 Q32 48 64 128 T128 128"
                        fill="mediumpurple"
                        stroke="black"
                        strokeWidth="1"
                      ></path>
                      <path
                        d="M0 128 Q32 32 64 128 T128 128"
                        fill="rebeccapurple"
                        stroke="black"
                        strokeWidth="1"
                      ></path>
                      <path
                        d="M0 128 Q16 64 32 128 T64 128"
                        fill="purple"
                        stroke="black"
                        strokeWidth="1"
                      ></path>
                      <path
                        d="M64 128 Q80 64 96 128 T128 128"
                        fill="mediumpurple"
                        stroke="black"
                        strokeWidth="1"
                      ></path>
                    </svg>
                  </svg>
                  <div
                    className="absolute z-10 w-8 h-8 bg-white border-4 rounded-full shadow-sm border-zinc-400 top-12 left-12"
                  ></div>
                </div>
                <div
                  className="z-30 flex flex-col w-40 h-20 transition-all duration-300 bg-white shadow-md group-hover/he:h-40 group-hover/he:w-72 rounded-2xl shadow-zinc-400"
                >
                  <div className="flex flex-row w-full h-0 group-hover/he:h-20">
                    <div
                      className={`relative flex items-center justify-center w-24 h-24 group-hover/he:-top-6 group-hover/he:-left-4 opacity-0 ${isPlaying ? 'group-hover/he:animate-[spin_3s_linear_infinite]' : ''} group-hover/he:opacity-100 transition-all duration-100`}
                    >
                      <svg
                        width="96"
                        height="96"
                        viewBox="0 0 128 128"
                        className="duration-500 border-4 rounded-full shadow-md border-zinc-400 border-spacing-5"
                      >
                        <svg>
                          <rect width="128" height="128" fill="black"></rect>
                          <circle cx="20" cy="20" r="2" fill="white"></circle>
                          <circle cx="40" cy="30" r="2" fill="white"></circle>
                          <circle cx="60" cy="10" r="2" fill="white"></circle>
                          <circle cx="80" cy="40" r="2" fill="white"></circle>
                          <circle cx="100" cy="20" r="2" fill="white"></circle>
                          <circle cx="120" cy="50" r="2" fill="white"></circle>
                          <circle
                            cx="90"
                            cy="30"
                            r="10"
                            fill="white"
                            fillOpacity="0.5"
                          ></circle>
                          <circle cx="90" cy="30" r="8" fill="white"></circle>
                          <path
                            d="M0 128 Q32 64 64 128 T128 128"
                            fill="purple"
                            stroke="black"
                            strokeWidth="1"
                          ></path>
                          <path
                            d="M0 128 Q32 48 64 128 T128 128"
                            fill="mediumpurple"
                            stroke="black"
                            strokeWidth="1"
                          ></path>
                          <path
                            d="M0 128 Q32 32 64 128 T128 128"
                            fill="rebeccapurple"
                            stroke="black"
                            strokeWidth="1"
                          ></path>
                          <path
                            d="M0 128 Q16 64 32 128 T64 128"
                            fill="purple"
                            stroke="black"
                            strokeWidth="1"
                          ></path>
                          <path
                            d="M64 128 Q80 64 96 128 T128 128"
                            fill="mediumpurple"
                            stroke="black"
                            strokeWidth="1"
                          ></path>
                        </svg>
                      </svg>
                      <div
                        className="absolute z-10 w-6 h-6 bg-white border-4 rounded-full shadow-sm border-zinc-400 top-9 left-9"
                      ></div>
                    </div>
                    <div
                      className="flex flex-col justify-center w-full pl-3 -ml-24 overflow-hidden group-hover/he:-ml-3 text-nowrap"
                    >
                      <p className="text-xl font-bold">{getTrackName(tracks[currentTrackIndex])}</p>
                      <p className="text-zinc-600">Civitanova App</p>
                    </div>
                  </div>
                  <div
                    className="flex flex-row mx-3 mt-3 bg-transparent rounded-md min-h-4 group-hover/he:mt-0"
                  >
                    <span
                      className="hidden pl-3 text-sm text-zinc-600 group-hover/he:inline-block"
                    >{formatTime(currentTime)}</span
                    >
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="metallic-range w-24 group-hover/he:w-full flex-grow mx-2 my-auto touch-manipulation"
                    />
                    <span
                      className="hidden pr-3 text-sm text-zinc-600 group-hover/he:inline-block"
                    >{formatTime(duration)}</span
                    >
                  </div>
                  <div className="mx-3 mt-1 mb-1 text-xs font-medium text-zinc-700 truncate">
                    {getTrackName(tracks[currentTrackIndex])}
                  </div>
                  <div
                    className="flex flex-row items-center justify-center flex-grow mx-3 space-x-5"
                  >
                    <div onClick={playPrev} role="button" aria-label="Precedente" tabIndex={0} className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full metallic-btn cursor-pointer touch-feedback touch-manipulation no-select will-change-transform" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { playPrev(); } }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-skip-back"
                      >
                        <polygon points="19 20 9 12 19 4 19 20"></polygon>
                        <line x1="5" y1="19" x2="5" y2="5"></line>
                      </svg>
                    </div>
                    <label
                      htmlFor="playStatus"
                      aria-label="Riproduci/Pausa"
                      className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full metallic-btn cursor-pointer touch-feedback touch-manipulation no-select will-change-transform"
                    >
                      <input
                        type="checkbox"
                        name="playStatus"
                        id="playStatus"
                        className="hidden peer/playStatus"
                        checked={isPlaying}
                        onChange={togglePlayPause}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-play peer-checked/playStatus:hidden"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="hidden feather feather-pause peer-checked/playStatus:inline-block"
                      >
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    </label>
                    <div onClick={playNext} role="button" aria-label="Successivo" tabIndex={0} className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full metallic-btn cursor-pointer touch-feedback touch-manipulation no-select will-change-transform" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { playNext(); } }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-skip-forward"
                      >
                        <polygon points="5 4 15 12 5 20 5 4"></polygon>
                        <line x1="19" y1="5" x2="19" y2="19"></line>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center p-4 bg-white shadow-lg rounded-2xl">
                <p className="text-zinc-600">Nessuna traccia musicale trovata...</p>
                <p className="text-sm text-zinc-400">Aggiungi file in `public/music`</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MusicPlayer;
