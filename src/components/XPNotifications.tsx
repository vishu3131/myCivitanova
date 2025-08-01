"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPNotification {
  id: string;
  xp: number;
  levelUp?: boolean;
  newBadges?: string[];
  timestamp: number;
}

interface XPNotificationsProps {
  notifications: XPNotification[];
  onRemove: (id: string) => void;
}

export function XPNotifications({ notifications, onRemove }: XPNotificationsProps) {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-accent to-blue-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm cursor-pointer"
            onClick={() => onRemove(notification.id)}
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✨</span>
              <div className="flex-1">
                <div className="font-bold text-lg">+{notification.xp} XP!</div>
                
                {notification.levelUp && (
                  <div className="text-yellow-200 text-sm font-medium flex items-center">
                    🎉 LEVEL UP!
                  </div>
                )}
                
                {notification.newBadges && notification.newBadges.length > 0 && (
                  <div className="text-yellow-200 text-sm font-medium flex items-center">
                    🏆 Nuovo Badge: {notification.newBadges.join(', ')}
                  </div>
                )}
                
                <div className="text-white/80 text-xs mt-1">
                  Tocca per chiudere
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Componente semplificato per notifiche inline
export function InlineXPNotification({ 
  xp, 
  levelUp, 
  newBadges, 
  className = "" 
}: {
  xp: number;
  levelUp?: boolean;
  newBadges?: string[];
  className?: string;
}) {
  return (
    <div className={`bg-accent text-white px-3 py-2 rounded-lg shadow-lg animate-bounce ${className}`}>
      <div className="flex items-center space-x-2">
        <span>✨</span>
        <span className="font-bold">+{xp} XP!</span>
        {levelUp && <span>🎉</span>}
        {newBadges && newBadges.length > 0 && <span>🏆</span>}
      </div>
    </div>
  );
}

// Hook per creare notifiche XP temporanee nel DOM
export function useXPToast() {
  const showXPToast = (xp: number, options?: {
    levelUp?: boolean;
    newBadges?: string[];
    duration?: number;
  }) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 bg-gradient-to-r from-accent to-blue-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce';
    
    let content = `✨ +${xp} XP!`;
    if (options?.levelUp) content += ' 🎉 LEVEL UP!';
    if (options?.newBadges && options.newBadges.length > 0) {
      content += ` 🏆 ${options.newBadges.join(', ')}`;
    }
    
    toast.textContent = content;
    document.body.appendChild(toast);
    
    const duration = options?.duration || 3000;
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, duration);
  };

  return { showXPToast };
}