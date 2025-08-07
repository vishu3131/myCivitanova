"use client";

import React, { useState, useEffect } from 'react';
import { X, Shield, Eye, MapPin, Bell, Save } from 'lucide-react';
import { SettingsStorage } from '@/utils/profileStorage';

interface PrivacySettingsModalProps {
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

export function PrivacySettingsModal({ user, isOpen, onClose }: PrivacySettingsModalProps) {
  const [settings, setSettings] = useState({
    privacy_mode: false,
    location_sharing: false,
    profile_visibility: 'public',
    show_activity: true,
    show_stats: true,
    allow_messages: true,
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false
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
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const settingSections = [
    {
      title: 'Privacy del Profilo',
      icon: Eye,
      settings: [
        {
          key: 'privacy_mode',
          label: 'Modalità Privacy',
          description: 'Nascondi la tua attività agli altri utenti',
          type: 'toggle'
        },
        {
          key: 'profile_visibility',
          label: 'Visibilità Profilo',
          description: 'Chi può vedere il tuo profilo',
          type: 'select',
          options: [
            { value: 'public', label: 'Pubblico' },
            { value: 'friends', label: 'Solo amici' },
            { value: 'private', label: 'Privato' }
          ]
        },
        {
          key: 'show_activity',
          label: 'Mostra Attività',
          description: 'Permetti agli altri di vedere la tua attività recente',
          type: 'toggle'
        }
      ]
    },
    {
      title: 'Posizione e Sicurezza',
      icon: MapPin,
      settings: [
        {
          key: 'location_sharing',
          label: 'Condivisione Posizione',
          description: 'Permetti all\'app di accedere alla tua posizione',
          type: 'toggle'
        },
        {
          key: 'allow_messages',
          label: 'Messaggi da Altri Utenti',
          description: 'Permetti ad altri utenti di inviarti messaggi',
          type: 'toggle'
        }
      ]
    },
    {
      title: 'Notifiche',
      icon: Bell,
      settings: [
        {
          key: 'notifications_enabled',
          label: 'Notifiche Attive',
          description: 'Ricevi notifiche dall\'app',
          type: 'toggle'
        },
        {
          key: 'email_notifications',
          label: 'Notifiche Email',
          description: 'Ricevi notifiche via email',
          type: 'toggle'
        },
        {
          key: 'marketing_emails',
          label: 'Email Marketing',
          description: 'Ricevi email promozionali e newsletter',
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
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Privacy e Sicurezza</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {settingSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.title}>
                <div className="flex items-center space-x-2 mb-4">
                  <SectionIcon className="w-5 h-5 text-purple-400" />
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
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
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
              className="flex-1 py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
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