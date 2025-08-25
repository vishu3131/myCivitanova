"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Globe,
  Lock,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient.ts';

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
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
}

interface FuturisticEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUserUpdate: (updatedUser: UserProfile) => void;
}

export function FuturisticEditProfileModal({
  isOpen,
  onClose,
  user,
  onUserUpdate
}: FuturisticEditProfileModalProps) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    date_of_birth: user.date_of_birth || '',
    bio: user.bio || ''
  });

  const [privacySettings, setPrivacySettings] = useState(user.privacy_settings);
  const [notificationSettings, setNotificationSettings] = useState(user.notification_settings);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications'>('profile');
  const [showSuccess, setShowSuccess] = useState(false);

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Il nome è obbligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Formato email non valido';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Formato telefono non valido';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'La bio non può superare i 500 caratteri';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          address: formData.address || null,
          date_of_birth: formData.date_of_birth || null,
          bio: formData.bio || null,
          privacy_settings: privacySettings,
          notification_settings: notificationSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update email if changed (requires auth update)
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });

        if (emailError) {
          console.warn('Email update requires verification:', emailError.message);
          // Don't throw error, just warn user
        }
      }

      // Update local storage if current user
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const currentUser = JSON.parse(storedUser);
        if (currentUser.id === user.id) {
          const updatedUser = {
            ...currentUser,
            ...formData,
            privacy_settings: privacySettings,
            notification_settings: notificationSettings,
            updated_at: new Date().toISOString()
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      }

      // Update parent component
      const updatedUser: UserProfile = {
        ...user,
        ...formData,
        privacy_settings: privacySettings,
        notification_settings: notificationSettings,
        updated_at: new Date().toISOString()
      };
      
      onUserUpdate(updatedUser);
      
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Errore durante il salvataggio. Riprova.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle privacy setting changes
  const handlePrivacyChange = (setting: keyof typeof privacySettings, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
  };

  // Handle notification setting changes
  const handleNotificationChange = (setting: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : (isMobile ? 0.2 : 0.3) }}
          onClick={(e) => e.stopPropagation()}
          className="backdrop-blur-xl bg-gradient-to-br from-gray-900/90 to-blue-900/90 rounded-2xl sm:rounded-3xl border border-white/20 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        >
          {/* Success Animation */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="bg-green-500 rounded-full p-6"
                >
                  <Check className="w-12 h-12 text-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="relative p-4 sm:p-6 border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10" />
            <div className="relative flex items-center justify-between">
              <motion.h2
                initial={{ x: prefersReducedMotion ? 0 : (isMobile ? -10 : -20), opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : (isMobile ? 0.05 : 0.1) }}
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
              >
                Modifica Profilo
              </motion.h2>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.85 }}
                onClick={onClose}
                className="p-2 sm:p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-white/30"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-3 sm:px-6 pt-3 sm:pt-4">
            <div className="flex gap-2 bg-white/5 rounded-xl p-1">
              {[
                { id: 'profile', label: 'Profilo', icon: User },
                { id: 'privacy', label: 'Privacy', icon: Shield },
                { id: 'notifications', label: 'Notifiche', icon: Bell }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2 rounded-lg font-medium transition-all touch-manipulation min-h-[44px] active:bg-white/10 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm hidden xs:inline sm:inline">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-6 overflow-y-auto max-h-[50vh] sm:max-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ x: prefersReducedMotion ? 0 : (isMobile ? 10 : 20), opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: prefersReducedMotion ? 0 : (isMobile ? -10 : -20), opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0.1 : (isMobile ? 0.15 : 0.2) }}
              >
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* General Error */}
                    {errors.general && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-300">{errors.general}</span>
                      </motion.div>
                    )}

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nome Completo *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 sm:py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all min-h-[48px] touch-manipulation ${
                            errors.full_name
                              ? 'border-red-500 focus:ring-red-500/50'
                              : 'border-white/20 focus:ring-cyan-500/50 focus:border-cyan-500'
                          }`}
                          placeholder="Inserisci il tuo nome completo"
                        />
                      </div>
                      {errors.full_name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-1"
                        >
                          {errors.full_name}
                        </motion.p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 sm:py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all min-h-[48px] touch-manipulation ${
                            errors.email
                              ? 'border-red-500 focus:ring-red-500/50'
                              : 'border-white/20 focus:ring-cyan-500/50 focus:border-cyan-500'
                          }`}
                          placeholder="Inserisci la tua email"
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-1"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Telefono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 sm:py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all min-h-[48px] touch-manipulation ${
                            errors.phone
                              ? 'border-red-500 focus:ring-red-500/50'
                              : 'border-white/20 focus:ring-cyan-500/50 focus:border-cyan-500'
                          }`}
                          placeholder="Inserisci il tuo numero di telefono"
                        />
                      </div>
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm mt-1"
                        >
                          {errors.phone}
                        </motion.p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Indirizzo
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                          placeholder="Inserisci il tuo indirizzo"
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Data di Nascita
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={4}
                          className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                            errors.bio
                              ? 'border-red-500 focus:ring-red-500/50'
                              : 'border-white/20 focus:ring-cyan-500/50 focus:border-cyan-500'
                          }`}
                          placeholder="Racconta qualcosa di te..."
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        {errors.bio && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm"
                          >
                            {errors.bio}
                          </motion.p>
                        )}
                        <span className={`text-sm ml-auto ${
                          formData.bio.length > 450 ? 'text-red-400' :
                          formData.bio.length > 400 ? 'text-yellow-400' : 'text-gray-400'
                        }`}>
                          {formData.bio.length}/500
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-white mb-2">Impostazioni Privacy</h3>
                      <p className="text-gray-400 text-sm">Controlla chi può vedere le tue informazioni</p>
                    </div>

                    {[
                      {
                        key: 'profile_public' as keyof typeof privacySettings,
                        label: 'Profilo Pubblico',
                        description: 'Permetti ad altri utenti di vedere il tuo profilo',
                        icon: Globe
                      },
                      {
                        key: 'email_public' as keyof typeof privacySettings,
                        label: 'Email Pubblica',
                        description: 'Mostra la tua email nel profilo pubblico',
                        icon: Mail
                      },
                      {
                        key: 'phone_public' as keyof typeof privacySettings,
                        label: 'Telefono Pubblico',
                        description: 'Mostra il tuo numero di telefono nel profilo pubblico',
                        icon: Phone
                      }
                    ].map((setting) => {
                      const Icon = setting.icon;
                      return (
                        <motion.div
                          key={setting.key}
                          initial={{ x: prefersReducedMotion ? 0 : (isMobile ? -10 : -20), opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: prefersReducedMotion ? 0 : (isMobile ? 0.05 : 0.1) }}
                          className="bg-white/5 rounded-xl p-4 border border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Icon className="w-5 h-5 text-cyan-400" />
                              </div>
                              <div>
                                <div className="font-medium text-white">{setting.label}</div>
                                <div className="text-sm text-gray-400">{setting.description}</div>
                              </div>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePrivacyChange(setting.key, !privacySettings[setting.key])}
                              className={`relative w-12 h-6 rounded-full transition-all ${
                                privacySettings[setting.key]
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                  : 'bg-gray-600'
                              }`}
                            >
                              <motion.div
                                animate={{
                                  x: privacySettings[setting.key] ? 24 : 2
                                }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                              />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white mb-2">Notifiche</h3>
                      <p className="text-gray-400 text-sm">Scegli come ricevere le notifiche</p>
                    </div>

                    {[
                      {
                        key: 'email_notifications' as keyof typeof notificationSettings,
                        label: 'Notifiche Email',
                        description: 'Ricevi notifiche via email',
                        icon: Mail
                      },
                      {
                        key: 'push_notifications' as keyof typeof notificationSettings,
                        label: 'Notifiche Push',
                        description: 'Ricevi notifiche push sul dispositivo',
                        icon: Bell
                      },
                      {
                        key: 'sms_notifications' as keyof typeof notificationSettings,
                        label: 'Notifiche SMS',
                        description: 'Ricevi notifiche via SMS',
                        icon: Phone
                      }
                    ].map((setting) => {
                      const Icon = setting.icon;
                      return (
                        <motion.div
                          key={setting.key}
                          initial={{ x: prefersReducedMotion ? 0 : (isMobile ? -10 : -20), opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: prefersReducedMotion ? 0 : (isMobile ? 0.05 : 0.1) }}
                          className="bg-white/5 rounded-xl p-4 border border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Icon className="w-5 h-5 text-purple-400" />
                              </div>
                              <div>
                                <div className="font-medium text-white">{setting.label}</div>
                                <div className="text-sm text-gray-400">{setting.description}</div>
                              </div>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleNotificationChange(setting.key, !notificationSettings[setting.key])}
                              className={`relative w-12 h-6 rounded-full transition-all ${
                                notificationSettings[setting.key]
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                  : 'bg-gray-600'
                              }`}
                            >
                              <motion.div
                                animate={{
                                  x: notificationSettings[setting.key] ? 24 : 2
                                }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                              />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-6 border-t border-white/10 bg-white/5">
            <div className="flex gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 sm:py-3 rounded-xl font-medium transition-all touch-manipulation min-h-[48px] flex items-center justify-center active:bg-gray-400"
              >
                <span className="text-sm sm:text-base">Annulla</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white py-3 sm:py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation min-h-[48px] active:brightness-110"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm sm:text-base">Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="text-sm sm:text-base hidden xs:inline">Salva Modifiche</span>
                    <span className="text-sm sm:text-base xs:hidden">Salva</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}