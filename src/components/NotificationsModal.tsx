"use client";

import React, { useState, useEffect } from 'react';
import { X, Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { NotificationsStorage } from '@/utils/profileStorage';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

interface NotificationsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ user, isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchNotifications();
    }
  }, [isOpen, user?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const userNotifications = await NotificationsStorage.getNotifications(user.id);
      setNotifications(userNotifications);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const updatedNotifications = await NotificationsStorage.markAsRead(user.id, notificationIds);
      setNotifications(updatedNotifications);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const updatedNotifications = await NotificationsStorage.deleteNotification(user.id, notificationId);
      setNotifications(updatedNotifications);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Ora';
    if (diffInHours < 24) return `${diffInHours}h fa`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}g fa`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Notifiche</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {unreadCount > 0 && (
          <div className="p-4 border-b border-gray-700">
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Segna tutte come lette</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
              >
                Riprova
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nessuna notifica</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-800/50 transition-colors ${
                    !notification.read ? 'bg-blue-500/5 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${
                            !notification.read ? 'text-white' : 'text-gray-300'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead([notification.id])}
                              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                              title="Segna come letta"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}