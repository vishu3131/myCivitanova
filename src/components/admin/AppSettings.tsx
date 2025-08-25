"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  X, 
  Globe, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Mail,
  Smartphone,
  Eye,
  Lock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient.ts';

interface AppSettingsData {
  general: {
    app_name: string;
    app_description: string;
    app_version: string;
    maintenance_mode: boolean;
    registration_enabled: boolean;
    default_language: string;
    timezone: string;
  };
  notifications: {
    push_notifications_enabled: boolean;
    email_notifications_enabled: boolean;
    sms_notifications_enabled: boolean;
    notification_frequency: 'immediate' | 'daily' | 'weekly';
    admin_notifications: boolean;
  };
  security: {
    password_min_length: number;
    require_email_verification: boolean;
    session_timeout_minutes: number;
    max_login_attempts: number;
    two_factor_enabled: boolean;
    api_rate_limit: number;
  };
  content: {
    auto_approve_news: boolean;
    auto_approve_comments: boolean;
    content_moderation_enabled: boolean;
    max_file_size_mb: number;
    allowed_file_types: string[];
  };
  gamification: {
    xp_system_enabled: boolean;
    badge_system_enabled: boolean;
    leaderboard_enabled: boolean;
    daily_login_bonus: number;
    level_up_bonus: number;
  };
  integrations: {
    google_analytics_id: string;
    facebook_app_id: string;
    twitter_api_key: string;
    weather_api_key: string;
    maps_api_key: string;
  };
}

interface AppSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
}

