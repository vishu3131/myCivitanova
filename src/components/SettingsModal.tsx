"use client";

import React, { useState, useEffect } from 'react';
import { X, Settings, Palette, Globe, Volume2, Smartphone, Save } from 'lucide-react';
import { SettingsStorage } from '@/utils/profileStorage';

interface SettingsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

// Componente Switch semplice
const Switch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
      checked ? 'bg-blue-500' : 'bg-gray-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export function SettingsModal({ user, isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'it',
    sound_effects: true,
    haptic_feedback: true,
    auto_updates: true,
    data_saver: false,
    high_contrast: false,
    reduce_motion: false,
    font_size: 'medium',
    notifications_sound: true,
    app_badge: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchSettings();
    }
  }, [isOpen, user?.id]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const userSettings = await SettingsStorage.getSettings(user.id);
      setSettings(prev => ({ ...prev, ...userSettings }));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      await SettingsStorage.updateSettings(user.id, settings);
      
      // Applica il tema immediatamente
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      }
      
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const settingSections = [
    {
      title: 'Aspetto',
      icon: Palette,
      settings: [
        {
          key: 'theme',
          label: 'Tema',
          description: 'Scegli l\'aspetto dell\'app',
          type: 'select',
          options: [
            { value: 'dark', label: '🌙 Scuro' },
            { value: 'light', label: '☀️ Chiaro' },
            { value: 'system', label: '💻 Sistema' }
          ]
        },
        {
          key: 'font_size',
          label: 'Dimensione Testo',
          description: 'Regola la dimensione del testo',
          type: 'select',
          options: [
            { value: 'small', label: 'Piccolo' },
            { value: 'medium', label: 'Medio' },
            { value: 'large', label: 'Grande' }
          ]
        },
        {
          key: 'high_contrast',
          label: 'Alto Contrasto',
          description: 'Migliora la leggibilità con contrasti più forti',
          type: 'toggle'
        }
      ]
    },
    {
      title: 'Lingua e Regione',
      icon: Globe,
      settings: [
        {
          key: 'language',
          label: 'Lingua',
          description: '🚧 IN ARRIVO: Traduzione completa dell\'interfaccia',
          type: 'select',
          options: [
            { value: 'it', label: '🇮🇹 Italiano' },
            { value: 'en', label: '🇺🇸 English - IN ARRIVO' },
            { value: 'es', label: '🇪🇸 Español - IN ARRIVO' },
            { value: 'fr', label: '🇫🇷 Français - IN ARRIVO' },
            { value: 'de', label: '🇩🇪 Deutsch - IN ARRIVO' },
            { value: 'pt', label: '🇵🇹 Português - IN ARRIVO' },
            { value: 'ru', label: '🇷🇺 Русский - IN ARRIVO' },
            { value: 'zh', label: '🇨🇳 中文 - IN ARRIVO' },
            { value: 'ja', label: '🇯🇵 日本語 - IN ARRIVO' },
            { value: 'ar', label: '🇸🇦 العربية - IN ARRIVO' },
            { value: 'hi', label: '🇮🇳 हिन्दी - IN ARRIVO' },
            { value: 'ko', label: '🇰🇷 한국어 - IN ARRIVO' },
            { value: 'nl', label: '🇳🇱 Nederlands - IN ARRIVO' },
            { value: 'sv', label: '🇸🇪 Svenska - IN ARRIVO' },
            { value: 'no', label: '🇳🇴 Norsk - IN ARRIVO' },
            { value: 'da', label: '🇩🇰 Dansk - IN ARRIVO' },
            { value: 'fi', label: '🇫🇮 Suomi - IN ARRIVO' },
            { value: 'pl', label: '🇵🇱 Polski - IN ARRIVO' },
            { value: 'cs', label: '🇨🇿 Čeština - IN ARRIVO' },
            { value: 'hu', label: '🇭🇺 Magyar - IN ARRIVO' },
            { value: 'ro', label: '🇷🇴 Română - IN ARRIVO' },
            { value: 'bg', label: '🇧🇬 Български - IN ARRIVO' },
            { value: 'hr', label: '🇭🇷 Hrvatski - IN ARRIVO' },
            { value: 'sk', label: '🇸🇰 Slovenčina - IN ARRIVO' },
            { value: 'sl', label: '🇸🇮 Slovenščina - IN ARRIVO' },
            { value: 'et', label: '🇪🇪 Eesti - IN ARRIVO' },
            { value: 'lv', label: '🇱🇻 Latviešu - IN ARRIVO' },
            { value: 'lt', label: '🇱🇹 Lietuvių - IN ARRIVO' },
            { value: 'mt', label: '🇲🇹 Malti - IN ARRIVO' },
            { value: 'el', label: '🇬🇷 Ελληνικά - IN ARRIVO' },
            { value: 'tr', label: '🇹🇷 Türkçe - IN ARRIVO' }
          ]
        }
      ]
    },
    {
      title: 'Audio e Feedback',
      icon: Volume2,
      settings: [
        {
          key: 'sound_effects',
          label: 'Effetti Sonori',
          description: 'Riproduci suoni per le interazioni',
          type: 'toggle'
        },
        {
          key: 'notifications_sound',
          label: 'Suoni Notifiche',
          description: 'Riproduci suoni per le notifiche',
          type: 'toggle'
        },
        {
          key: 'haptic_feedback',
          label: 'Feedback Tattile',
          description: 'Vibrazione per le interazioni (solo mobile)',
          type: 'toggle'
        }
      ]
    },
    {
      title: 'App e Prestazioni',
      icon: Smartphone,
      settings: [
        {
          key: 'auto_updates',
          label: 'Aggiornamenti Automatici',
          description: 'Scarica automaticamente gli aggiornamenti',
          type: 'toggle'
        },
        {
          key: 'data_saver',
          label: 'Risparmio Dati',
          description: 'Riduci l\'uso dei dati mobili',
          type: 'toggle'
        },
        {
          key: 'app_badge',
          label: 'Badge App',
          description: 'Mostra il numero di notifiche sull\'icona dell\'app',
          type: 'toggle'
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-white">Impostazioni</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              {settingSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.title}>
                <div className="flex items-center space-x-2 mb-4">
                  <SectionIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {section.settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{setting.label}</h4>
                        <p className="text-gray-400 text-sm">{setting.description}</p>
                      </div>
                      
                      <div className="ml-4">
                        {setting.type === 'toggle' ? (
                          <Switch
                            checked={settings[setting.key as keyof typeof settings] as boolean}
                            onChange={(checked) => handleSettingChange(setting.key, checked)}
                          />
                        ) : setting.type === 'select' ? (
                          <select
                            value={settings[setting.key as keyof typeof settings] as string}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gray-500 min-w-[120px]"
                          >
                            {setting.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Salva</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}