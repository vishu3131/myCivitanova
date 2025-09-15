"use client";
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Hooks
import { useProfile } from '@/hooks/useProfile';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/utils/supabaseClient';

// Types
import { UserProfile } from '@/types/profile';

// Direct imports (temporary fix for webpack issue)
import ProfileHeader from './profile/ProfileHeader';
import ProfileTabs from './profile/ProfileTabs';
import ProfileOverview from './profile/ProfileOverview';
import ProfileStats from './profile/ProfileStats';
import ProfileBadges from './profile/ProfileBadges';
import FuturisticAdvancedSettings from './FuturisticAdvancedSettings';
import { FuturisticEditProfileModal } from './FuturisticEditProfileModal';

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

type TabType = 'overview' | 'stats' | 'badges' | 'settings';
interface FuturisticProfileScreenProps {
  onClose?: () => void;
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"
    />
  </div>
);

export function FuturisticProfileScreen({ onClose }: FuturisticProfileScreenProps) {
  // Hooks
  const { user, isLoading, logout } = useUnifiedAuth();
  const {
    profileUser,
    userStats,
    badges,
    recentBadges,
    loading: profileLoading,
    refreshProfile,
    updateProfile
  } = useProfile();
  const isMobile = useIsMobile();
  
  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Handlers
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success('Disconnesso con successo');
    } catch (error) {
      toast.error('Errore durante la disconnessione');
    }
  }, [logout]);
  
  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!user) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      await updateProfile({ avatar_url: publicUrl });
      setShowAvatarModal(false);
      toast.success('Avatar aggiornato con successo!');
    } catch (error) {
      toast.error('Errore durante l\'upload dell\'avatar');
    }
  }, [user, updateProfile]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Not authenticated state -> CTA chiara a Login/Registrazione
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-6">
        <div className="w-full max-w-lg backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Accedi al tuo profilo
          </h1>
          <p className="text-gray-200 mb-6">
            Per visualizzare e modificare le informazioni del tuo profilo, effettua l'accesso o crea un nuovo account.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all"
            >
              Accedi o Registrati
            </Link>
            <Link
              href="/"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
            >
              Torna alla Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen overflow-y-auto transition-all duration-500 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
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
              {user && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all"
                  title="Disconnetti"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              )}
              
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
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Profile Header */}
          {profileUser && (
             <ProfileHeader
               profileUser={profileUser}
               userStats={userStats}
               onEditProfile={() => setShowEditModal(true)}
               onAvatarClick={() => setShowAvatarModal(true)}
             />
           )}
          
          {/* Navigation Tabs */}
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isMobile={isMobile}
          />
          
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: isMobile ? 0.2 : 0.3 }}
            >
              {activeTab === 'overview' && profileUser && (
                 <ProfileOverview
                   profileUser={profileUser}
                   userStats={userStats}
                   recentBadges={recentBadges}
                 />
               )}
              
              {activeTab === 'stats' && user && (
                <ProfileStats
                  userId={user.id}
                  userStats={userStats}
                />
              )}
              
              {activeTab === 'badges' && user && (
                <ProfileBadges
                  userId={user.id}
                  badges={badges}
                  loading={profileLoading}
                />
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
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showEditModal && user && profileUser && (
          <FuturisticEditProfileModal
            isOpen={showEditModal}
            user={profileUser}
            onClose={() => setShowEditModal(false)}
            onUserUpdate={async (updatedUser) => {
              await updateProfile(updatedUser);
              await refreshProfile();
              setShowEditModal(false);
              toast.success('Profilo aggiornato con successo!');
            }}
          />
        )}
        
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
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-cyan-400 transition-all cursor-pointer touch-manipulation min-h-[120px] active:bg-white/5"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-300 mb-2">Clicca per selezionare un'immagine</p>
                  <p className="text-sm text-gray-500">JPG, PNG, WebP o GIF (max 5MB)</p>
                </div>
                
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAvatarModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
