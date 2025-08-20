'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Calendar, Heart, TrendingUp, Gift } from 'lucide-react';
import Link from 'next/link';
import { FundraisingAPI } from '@/lib/fundraisingApi';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';

interface DonorNotification {
  id: string;
  campaign_id: string;
  campaign_title: string;
  update_title: string;
  update_content: string;
  is_milestone: boolean;
  created_at: string;
  read: boolean;
}

interface DonorNotificationsProps {
  className?: string;
}

export default function DonorNotifications({ className = '' }: DonorNotificationsProps) {
  const [notifications, setNotifications] = useState<DonorNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthWithRole();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const notificationsData = await FundraisingAPI.getDonorNotifications(user.id);
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await FundraisingAPI.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await FundraisingAPI.markAllNotificationsAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Ora';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h fa`;
    } else if (diffInHours < 48) {
      return 'Ieri';
    } else {
      return date.toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const getNotificationIcon = (isMillestone: boolean) => {
    if (isMillestone) {
      return <TrendingUp className="w-4 h-4 text-yellow-600" />;
    }
    return <Bell className="w-4 h-4 text-blue-600" />;
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifiche</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Segna tutte come lette
                      </button>
                    )}
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Nessuna notifica</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Ti avviseremo quando ci saranno aggiornamenti
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                          setShowDropdown(false);
                        }}
                      >
                        <Link href={`/raccolta-fondi/${notification.campaign_id}`}>
                          <div className="flex gap-3">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              notification.is_milestone ? 'bg-yellow-100' : 'bg-blue-100'
                            }`}>
                              {getNotificationIcon(notification.is_milestone)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.campaign_title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.update_title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {notification.update_content}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs text-gray-400 ml-2">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(notification.created_at)}
                                </div>
                              </div>
                              
                              {notification.is_milestone && (
                                <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                  <Gift className="w-3 h-3" />
                                  Traguardo raggiunto
                                </span>
                              )}
                              
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <Link 
                    href="/raccolta-fondi"
                    className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setShowDropdown(false)}
                  >
                    Vedi tutte le campagne
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}