"use client";

import React from 'react';

interface TutorialDebugOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function TutorialDebugOverlay({ isVisible, onClose }: TutorialDebugOverlayProps) {
  if (!isVisible) return null;

  const debugInfo = {
    introComplete: typeof window !== 'undefined' ? localStorage.getItem('introUnlockedV1') : null,
    tutorialHidden: typeof window !== 'undefined' ? localStorage.getItem('homeTutorialHiddenV1') : null,
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <div className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Debug Tutorial Flow</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-white/70">Intro Complete:</span>
            <span className="ml-2 font-mono">{debugInfo.introComplete || 'null'}</span>
          </div>
          <div>
            <span className="text-white/70">Tutorial Hidden:</span>
            <span className="ml-2 font-mono">{debugInfo.tutorialHidden || 'null'}</span>
          </div>
          <div>
            <span className="text-white/70">Time:</span>
            <span className="ml-2 font-mono">{debugInfo.timestamp}</span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => {
              localStorage.removeItem('introUnlockedV1');
              localStorage.removeItem('homeTutorialHiddenV1');
              window.location.reload();
            }}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium"
          >
            Reset All & Reload
          </button>
          
          <button
            onClick={() => {
              localStorage.setItem('introUnlockedV1', '1');
              localStorage.removeItem('homeTutorialHiddenV1');
              window.location.reload();
            }}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
          >
            Skip Intro, Show Tutorial
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium"
          >
            Close Debug
          </button>
        </div>
      </div>
    </div>
  );
}