"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useXPSystem } from '@/hooks/useXPSystem';

interface TutorialWidgetProps {
  userId?: string;
  onStartTutorial: () => void;
  className?: string;
}

interface TutorialState {
  isCompleted: boolean;
  completionDate?: string;
  lastViewedSlide?: number;
  totalViews: number;
}

const TUTORIAL_STORAGE_KEY = 'homeTutorialStateV1';
const TUTORIAL_XP_REWARD = 100;

import TutorialIntroVideo from './TutorialIntroVideo';

export function TutorialWidget({ userId, onStartTutorial, className = '' }: TutorialWidgetProps) {
  const [tutorialState, setTutorialState] = useState<TutorialState>({
    isCompleted: false,
    totalViews: 0
  });
  const [shouldPulse, setShouldPulse] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const { addXP } = useXPSystem(userId);

  // Carica stato
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        setTutorialState(state);
        if (!state.isCompleted && state.totalViews === 0) setShouldPulse(true);
      } else {
        setShouldPulse(true);
      }
    } catch (error) {
      console.error('Error loading tutorial state:', error);
    }
  }, []);

  const saveTutorialState = useCallback((newState: Partial<TutorialState>) => {
    setTutorialState(prev => {
      const updated = { ...prev, ...newState };
      try { localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const handleStartTutorial = async () => {
    saveTutorialState({ totalViews: tutorialState.totalViews + 1 });
    setShouldPulse(false);

    if (userId && tutorialState.totalViews === 0) {
      await addXP('tutorial_started', 10, { source: 'tutorial_widget', first_time: true });
    }

    setShowIntroVideo(true);
  };

  const handleVideoComplete = () => {
    setShowIntroVideo(false);
    onStartTutorial();
  };

  const handleVideoSkip = () => {
    setShowIntroVideo(false);
    onStartTutorial();
  };

  const markAsCompleted = useCallback(async () => {
    saveTutorialState({ isCompleted: true, completionDate: new Date().toISOString() });
    if (userId) {
      await addXP('tutorial_completed', TUTORIAL_XP_REWARD, { source: 'tutorial_widget', completion_date: new Date().toISOString() });
    }
  }, [userId, addXP, saveTutorialState]);

  useEffect(() => {
    (window as any).markTutorialCompleted = markAsCompleted;
    return () => { delete (window as any).markTutorialCompleted; };
  }, [markAsCompleted]);
  
  const content = (() => {
    if (tutorialState.isCompleted) return {
      icon: '🎓', title: 'Tutorial', subtitle: 'Completato!', description: 'Rivedi il tutorial',
      gradient: 'from-green-500/20 to-emerald-500/20', borderColor: 'border-green-400/30', pulseColor: 'shadow-green-400/20'
    };
    if (tutorialState.totalViews > 0) return {
      icon: '📚', title: 'Tutorial', subtitle: 'In corso...', description: 'Continua il tutorial',
      gradient: 'from-blue-500/20 to-purple-500/20', borderColor: 'border-blue-400/30', pulseColor: 'shadow-blue-400/20'
    };
    return {
      icon: '✨', title: 'Tutorial', subtitle: 'Nuovo!', description: 'Inizia qui',
      gradient: 'from-violet-500/20 to-fuchsia-500/20', borderColor: 'border-violet-400/30', pulseColor: 'shadow-violet-400/30'
    };
  })();

  return (
    <>
      <div
        className={`relative h-[100px] rounded-[20px] overflow-visible cursor-pointer group 
          bg-gradient-to-br ${content.gradient} backdrop-blur-sm 
          border ${content.borderColor} card-glow 
          hover:scale-105 transition-all duration-300 ${shouldPulse ? 'animate-pulse-tutorial' : ''} ${className}`}
        onClick={handleStartTutorial}
        role="button"
        aria-label={`${content.title} - ${content.description}`}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStartTutorial(); } }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />

        {shouldPulse && (<div className={`absolute inset-0 rounded-[20px] animate-ping ${content.pulseColor} shadow-lg`} />)}

        {!tutorialState.isCompleted && (
          <div className="absolute -top-2 right-2 bg-black/30 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs px-3 py-1.5 rounded-full font-bold shadow-lg z-20">
            +{TUTORIAL_XP_REWARD} XP
          </div>
        )}

        {!tutorialState.isCompleted && tutorialState.totalViews === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-200">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-0.5">
                <polygon points="5,3 19,12 5,21"></polygon>
              </svg>
            </div>
          </div>
        )}

        <div className="relative z-10 p-4 h-full flex flex-col justify-between overflow-hidden rounded-[20px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-lg">{content.icon}</div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">{content.title}</h3>
                <p className="text-white/70 text-xs">{content.subtitle}</p>
              </div>
            </div>
            {tutorialState.isCompleted ? (
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50" />
            ) : tutorialState.totalViews === 0 ? (
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse shadow-lg shadow-violet-400/50" />
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-medium">{content.description}</span>
            <div className="text-white/60 group-hover:text-white transition-colors duration-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-[20px]" />

        <style jsx>{`
          @keyframes pulse-tutorial { 0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.3);} 50% { box-shadow: 0 0 0 8px rgba(139, 92, 246, 0);} }
          .animate-pulse-tutorial { animation: pulse-tutorial 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        `}</style>
      </div>

      {showIntroVideo && (
        <TutorialIntroVideo
          isVisible={showIntroVideo}
          onComplete={handleVideoComplete}
          onSkip={handleVideoSkip}
        />
      )}
    </>
  );
}

export function isTutorialCompleted(): boolean {
  try {
    const saved = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (saved) { const state = JSON.parse(saved); return state.isCompleted || false; }
  } catch (error) { console.error('Error checking tutorial completion:', error); }
  return false;
}

export function resetTutorial(): void {
  try { localStorage.removeItem(TUTORIAL_STORAGE_KEY); window.location.reload(); }
  catch (error) { console.error('Error resetting tutorial:', error); }
}