// Utility functions per validazione e formattazione dati profilo

import { UserProfile, UserStats, Badge, PrivacySettings, NotificationSettings } from '@/types/profile';

/**
 * Valida e normalizza i dati utente
 */
export const validateUserData = (userData: any): UserProfile | null => {
  if (!userData) return null;
  
  return {
    ...userData,
    full_name: userData.full_name || 'Utente',
    username: userData.username || '',
    bio: userData.bio || '',
    phone: userData.phone || '',
    address: userData.address || '',
    date_of_birth: userData.date_of_birth || '',
    role: userData.role || 'user',
    is_verified: Boolean(userData.is_verified),
    is_active: Boolean(userData.is_active),
    privacy_settings: validatePrivacySettings(userData.privacy_settings),
    notification_settings: validateNotificationSettings(userData.notification_settings)
  };
};

/**
 * Valida le impostazioni di privacy
 */
export const validatePrivacySettings = (settings: any): PrivacySettings => {
  return {
    profile_public: Boolean(settings?.profile_public ?? true),
    email_public: Boolean(settings?.email_public ?? false),
    phone_public: Boolean(settings?.phone_public ?? false)
  };
};

/**
 * Valida le impostazioni di notifica
 */
export const validateNotificationSettings = (settings: any): NotificationSettings => {
  return {
    email_notifications: Boolean(settings?.email_notifications ?? true),
    push_notifications: Boolean(settings?.push_notifications ?? true),
    sms_notifications: Boolean(settings?.sms_notifications ?? false)
  };
};

/**
 * Valida e normalizza le statistiche utente
 */
export const validateUserStats = (statsData: any): UserStats | null => {
  if (!statsData) return null;
  
  return {
    total_xp: Math.max(0, Number(statsData.total_xp) || 0),
    current_level: Math.max(1, Number(statsData.current_level) || 1),
    level_progress: Math.min(100, Math.max(0, Number(statsData.level_progress) || 0)),
    level_title: statsData.level_title || 'Principiante',
    badges_count: Math.max(0, Number(statsData.badges_count) || 0),
    xp_to_next_level: Math.max(0, Number(statsData.xp_to_next_level) || 100),
    weekly_xp: Math.max(0, Number(statsData.weekly_xp) || 0),
    monthly_xp: Math.max(0, Number(statsData.monthly_xp) || 0),
    rank_position: Math.max(1, Number(statsData.rank_position) || 1),
    activities_completed: Math.max(0, Number(statsData.activities_completed) || 0),
    streak_days: Math.max(0, Number(statsData.streak_days) || 0)
  };
};

/**
 * Valida e normalizza i badge
 */
export const validateBadges = (badgesData: any[]): Badge[] => {
  if (!Array.isArray(badgesData)) return [];
  
  return badgesData.filter(badge => 
    badge && 
    typeof badge.id === 'string' && 
    typeof badge.name === 'string' && 
    typeof badge.title === 'string'
  ).map(badge => ({
    ...badge,
    description: badge.description || '',
    icon: badge.icon || '🏆',
    color: badge.color || '#3B82F6',
    rarity: ['common', 'rare', 'epic', 'legendary'].includes(badge.rarity) ? badge.rarity : 'common'
  }));
};

/**
 * Formatta la data di nascita
 */
export const formatBirthDate = (dateString: string): string | null => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return null;
  }
};

/**
 * Formatta l'indirizzo
 */
export const formatAddress = (address: string): string | null => {
  if (!address || address.trim().length === 0) return null;
  return address.trim();
};

/**
 * Formatta lo username
 */
export const formatUsername = (username: string): string | null => {
  if (!username || username.trim().length === 0) return null;
  return username.trim().toLowerCase();
};

/**
 * Ottiene il colore del ruolo
 */
export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin': return 'from-red-500 to-pink-500';
    case 'moderator': return 'from-purple-500 to-indigo-500';
    case 'staff': return 'from-blue-500 to-cyan-500';
    default: return 'from-green-500 to-emerald-500';
  }
};

/**
 * Ottiene il colore della rarità
 */
export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'legendary': return 'from-yellow-400 to-orange-500';
    case 'epic': return 'from-purple-500 to-pink-500';
    case 'rare': return 'from-blue-500 to-cyan-500';
    default: return 'from-gray-500 to-gray-600';
  }
};

/**
 * Crea statistiche di default
 */
export const createDefaultStats = (): UserStats => ({
  total_xp: 0,
  current_level: 1,
  level_progress: 0,
  level_title: 'Principiante',
  badges_count: 0,
  xp_to_next_level: 100,
  weekly_xp: 0,
  monthly_xp: 0,
  rank_position: 999,
  activities_completed: 0,
  streak_days: 0
});