export function AppSettings({ isOpen, onClose, currentUser }: AppSettingsProps) {
  const [settings, setSettings] = useState<AppSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'content' | 'gamification' | 'integrations'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadSettings();
    }
  }, [isOpen, currentUser]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // In un'app reale, questi dati verrebbero dal database
      // Per ora uso impostazioni demo
      const mockSettings: AppSettingsData = {
        general: {
          app_name: 'MyCivitanova',
          app_description: 'App ufficiale della città di Civitanova Marche',
          app_version: '1.2.3',
          maintenance_mode: false,
          registration_enabled: true,
          default_language: 'it',
          timezone: 'Europe/Rome'
        },
        notifications: {
          push_notifications_enabled: true,
          email_notifications_enabled: true,
          sms_notifications_enabled: false,
          notification_frequency: 'immediate',
          admin_notifications: true
        },
        security: {
          password_min_length: 8,
          require_email_verification: true,
          session_timeout_minutes: 60,
          max_login_attempts: 5,
          two_factor_enabled: false,
          api_rate_limit: 100
        },
        content: {
          auto_approve_news: false,
          auto_approve_comments: false,
          content_moderation_enabled: true,
          max_file_size_mb: 10,
          allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
        },
        gamification: {
          xp_system_enabled: true,
          badge_system_enabled: true,
          leaderboard_enabled: true,
          daily_login_bonus: 10,
          level_up_bonus: 100
        },
        integrations: {
          google_analytics_id: 'GA-XXXXXXXXX',
          facebook_app_id: '',
          twitter_api_key: '',
          weather_api_key: 'your-weather-api-key',
          maps_api_key: 'your-maps-api-key'
        }
      };

      await new Promise(resolve => setTimeout(resolve, 500));
      setSettings(mockSettings);
    } catch (error) {
      console.error('Errore nel caricamento delle impostazioni:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      
      // In un'app reale, qui salveresti le impostazioni nel database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      setSaveMessage({ type: 'success', message: 'Impostazioni salvate con successo!' });
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Errore nel salvataggio delle impostazioni:', error);
      setSaveMessage({ type: 'error', message: 'Errore nel salvataggio delle impostazioni' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof AppSettingsData, key: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  // Verifica permessi
  const hasPermission = currentUser && ['admin'].includes(currentUser.role);

  if (!isOpen) return null;

  if (!hasPermission) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Accesso Negato</h2>
          <p className="text-gray-400 mb-6">Solo gli amministratori possono accedere alle impostazioni</p>
          <button 
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg font-medium transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] border border-gray-700 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Impostazioni App
            </h2>
            <p className="text-gray-400">Configura le impostazioni generali dell&apos;applicazione</p>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${
            saveMessage.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {saveMessage.message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700 overflow-x-auto">
          {[
            { id: 'general', label: 'Generale', icon: <Globe className="w-4 h-4" /> },
            { id: 'notifications', label: 'Notifiche', icon: <Bell className="w-4 h-4" /> },
            { id: 'security', label: 'Sicurezza', icon: <Shield className="w-4 h-4" /> },
            { id: 'content', label: 'Contenuti', icon: <Eye className="w-4 h-4" /> },
            { id: 'gamification', label: 'Gamification', icon: <Palette className="w-4 h-4" /> },
            { id: 'integrations', label: 'Integrazioni', icon: <Database className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-2 text-white">Caricamento impostazioni...</span>
            </div>
          ) : settings ? (
            <div>
              {activeTab === 'general' && (
                <GeneralSettings 
                  settings={settings.general} 
                  onUpdate={(key, value) => updateSettings('general', key, value)}
                />
              )}
              
              {activeTab === 'notifications' && (
                <NotificationSettings 
                  settings={settings.notifications} 
                  onUpdate={(key, value) => updateSettings('notifications', key, value)}
                />
              )}
              
              {activeTab === 'security' && (
                <SecuritySettings 
                  settings={settings.security} 
                  onUpdate={(key, value) => updateSettings('security', key, value)}
                />
              )}
              
              {activeTab === 'content' && (
                <ContentSettings 
                  settings={settings.content} 
                  onUpdate={(key, value) => updateSettings('content', key, value)}
                />
              )}
              
              {activeTab === 'gamification' && (
                <GamificationSettings 
                  settings={settings.gamification} 
                  onUpdate={(key, value) => updateSettings('gamification', key, value)}
                />
              )}
              
              {activeTab === 'integrations' && (
                <IntegrationSettings 
                  settings={settings.integrations} 
                  onUpdate={(key, value) => updateSettings('integrations', key, value)}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>Errore nel caricamento delle impostazioni</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Componenti per le diverse sezioni di impostazioni

function GeneralSettings({ settings, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Impostazioni Generali</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nome App</label>
            <input
              type="text"
              value={settings.app_name}
              onChange={(e) => onUpdate('app_name', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Versione</label>
            <input
              type="text"
              value={settings.app_version}
              onChange={(e) => onUpdate('app_version', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">Descrizione App</label>
            <textarea
              value={settings.app_description}
              onChange={(e) => onUpdate('app_description', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Lingua Predefinita</label>
            <select
              value={settings.default_language}
              onChange={(e) => onUpdate('default_language', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Fuso Orario</label>
            <select
              value={settings.timezone}
              onChange={(e) => onUpdate('timezone', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Europe/Rome">Europe/Rome</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenance_mode"
              checked={settings.maintenance_mode}
              onChange={(e) => onUpdate('maintenance_mode', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="maintenance_mode" className="text-white">
              Modalità Manutenzione
            </label>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="registration_enabled"
              checked={settings.registration_enabled}
              onChange={(e) => onUpdate('registration_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="registration_enabled" className="text-white">
              Registrazione Abilitata
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ settings, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Impostazioni Notifiche</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="push_notifications"
              checked={settings.push_notifications_enabled}
              onChange={(e) => onUpdate('push_notifications_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="push_notifications" className="text-white">
              Notifiche Push Abilitate
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="email_notifications"
              checked={settings.email_notifications_enabled}
              onChange={(e) => onUpdate('email_notifications_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="email_notifications" className="text-white">
              Notifiche Email Abilitate
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sms_notifications"
              checked={settings.sms_notifications_enabled}
              onChange={(e) => onUpdate('sms_notifications_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="sms_notifications" className="text-white">
              Notifiche SMS Abilitate
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="admin_notifications"
              checked={settings.admin_notifications}
              onChange={(e) => onUpdate('admin_notifications', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="admin_notifications" className="text-white">
              Notifiche Admin
            </label>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Frequenza Notifiche</label>
          <select
            value={settings.notification_frequency}
            onChange={(e) => onUpdate('notification_frequency', e.target.value)}
            className="w-full max-w-xs px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="immediate">Immediata</option>
            <option value="daily">Giornaliera</option>
            <option value="weekly">Settimanale</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings({ settings, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Impostazioni Sicurezza</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Lunghezza Minima Password</label>
            <input
              type="number"
              value={settings.password_min_length}
              onChange={(e) => onUpdate('password_min_length', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="6"
              max="20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Timeout Sessione (minuti)</label>
            <input
              type="number"
              value={settings.session_timeout_minutes}
              onChange={(e) => onUpdate('session_timeout_minutes', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="15"
              max="480"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Max Tentativi Login</label>
            <input
              type="number"
              value={settings.max_login_attempts}
              onChange={(e) => onUpdate('max_login_attempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="3"
              max="10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Rate Limit API (req/min)</label>
            <input
              type="number"
              value={settings.api_rate_limit}
              onChange={(e) => onUpdate('api_rate_limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="10"
              max="1000"
            />
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="email_verification"
              checked={settings.require_email_verification}
              onChange={(e) => onUpdate('require_email_verification', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="email_verification" className="text-white">
              Richiedi Verifica Email
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="two_factor"
              checked={settings.two_factor_enabled}
              onChange={(e) => onUpdate('two_factor_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="two_factor" className="text-white">
              Autenticazione a Due Fattori
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentSettings({ settings, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Impostazioni Contenuti</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Dimensione Max File (MB)</label>
            <input
              type="number"
              value={settings.max_file_size_mb}
              onChange={(e) => onUpdate('max_file_size_mb', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="1"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tipi File Consentiti</label>
            <input
              type="text"
              value={settings.allowed_file_types.join(', ')}
              onChange={(e) => onUpdate('allowed_file_types', e.target.value.split(', ').map((s: string) => s.trim()))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="jpg, png, pdf, doc"
            />
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="auto_approve_news"
              checked={settings.auto_approve_news}
              onChange={(e) => onUpdate('auto_approve_news', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto_approve_news" className="text-white">
              Auto-approva News
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="auto_approve_comments"
              checked={settings.auto_approve_comments}
              onChange={(e) => onUpdate('auto_approve_comments', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto_approve_comments" className="text-white">
              Auto-approva Commenti
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="content_moderation"
              checked={settings.content_moderation_enabled}
              onChange={(e) => onUpdate('content_moderation_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="content_moderation" className="text-white">
              Moderazione Contenuti Abilitata
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function GamificationSettings({ settings, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Impostazioni Gamification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Bonus Login Giornaliero (XP)</label>
            <input
              type="number"
              value={settings.daily_login_bonus}
              onChange={(e) => onUpdate('daily_login_bonus', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="1"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Bonus Level Up (XP)</label>
            <input
              type="number"
              value={settings.level_up_bonus}
              onChange={(e) => onUpdate('level_up_bonus', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="10"
              max="500"
            />
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="xp_system"
              checked={settings.xp_system_enabled}
              onChange={(e) => onUpdate('xp_system_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="xp_system" className="text-white">
              Sistema XP Abilitato
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="badge_system"
              checked={settings.badge_system_enabled}
              onChange={(e) => onUpdate('badge_system_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="badge_system" className="text-white">
              Sistema Badge Abilitato
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="leaderboard"
              checked={settings.leaderboard_enabled}
              onChange={(e) => onUpdate('leaderboard_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="leaderboard" className="text-white">
              Classifica Abilitata
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationSettings({ settings, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Integrazioni Esterne</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Google Analytics ID</label>
            <input
              type="text"
              value={settings.google_analytics_id}
              onChange={(e) => onUpdate('google_analytics_id', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="GA-XXXXXXXXX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Facebook App ID</label>
            <input
              type="text"
              value={settings.facebook_app_id}
              onChange={(e) => onUpdate('facebook_app_id', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="123456789012345"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Twitter API Key</label>
            <input
              type="text"
              value={settings.twitter_api_key}
              onChange={(e) => onUpdate('twitter_api_key', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="your-twitter-api-key"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Weather API Key</label>
            <input
              type="text"
              value={settings.weather_api_key}
              onChange={(e) => onUpdate('weather_api_key', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="your-weather-api-key"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Maps API Key</label>
            <input
              type="text"
              value={settings.maps_api_key}
              onChange={(e) => onUpdate('maps_api_key', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="your-maps-api-key"
            />
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-400">
              <p className="font-medium mb-1">Nota sulle API Key</p>
              <p>Assicurati di mantenere le tue API key sicure e di non condividerle pubblicamente. Usa variabili d&apos;ambiente per la produzione.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}