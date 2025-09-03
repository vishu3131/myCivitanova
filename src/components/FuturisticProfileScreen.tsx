"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
import {
  User,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Edit3,
  Camera,
  Star,
  Trophy,
  Zap,
  TrendingUp,
  Calendar,
  MapPin,
  Mail,
  Phone,
  ChevronRight,
  Activity,
  Award,
  Target,
  Sparkles,
  Crown,
  Flame,
  BarChart3,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Download,
  Upload,
  Palette,
  Moon,
  Sun,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Wifi,
  Battery,
  Signal,
  X,
  Smile,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { useXPSystem } from '@/hooks/useXPSystem';
import { useBadgeSystem } from './BadgeSystem';
import { FuturisticEditProfileModal } from './FuturisticEditProfileModal';
import { FuturisticUserStats } from './FuturisticUserStats';
import FuturisticBadgeCollection from './FuturisticBadgeCollection';
import FuturisticAdvancedSettings from './FuturisticAdvancedSettings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast'; // Added


// Interfaces
interface UserProfile {
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
  privacy_settings: {
    profile_public: boolean;
    email_public: boolean;
    phone_public: boolean;
  };
  notification_settings: {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
  };
  created_at: string;
  updated_at: string;
  total_xp?: number;
  current_level?: number;
  badges_count?: number;
}

interface UserStats {
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

interface Badge {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at?: string;
}

interface FuturisticProfileScreenProps {
  onClose?: () => void;
}

export function FuturisticProfileScreen({ onClose }: FuturisticProfileScreenProps) {
  const { user, loading, isAuthenticated } = useAuth();
  // State management
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentBadges, setRecentBadges] = useState<Badge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]); // Added
  const [xpHistory, setXpHistory] = useState<any[]>([]); // Added
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true); // Added
  
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'badges' | 'settings'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [xpAnimation, setXpAnimation] = useState<number | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light' | 'neon'>('dark');
  const formatBirthDate = (dateString: string) => {
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

  const formatAddress = (address: string) => {
    if (!address || address.trim().length === 0) return null;
    return address.trim();
  };

  const formatUsername = (username: string) => {
    if (!username || username.trim().length === 0) return null;
    return username.trim().toLowerCase();
  };


  // Hooks
  const { addXP, dailyLogin } = useXPSystem(user?.id);
  const { getUserBadges } = useBadgeSystem(user?.id || '');

  // Load user statistics
  const loadUserStats = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.direct
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      if (data) {
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
      toast.error('Errore nel caricamento delle statistiche utente.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadBadges = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase.direct
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      const earnedBadges = data.map(ub => ({
        ...ub.badges,
        earned_at: ub.earned_at,
      }));

      setBadges(earnedBadges);
      setRecentBadges(earnedBadges.slice(0, 3));
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  }, [user?.id]);

  // Load user profile data
  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Check local cache first
      const cachedProfile = localStorage.getItem(`profile_${user.id}`);
      
      if (cachedProfile) {
        const parsedProfile = JSON.parse(cachedProfile);
        setProfileUser(parsedProfile.data);
        setLastUpdated(new Date(parsedProfile.timestamp).toLocaleString());
        
        // Update in background
        setTimeout(loadFreshProfile, 0);
        return;
      }
      
      await loadFreshProfile();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    
    async function loadFreshProfile() {
      // Get profile data from database
      const { data: profileData, error } = await supabase.direct
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }
      
      // Save to cache with timestamp
      const profileCache = {
        data: profileData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileCache));
      
      setProfileUser(profileData);
      setLastUpdated(new Date().toLocaleString());
      await loadUserStats();
      await loadBadges();
      
      // Daily login XP
      if (dailyLogin) {
        const result = await dailyLogin();
        if (result?.xp_earned > 0) {
          setXpAnimation(result.xp_earned);
          setTimeout(() => setXpAnimation(null), 3000);
        }
      }
    }
  }, [user?.id, dailyLogin, loadUserStats, loadBadges]);

  const loadXPHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase.direct
        .from('xp_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setXpHistory(data);
    } catch (error) {
      console.error('Error loading XP history:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    const checkUser = async () => {
      const session = await supabase.auth.getSession();
      if (session.data.session) {
        const userId = session.data.session.user.id;
        const cachedProfile = localStorage.getItem(`profile_${userId}`);
        
        if (cachedProfile) {
          try {
            const parsed = JSON.parse(cachedProfile);
            const cacheTimestamp = new Date(parsed.timestamp);
            const now = new Date();
            const cacheAge = (now.getTime() - cacheTimestamp.getTime()) / 1000 / 60; // in minutes

            if (cacheAge < 60) { // Cache is valid for 60 minutes
              setProfileUser(parsed.data);
              setLastUpdated(new Date(parsed.timestamp).toLocaleString());
              return;
            }
          } catch (e) {
            console.error("Failed to parse cached profile", e);
            localStorage.removeItem(`profile_${userId}`);
          }
        }
        
        // If no valid cache, fetch from DB
        const { data: userProfile, error } = await supabase.direct
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast.error('Impossibile caricare il profilo.');
        } else if (userProfile) {
          const profileCache = {
            data: userProfile,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(`profile_${userId}`, JSON.stringify(profileCache));
          setProfileUser(userProfile);
          setLastUpdated(new Date().toLocaleString());
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (_event === 'SIGNED_IN' && session?.user) {
          checkUser();
        }
        if (_event === 'SIGNED_OUT') {
          setProfileUser(null);
          setUserStats(null);
          setBadges([]);
          setRecentBadges([]);
          setXpHistory([]);
          if (user?.id) {
            localStorage.removeItem(`profile_${user.id}`);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
      loadBadges();
      loadXPHistory();
    }
  }, [user?.id, loadUserStats, loadBadges, loadXPHistory]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle login/logout button click
  const handleLoginLogoutClick = () => {
    if (user) {
      handleLogout();
    } else {
      window.location.href = '/login';
    }
  };



  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-red-500 to-pink-500';
      case 'moderator': return 'from-purple-500 to-indigo-500';
      case 'staff': return 'from-blue-500 to-cyan-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Authentication state is managed by useAuth hook
  
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-y-auto transition-all duration-500 ${
      theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' :
      theme === 'light' ? 'bg-gradient-to-br from-gray-100 via-blue-100 to-purple-100' :
      'bg-gradient-to-br from-black via-purple-900 to-cyan-900'
    }`}>
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden backdrop-blur-xl bg-white/5 border-b border-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10" />
        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.h1
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
            >
              Profilo Futuristico
            </motion.h1>
            
            <div className="flex items-center gap-4">
              {/* Theme Switcher */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-white/10 rounded-full p-2"
              >
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-full transition-all ${
                    theme === 'dark' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-full transition-all ${
                    theme === 'light' ? 'bg-yellow-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('neon')}
                  className={`p-2 rounded-full transition-all ${
                    theme === 'neon' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Login/Logout Button */}
              <motion.button
                onClick={handleLoginLogoutClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full transition-all ${
                  user 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                }`}
                title={user ? 'Disconnetti' : 'Accedi'}
              >
                {user ? <LogOut className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </motion.button>

              {onClose && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* XP Animation */}
      <AnimatePresence>
        {xpAnimation && (
          <motion.div
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: -50, opacity: 0 }}
            className="fixed top-20 right-6 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="font-bold">+{xpAnimation} XP!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-32">
        {/* Profile Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative mb-6 sm:mb-8"
        >
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
            
            <div className="relative flex flex-col items-center gap-4 sm:gap-6 md:flex-row">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group cursor-pointer touch-manipulation"
                onClick={() => setShowAvatarModal(true)}
              >
                <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${getRoleColor(user?.role || 'user')} p-1`}>
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt="Avatar"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        priority
                      />
                    ) : (
                      <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                    )}
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-cyan-500 rounded-full p-1.5 sm:p-2 shadow-lg"
                >
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </motion.div>
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <motion.h2
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-2"
                >
                  {user?.full_name || 'Utente'}
                </motion.h2>
                {lastUpdated && (
                  <motion.p 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xs text-gray-400 mb-2"
                  >
                    Ultimo aggiornamento: {lastUpdated}
                  </motion.p>
                )}
                
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-center md:justify-start gap-2 mb-4"
                >
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRoleColor(user?.role || 'user')} text-white text-sm font-medium`}>
                    {user?.role === 'admin' ? '👑 Admin' :
                     user?.role === 'moderator' ? '🛡️ Moderatore' :
                     user?.role === 'staff' ? '⭐ Staff' : '👤 Utente'}
                  </div>
                  {user?.is_verified && (
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                  Verificato
                </div>
              )}
            </motion.div>

            {/* Authentication Status */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-4 text-center md:text-left"
            >
              {user ? (
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-300">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span>Accesso Effettuato</span>
                  {user.is_verified ? (
                    <span className="text-green-400 flex items-center gap-1">
                      <Shield className="w-4 h-4" /> Email Verificata
                    </span>
                  ) : (
                    <span className="text-orange-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Email Non Verificata
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-300">
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>Non hai effettuato l&apos;accesso</span>
                </div>
              )}
            </motion.div>

                {user?.bio && (
                  <motion.p
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-300 mb-4"
                  >
                    {user.bio}
                  </motion.p>
                )}

                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400"
                >
                  {formatUsername(user?.username || '') && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      @{formatUsername(user?.username || '')}
                    </div>
                  )}
                  {user?.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  )}
                  {user?.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </div>
                  )}
                  {formatAddress(user?.address || '') && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {formatAddress(user?.address || '')}
                    </div>
                  )}
                  {formatBirthDate(user?.date_of_birth || '') && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Nato il {formatBirthDate(user?.date_of_birth || '')}
                    </div>
                  )}
                  {user?.created_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Membro dal {new Date(user.created_at).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </motion.div>

                {/* XP Bar and City Ranking */}
                {userStats && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 space-y-4"
                  >
                    {/* XP Progress Bar */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-medium">Livello {userStats.current_level}</span>
                          <span className="text-cyan-400 text-sm">{userStats.level_title}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{userStats.total_xp.toLocaleString()} XP</div>
                          <div className="text-gray-400 text-xs">{userStats.xp_to_next_level} al prossimo livello</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${userStats.level_progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-white drop-shadow-lg">
                            {Math.round(userStats.level_progress)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* City Ranking */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-medium">Classifica Cittadina</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                            userStats.rank_position <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                            userStats.rank_position <= 10 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                            userStats.rank_position <= 50 ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white' :
                            'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          }`}>
                            #{userStats.rank_position}
                          </div>
                          {userStats.rank_position <= 3 && (
                            <Crown className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-gray-400">Posizione in città</span>
                        <div className="flex items-center gap-1 text-cyan-400">
                          <MapPin className="w-4 h-4" />
                          <span>Civitanova Marche</span>
                        </div>
                      </div>
                      
                      {/* Weekly/Monthly XP Stats */}
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-cyan-400 font-bold">{userStats.weekly_xp}</div>
                          <div className="text-gray-400 text-xs">XP Settimanali</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-purple-400 font-bold">{userStats.monthly_xp}</div>
                          <div className="text-gray-400 text-xs">XP Mensili</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowEditModal(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all touch-manipulation min-h-[44px] active:brightness-110"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Modifica</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all touch-manipulation min-h-[44px] active:brightness-110"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <div className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 p-1.5 sm:p-2">
            <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Panoramica', shortLabel: 'Home', icon: Activity },
                { id: 'stats', label: 'Statistiche', shortLabel: 'Stats', icon: BarChart3 },
                { id: 'badges', label: 'Badge', shortLabel: 'Badge', icon: Award },
                { id: 'settings', label: 'Impostazioni', shortLabel: 'Config', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all touch-manipulation min-h-[44px] active:bg-white/10 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium truncate">
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : (isMobile ? 0.2 : 0.3) }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* XP Progress */}
                {userStats && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        Livello {userStats.current_level}
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-cyan-400">{userStats.total_xp} XP</div>
                        <div className="text-sm text-gray-400">{userStats.level_title}</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progresso livello</span>
                        <span>{userStats.xp_to_next_level} XP al prossimo livello</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${userStats.level_progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full relative"
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="text-center p-2 sm:p-0">
                        <div className="text-lg sm:text-2xl font-bold text-green-400">{userStats.weekly_xp}</div>
                        <div className="text-xs sm:text-sm text-gray-400">XP Settimanali</div>
                      </div>
                      <div className="text-center p-2 sm:p-0">
                        <div className="text-lg sm:text-2xl font-bold text-blue-400">{userStats.monthly_xp}</div>
                        <div className="text-xs sm:text-sm text-gray-400">XP Mensili</div>
                      </div>
                      <div className="text-center p-2 sm:p-0">
                        <div className="text-lg sm:text-2xl font-bold text-purple-400">#{userStats.rank_position}</div>
                        <div className="text-xs sm:text-sm text-gray-400">Classifica</div>
                      </div>
                      <div className="text-center p-2 sm:p-0">
                        <div className="text-lg sm:text-2xl font-bold text-orange-400">{userStats.streak_days}</div>
                        <div className="text-xs sm:text-sm text-gray-400">Giorni Consecutivi</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Recent Badges */}
                {recentBadges.length > 0 && (
                  <motion.div
                    initial={{ y: prefersReducedMotion ? 0 : (isMobile ? 25 : 50), opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: prefersReducedMotion ? 0 : (isMobile ? 0.05 : 0.1) }}
                    className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Badge Recenti
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {recentBadges.map((badge, index) => (
                        <motion.div
                          key={badge.id}
                          initial={{ scale: prefersReducedMotion ? 1 : 0, rotate: prefersReducedMotion ? 0 : (isMobile ? 0 : -180) }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ 
                            delay: prefersReducedMotion ? 0 : index * (isMobile ? 0.05 : 0.1), 
                            type: prefersReducedMotion ? "tween" : (isMobile ? "tween" : "spring"),
                            duration: prefersReducedMotion ? 0.1 : (isMobile ? 0.3 : undefined)
                          }}
                          whileTap={{ scale: 0.92 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className={`relative p-3 sm:p-4 rounded-xl bg-gradient-to-br ${getRarityColor(badge.rarity)} border border-white/20 overflow-hidden group cursor-pointer touch-manipulation active:brightness-110`}
                        >
                          <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-all" />
                          <div className="relative text-center">
                            <div className="text-3xl sm:text-4xl mb-2">{badge.icon}</div>
                            <div className="font-bold text-white text-sm sm:text-base">{badge.title}</div>
                            <div className="text-xs sm:text-sm text-gray-300 line-clamp-2">{badge.description}</div>
                            {badge.earned_at && (
                              <div className="text-xs text-gray-400 mt-2">
                                {new Date(badge.earned_at).toLocaleDateString('it-IT')}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Quick Stats */}
                <motion.div
                  initial={{ y: prefersReducedMotion ? 0 : (isMobile ? 25 : 50), opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: prefersReducedMotion ? 0 : (isMobile ? 0.1 : 0.2) }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
                >
                  {[
                    { label: 'Badge Totali', shortLabel: 'Badge', value: userStats?.badges_count || 0, icon: Award, color: 'from-yellow-400 to-orange-500' },
                    { label: 'Attività', shortLabel: 'Attività', value: userStats?.activities_completed || 0, icon: Target, color: 'from-green-400 to-emerald-500' },
                    { label: 'Livello', shortLabel: 'Livello', value: userStats?.current_level || 1, icon: TrendingUp, color: 'from-blue-400 to-cyan-500' },
                    { label: 'Streak', shortLabel: 'Streak', value: userStats?.streak_days || 1, icon: Flame, color: 'from-red-400 to-pink-500' }
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ scale: prefersReducedMotion ? 1 : 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          delay: prefersReducedMotion ? 0 : (isMobile ? 0.1 + index * 0.05 : 0.2 + index * 0.1), 
                          type: prefersReducedMotion ? "tween" : (isMobile ? "tween" : "spring"),
                          duration: prefersReducedMotion ? 0.1 : (isMobile ? 0.3 : undefined)
                        }}
                        whileTap={{ scale: 0.92 }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4 text-center cursor-pointer touch-manipulation active:bg-white/10 transition-colors duration-200"
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs sm:text-sm text-gray-400">
                          <span className="sm:hidden">{stat.shortLabel}</span>
                          <span className="hidden sm:inline">{stat.label}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            )}

            {activeTab === 'stats' && user && (
              <FuturisticUserStats 
                userId={user.id} 
                isVisible={activeTab === 'stats'} 
              />
            )}

            {activeTab === 'badges' && user && (
              <FuturisticBadgeCollection userId={user.id} />
            )}

            {activeTab === 'settings' && user && (
              <FuturisticAdvancedSettings 
                userId={user.id} 
                onLogout={handleLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Profile Modal */}
      {user && (
        <FuturisticEditProfileModal
          isOpen={showEditModal}
          user={user}
          onClose={() => setShowEditModal(false)}
          onUserUpdate={async (updatedUser) => {
            // Update both state and cache
            const profileCache = {
              data: updatedUser,
              timestamp: new Date().toISOString()
            };
            localStorage.setItem(`profile_${user?.id}`, JSON.stringify(profileCache));
            
            setProfileUser(updatedUser);
            setLastUpdated(new Date().toLocaleString());
            
            // Add XP for profile update
            if (addXP) {
              const result = await addXP('profile_update', 10);
              if (result) { // Check if result is not null
                setXpAnimation(10); // Use the amount directly for animation
                setTimeout(() => setXpAnimation(null), 3000);
              }
            }
          }}
        />
      )}

      {/* Avatar Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAvatarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">Cambia Avatar</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-cyan-400 transition-all cursor-pointer"
                     onClick={() => document.getElementById('avatar-upload')?.click()}>
                  <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-300 mb-2">Clicca per selezionare un&apos;immagine</p>
                  <p className="text-sm text-gray-500">JPG, PNG, WebP o GIF (max 5MB)</p>
                </div>
                
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && user?.id) {
                      setAvatarUploading(true);
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                        const { error: uploadError } = await supabase.direct.storage
                          .from('avatars')
                          .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: true,
                          });
                        
                        if (uploadError) throw uploadError;

                        const { data: publicUrlData } = supabase.direct.storage
                          .from('avatars')
                          .getPublicUrl(fileName);
                        
                        const newAvatarUrl = publicUrlData.publicUrl;

                        const { data: updatedProfile, error: updateError } = await supabase.direct
                          .from('profiles')
                          .update({ avatar_url: newAvatarUrl })
                          .eq('id', user.id)
                          .select('*')
                          .single();

                        if (updateError) throw updateError;

                        setProfileUser(updatedProfile);
                        toast.success('Avatar aggiornato con successo!');
                      } catch (error) {
                        console.error('Error uploading avatar:', error);
                        toast.error('Errore durante l\'aggiornamento dell\'avatar.');
                      } finally {
                        setAvatarUploading(false);
                        setShowAvatarModal(false);
                      }
                    }
                  }}
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAvatarModal(false)}
                    disabled={avatarUploading}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl font-medium hover:from-gray-500 hover:to-gray-600 transition-all disabled:opacity-50"
                  >
                    Annulla
                  </button>
                  
                  {avatarUploading && (
                    <div className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-medium flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Caricamento...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}

    </div>
  );
}
