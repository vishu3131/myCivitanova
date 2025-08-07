"use client";

import React, { useState, useEffect } from 'react';
import { NotificationsStorage } from '@/utils/profileStorage';

interface NotificationBadgeProps {
  userId: string;
  className?: string;
}

export function NotificationBadge({ userId, className = "" }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      
      // Aggiorna ogni 30 secondi
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchUnreadCount = async () => {
    try {
      const notifications = await NotificationsStorage.getNotifications(userId);
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Errore nel caricamento delle notifiche:', error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <span className={`
      absolute -top-1 -right-1 
      bg-red-500 text-white text-xs 
      rounded-full min-w-[18px] h-[18px] 
      flex items-center justify-center 
      font-medium shadow-lg
      animate-pulse
      ${className}
    `}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}