// Sistema di storage locale avanzato per simulare il backend
// In produzione sostituire con chiamate API reali

export interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  birthdate?: string;
  city?: string;
  bio?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  // Privacy settings
  privacy_mode: boolean;
  location_sharing: boolean;
  profile_visibility: 'public' | 'friends' | 'private';
  show_activity: boolean;
  show_stats: boolean;
  allow_messages: boolean;
  // Notification settings
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  notifications_sound: boolean;
  app_badge: boolean;
  // App settings
  theme: 'dark' | 'light' | 'system';
  language: string;
  font_size: 'small' | 'medium' | 'large';
  sound_effects: boolean;
  haptic_feedback: boolean;
  auto_updates: boolean;
  data_saver: boolean;
  high_contrast: boolean;
  reduce_motion: boolean;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

// Storage keys
const STORAGE_KEYS = {
  PROFILE: 'user_profile_',
  SETTINGS: 'user_settings_',
  NOTIFICATIONS: 'user_notifications_',
  TICKETS: 'user_tickets_'
};

// Default settings
const DEFAULT_SETTINGS: Omit<UserSettings, 'user_id' | 'updated_at'> = {
  privacy_mode: false,
  location_sharing: true,
  profile_visibility: 'public',
  show_activity: true,
  show_stats: true,
  allow_messages: true,
  notifications_enabled: true,
  email_notifications: true,
  push_notifications: true,
  marketing_emails: false,
  notifications_sound: true,
  app_badge: true,
  theme: 'dark',
  language: 'it',
  font_size: 'medium',
  sound_effects: true,
  haptic_feedback: true,
  auto_updates: true,
  data_saver: false,
  high_contrast: false,
  reduce_motion: false
};

// Default notifications
const getDefaultNotifications = (userId: string): Notification[] => [
  {
    id: `${userId}_welcome`,
    title: '🎉 Benvenuto in MyCivitanova!',
    message: 'Grazie per esserti registrato alla nostra app. Esplora tutte le funzionalità disponibili per scoprire la città.',
    type: 'success',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: `${userId}_events`,
    title: '📅 Nuovi eventi disponibili',
    message: 'Sono stati aggiunti nuovi eventi nella tua zona. Controlla la sezione eventi per maggiori dettagli.',
    type: 'info',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: `${userId}_parking`,
    title: '🅿️ Parcheggi disponibili',
    message: 'Ci sono posti liberi nei parcheggi del centro. Controlla la mappa per i dettagli.',
    type: 'info',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: `${userId}_update`,
    title: '🔄 App aggiornata',
    message: 'L\'app è stata aggiornata con nuove funzionalità e miglioramenti delle prestazioni.',
    type: 'success',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

// Profile operations
export const ProfileStorage = {
  // Get user profile
  getProfile: async (userId: string): Promise<UserProfile | null> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula latenza
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE + userId);
    return stored ? JSON.parse(stored) : null;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simula latenza
    
    const existing = await ProfileStorage.getProfile(userId) || {
      id: userId,
      display_name: 'Utente Demo',
      email: 'demo@mycivitanova.it',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.PROFILE + userId, JSON.stringify(updated));
    return updated;
  }
};

// Settings operations
export const SettingsStorage = {
  // Get user settings
  getSettings: async (userId: string): Promise<UserSettings> => {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simula latenza
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS + userId);
    
    if (stored) {
      return JSON.parse(stored);
    }

    // Create default settings
    const defaultSettings: UserSettings = {
      user_id: userId,
      ...DEFAULT_SETTINGS,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS + userId, JSON.stringify(defaultSettings));
    return defaultSettings;
  },

  // Update user settings
  updateSettings: async (userId: string, updates: Partial<UserSettings>): Promise<UserSettings> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simula latenza
    
    const existing = await SettingsStorage.getSettings(userId);
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS + userId, JSON.stringify(updated));
    return updated;
  }
};

// Notifications operations
export const NotificationsStorage = {
  // Get user notifications
  getNotifications: async (userId: string): Promise<Notification[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simula latenza
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS + userId);
    
    if (stored) {
      const notifications = JSON.parse(stored);
      return notifications.sort((a: Notification, b: Notification) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    // Create default notifications
    const defaultNotifications = getDefaultNotifications(userId);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS + userId, JSON.stringify(defaultNotifications));
    return defaultNotifications;
  },

  // Mark notifications as read
  markAsRead: async (userId: string, notificationIds: string[]): Promise<Notification[]> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simula latenza
    
    const notifications = await NotificationsStorage.getNotifications(userId);
    const updated = notifications.map(notif => 
      notificationIds.includes(notif.id) ? { ...notif, read: true } : notif
    );

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS + userId, JSON.stringify(updated));
    return updated;
  },

  // Delete notification
  deleteNotification: async (userId: string, notificationId: string): Promise<Notification[]> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simula latenza
    
    const notifications = await NotificationsStorage.getNotifications(userId);
    const updated = notifications.filter(notif => notif.id !== notificationId);

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS + userId, JSON.stringify(updated));
    return updated;
  },

  // Add new notification
  addNotification: async (userId: string, notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification[]> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simula latenza
    
    const notifications = await NotificationsStorage.getNotifications(userId);
    const newNotification: Notification = {
      ...notification,
      id: `${userId}_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    const updated = [newNotification, ...notifications];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS + userId, JSON.stringify(updated));
    return updated;
  }
};

// Support tickets operations
export const SupportStorage = {
  // Get user tickets
  getTickets: async (userId: string): Promise<SupportTicket[]> => {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simula latenza
    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS + userId);
    
    if (stored) {
      const tickets = JSON.parse(stored);
      return tickets.sort((a: SupportTicket, b: SupportTicket) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return [];
  },

  // Create support ticket
  createTicket: async (userId: string, ticket: Omit<SupportTicket, 'id' | 'status' | 'created_at'>): Promise<SupportTicket> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simula latenza
    
    const tickets = await SupportStorage.getTickets(userId);
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'open',
      created_at: new Date().toISOString()
    };

    const updated = [newTicket, ...tickets];
    localStorage.setItem(STORAGE_KEYS.TICKETS + userId, JSON.stringify(updated));
    
    // Simula notifica di conferma
    await NotificationsStorage.addNotification(userId, {
      title: '📧 Richiesta di supporto inviata',
      message: `La tua richiesta "${ticket.subject}" è stata ricevuta. Ti risponderemo entro 24 ore.`,
      type: 'success',
      read: false
    });

    return newTicket;
  }
};

// Utility functions
export const StorageUtils = {
  // Clear all user data
  clearUserData: (userId: string) => {
    localStorage.removeItem(STORAGE_KEYS.PROFILE + userId);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS + userId);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS + userId);
    localStorage.removeItem(STORAGE_KEYS.TICKETS + userId);
  },

  // Export user data
  exportUserData: async (userId: string) => {
    const profile = await ProfileStorage.getProfile(userId);
    const settings = await SettingsStorage.getSettings(userId);
    const notifications = await NotificationsStorage.getNotifications(userId);
    const tickets = await SupportStorage.getTickets(userId);

    return {
      profile,
      settings,
      notifications,
      tickets,
      exported_at: new Date().toISOString()
    };
  }
};