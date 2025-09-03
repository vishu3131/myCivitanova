'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone, 
  Eye, 
  Lock, 
  Download, 
  Trash2, 
  RefreshCw, 
  Moon, 
  Sun, 
  Zap,
  Volume2,
  VolumeX,
  Wifi,
  Battery,
  HelpCircle,
  Info,
  LogOut,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

interface UserSettings {
  theme: 'dark' | 'light' | 'neon';
  language: 'it' | 'en';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    marketing: boolean;
    updates: boolean;
    badges: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private';
    show_activity: boolean;
    show_badges: boolean;
    show_stats: boolean;
    allow_friend_requests: boolean;
  };
  accessibility: {
    high_contrast: boolean;
    large_text: boolean;
    reduce_motion: boolean;
    screen_reader: boolean;
  };
  performance: {
    auto_sync: boolean;
    cache_enabled: boolean;
    low_data_mode: boolean;
    background_refresh: boolean;
  };
}

interface FuturisticAdvancedSettingsProps {
  userId: string;
  onLogout: () => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'it',
  notifications: {
    push: true,
    email: true,
    sms: false,
    marketing: false,
    updates: true,
    badges: true
  },
  privacy: {
    profile_visibility: 'public',
    show_activity: true,
    show_badges: true,
    show_stats: true,
    allow_friend_requests: true
  },
  accessibility: {
    high_contrast: false,
    large_text: false,
    reduce_motion: false,
    screen_reader: false
  },
  performance: {
    auto_sync: true,
    cache_enabled: true,
    low_data_mode: false,
    background_refresh: true
  }
};

