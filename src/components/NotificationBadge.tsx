"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { notificationsService } from '@/services/notificationsService';

interface NotificationBadgeProps {
  userId?: string;
  onClick?: () => void;
}

export function NotificationBadge({ userId, onClick }: NotificationBadgeProps) {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const unread = await notificationsService.getUnreadCount(userId);
      setCount(unread);
    } catch (error) {
      console.error('Errore nel caricamento delle notifiche non lette:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [userId, fetchUnreadCount]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-800 transition-colors"
      aria-label="Notifiche"
    >
      <Bell className="w-5 h-5 text-gray-300" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}