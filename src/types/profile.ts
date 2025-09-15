// Interfacce TypeScript condivise per il sistema profilo

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin' | 'staff';
  bio?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  is_active: boolean;
  is_verified: boolean;
  privacy_settings: PrivacySettings;
  notification_settings: NotificationSettings;
  created_at: string;
  updated_at: string;
  total_xp?: number;
  current_level?: number;
  badges_count?: number;
}

export interface PrivacySettings {
  profile_public: boolean;
  email_public: boolean;
  phone_public: boolean;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

export interface UserStats {
  total_xp: number;
  current_level: number;
  level_progress: number;
  level_title: string;
  badges_count: number;
  xp_to_next_level: number;
  weekly_xp: number;
  monthly_xp: number;
  rank_position: number;
  activities_completed: number;
  streak_days: number;
}

export interface Badge {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at?: string;
}

export interface ProfileCache {
  data: UserProfile;
  timestamp: string;
}

export type ProfileTab = 'overview' | 'stats' | 'badges' | 'settings';
export type Theme = 'dark' | 'light' | 'neon';

export interface ProfileScreenProps {
  onClose?: () => void;
}

export interface ProfileHookReturn {
  profileUser: UserProfile | null;
  userStats: UserStats | null;
  badges: Badge[];
  recentBadges: Badge[];
  loading: boolean;
  lastUpdated: string;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}