function FuturisticAdvancedSettings({ userId, onLogout }: FuturisticAdvancedSettingsProps) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('general');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      // Load from localStorage first
      const localSettings = localStorage.getItem(`userSettings_${userId}`);
      if (localSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(localSettings) });
      }

      // Then, fetch from Supabase to get the latest version
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings_data')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore no rows found error
        throw error;
      }

      if (data) {
        const dbSettings = { ...defaultSettings, ...data.settings_data };
        setSettings(dbSettings);
        localStorage.setItem(`userSettings_${userId}`, JSON.stringify(dbSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      setSaving(true);
      
      // Save to localStorage immediately
      localStorage.setItem(`userSettings_${userId}`, JSON.stringify(newSettings));
      
      // Save to Supabase
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings: newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving settings:', error);
        throw error;
      }

      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Errore nel salvare le impostazioni. Riprova.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const exportUserData = async () => {
    try {
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Get user XP data
      const { data: xpData } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', userId);

      // Get user badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      const exportData = {
        profile,
        xp_data: xpData,
        badges,
        settings,
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `myCivitanova_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowDataExport(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Errore nell&apos;esportazione dei dati.');
    }
  };

  const deleteAccount = async () => {
    try {
      // This would typically involve a more complex process
      // For now, we'll just show a message
      alert('La cancellazione dell&apos;account richiede conferma via email. Contatta il supporto.');
      setShowDeleteAccount(false);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const ToggleSwitch = ({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: (value: boolean) => void; disabled?: boolean }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const sections = [
    { id: 'general', name: 'Generale', icon: Settings },
    { id: 'notifications', name: 'Notifiche', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'accessibility', name: 'Accessibilità', icon: Eye },
    { id: 'performance', name: 'Performance', icon: Zap },
    { id: 'account', name: 'Account', icon: User }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {section.name}
            </button>
          );
        })}
      </div>

      {/* Settings Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
      >
        {/* General Settings */}
        {activeSection === 'general' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Impostazioni Generali</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Tema</div>
                  <div className="text-sm text-gray-400">Scegli l&apos;aspetto dell&apos;app</div>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', 'theme', e.target.value)}
                  className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="dark">Scuro</option>
                  <option value="light">Chiaro</option>
                  <option value="neon">Neon</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Lingua</div>
                  <div className="text-sm text-gray-400">Lingua dell&apos;interfaccia</div>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', 'language', e.target.value)}
                  className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="it">Italiano</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Notifiche</h3>
            
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      {key === 'push' ? 'Notifiche Push' :
                       key === 'email' ? 'Email' :
                       key === 'sms' ? 'SMS' :
                       key === 'marketing' ? 'Marketing' :
                       key === 'updates' ? 'Aggiornamenti App' :
                       key === 'badges' ? 'Nuovi Badge' : key}
                    </div>
                    <div className="text-sm text-gray-400">
                      {key === 'push' ? 'Notifiche istantanee sul dispositivo' :
                       key === 'email' ? 'Notifiche via email' :
                       key === 'sms' ? 'Notifiche via SMS' :
                       key === 'marketing' ? 'Offerte e promozioni' :
                       key === 'updates' ? 'Nuove funzionalità e aggiornamenti' :
                       key === 'badges' ? 'Quando ottieni nuovi badge' : ''}
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={value}
                    onChange={(newValue) => updateSetting('notifications', key, newValue)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeSection === 'privacy' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Privacy</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Visibilità Profilo</div>
                  <div className="text-sm text-gray-400">Chi può vedere il tuo profilo</div>
                </div>
                <select
                  value={settings.privacy.profile_visibility}
                  onChange={(e) => updateSetting('privacy', 'profile_visibility', e.target.value)}
                  className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="public">Pubblico</option>
                  <option value="friends">Solo Amici</option>
                  <option value="private">Privato</option>
                </select>
              </div>

              {Object.entries(settings.privacy).filter(([key]) => key !== 'profile_visibility').map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      {key === 'show_activity' ? 'Mostra Attività' :
                       key === 'show_badges' ? 'Mostra Badge' :
                       key === 'show_stats' ? 'Mostra Statistiche' :
                       key === 'allow_friend_requests' ? 'Richieste Amicizia' : key}
                    </div>
                    <div className="text-sm text-gray-400">
                      {key === 'show_activity' ? 'Attività recente visibile agli altri' :
                       key === 'show_badges' ? 'Badge ottenuti visibili agli altri' :
                       key === 'show_stats' ? 'Statistiche XP visibili agli altri' :
                       key === 'allow_friend_requests' ? 'Permetti richieste di amicizia' : ''}
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={value as boolean}
                    onChange={(newValue) => updateSetting('privacy', key, newValue)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accessibility Settings */}
        {activeSection === 'accessibility' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Accessibilità</h3>
            
            <div className="space-y-4">
              {Object.entries(settings.accessibility).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      {key === 'high_contrast' ? 'Alto Contrasto' :
                       key === 'large_text' ? 'Testo Grande' :
                       key === 'reduce_motion' ? 'Riduci Animazioni' :
                       key === 'screen_reader' ? 'Screen Reader' : key}
                    </div>
                    <div className="text-sm text-gray-400">
                      {key === 'high_contrast' ? 'Aumenta il contrasto per una migliore visibilità' :
                       key === 'large_text' ? 'Aumenta la dimensione del testo' :
                       key === 'reduce_motion' ? 'Riduce le animazioni per sensibilità al movimento' :
                       key === 'screen_reader' ? 'Ottimizza per screen reader' : ''}
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={value}
                    onChange={(newValue) => updateSetting('accessibility', key, newValue)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Settings */}
        {activeSection === 'performance' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Performance</h3>
            
            <div className="space-y-4">
              {Object.entries(settings.performance).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      {key === 'auto_sync' ? 'Sincronizzazione Automatica' :
                       key === 'cache_enabled' ? 'Cache Abilitata' :
                       key === 'low_data_mode' ? 'Modalità Risparmio Dati' :
                       key === 'background_refresh' ? 'Aggiornamento in Background' : key}
                    </div>
                    <div className="text-sm text-gray-400">
                      {key === 'auto_sync' ? 'Sincronizza automaticamente i dati' :
                       key === 'cache_enabled' ? 'Memorizza i dati per accesso più veloce' :
                       key === 'low_data_mode' ? 'Riduce l&apos;uso dei dati mobili' :
                       key === 'background_refresh' ? 'Aggiorna i contenuti in background' : ''}
                     </div>
                   </div>
                  <ToggleSwitch
                    enabled={value}
                    onChange={(newValue) => updateSetting('performance', key, newValue)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Settings */}
        {activeSection === 'account' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Gestione Account</h3>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowDataExport(true)}
                className="w-full flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all text-left"
              >
                <Download className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-white font-medium">Esporta Dati</div>
                  <div className="text-sm text-gray-400">Scarica tutti i tuoi dati</div>
                </div>
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all text-left"
              >
                <LogOut className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-white font-medium">Logout</div>
                  <div className="text-sm text-gray-400">Esci dall&apos;account</div>
                </div>
              </button>

              <button
                onClick={() => setShowDeleteAccount(true)}
                className="w-full flex items-center gap-3 p-4 bg-red-900/20 hover:bg-red-900/30 border border-red-500/20 rounded-xl transition-all text-left"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-red-400 font-medium">Elimina Account</div>
                  <div className="text-sm text-red-400/70">Elimina permanentemente il tuo account</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">Conferma Logout</h3>
              <p className="text-gray-300 mb-6">Sei sicuro di voler uscire dall&apos;account?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-all"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-medium hover:from-red-400 hover:to-red-500 transition-all"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Export Modal */}
      <AnimatePresence>
        {showDataExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDataExport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">Esporta Dati</h3>
              <p className="text-gray-300 mb-6">
                Scaricherai un file JSON contenente tutti i tuoi dati: profilo, statistiche XP, badge e impostazioni.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDataExport(false)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-all"
                >
                  Annulla
                </button>
                <button
                  onClick={exportUserData}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-medium hover:from-cyan-400 hover:to-blue-400 transition-all"
                >
                  Esporta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteAccount(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-6 max-w-md w-full border border-red-500"
            >
              <h3 className="text-xl font-bold text-white mb-4">Elimina Account</h3>
              <p className="text-red-100 mb-6">
                <strong>Attenzione:</strong> Questa azione è irreversibile. Tutti i tuoi dati, badge e statistiche verranno eliminati permanentemente.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-all"
                >
                  Annulla
                </button>
                <button
                  onClick={deleteAccount}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-medium hover:from-red-500 hover:to-red-600 transition-all"
                >
                  Elimina
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saving Indicator */}
      {saving && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
          Salvando...
        </motion.div>
      )}
    </div>
  );
}

export default FuturisticAdvancedSettings;
export { FuturisticAdvancedSettings };