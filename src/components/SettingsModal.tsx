"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Settings, Palette, Globe, Volume2, Smartphone, Save } from 'lucide-react';
import { SettingsStorage } from '@/utils/profileStorage';

interface SettingsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

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
    language: 'it',
    theme: 'system',
    notifications_push: true,
    notifications_email: true,
    location_services: false,
    font_size: 'medium',
    notifications_sound: true,
    app_badge: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSettings = useCallback(async () => {
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
  }, [user?.id]);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchSettings();
    }
  }, [isOpen, user?.id, fetchSettings]);

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
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        const theme = settings.theme;

        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else {
          // system
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      }

      onClose();
    } catch (error: any) {
      setError(error.message || 'Errore durante il salvataggio delle impostazioni');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />

        <div className="relative inline-block w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-900 text-left align-middle shadow-xl transition-all">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-white/80" />
              <h3 className="text-lg font-medium leading-6 text-white">Impostazioni</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Preferenze di Visualizzazione */}
            <section>
              <h4 className="text-white/90 font-semibold mb-3">Preferenze di Visualizzazione</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <label className="flex items-center gap-2 text-white/80 mb-2">
                    <Palette className="w-4 h-4" /> Tema dell&apos;app
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['system', 'light', 'dark'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSettingChange('theme', option)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                          settings.theme === option ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-white/5 border-white/10 text-white/70'
                        }`}
                      >
                        {option === 'system' ? 'Sistema' : option === 'light' ? 'Chiaro' : 'Scuro'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <label className="flex items-center gap-2 text-white/80 mb-2">
                    <Globe className="w-4 h-4" /> Lingua
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80"
                  >
                    <option value="it">Italiano</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Notifiche */}
            <section>
              <h4 className="text-white/90 font-semibold mb-3">Notifiche</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <label className="flex items-center justify-between text-white/80 mb-2">
                    Notifiche Push
                    <Switch checked={settings.notifications_push} onChange={(val) => handleSettingChange('notifications_push', val)} />
                  </label>
                  <p className="text-sm text-white/60">Ricevi notifiche in tempo reale sulle attività della città.</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <label className="flex items-center justify-between text-white/80 mb-2">
                    Notifiche Email
                    <Switch checked={settings.notifications_email} onChange={(val) => handleSettingChange('notifications_email', val)} />
                  </label>
                  <p className="text-sm text-white/60">Ricevi un riepilogo settimanale via email.</p>
                </div>
              </div>
            </section>

            {/* Dispositivi e Privacy */}
            <section>
              <h4 className="text-white/90 font-semibold mb-3">Dispositivi e Privacy</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <label className="flex items-center justify-between text-white/80 mb-2">
                    Servizi di Localizzazione
                    <Switch checked={settings.location_services} onChange={(val) => handleSettingChange('location_services', val)} />
                  </label>
                  <p className="text-sm text-white/60">Migliora le funzionalità basate sulla posizione.</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <label className="flex items-center justify-between text-white/80 mb-2">
                    Dimensione Font
                    <select
                      value={settings.font_size}
                      onChange={(e) => handleSettingChange('font_size', e.target.value)}
                      className="ml-2 px-2 py-1 rounded bg-white/10 border border-white/20 text-white/80"
                    >
                      <option value="small">Piccolo</option>
                      <option value="medium">Medio</option>
                      <option value="large">Grande</option>
                    </select>
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <label className="flex items-center justify-between text-white/80 mb-2">
                    Suoni App
                    <Switch checked={settings.notifications_sound} onChange={(val) => handleSettingChange('notifications_sound', val)} />
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <label className="flex items-center justify-between text-white/80 mb-2">
                    Badge App
                    <Switch checked={settings.app_badge} onChange={(val) => handleSettingChange('app_badge', val)} />
                  </label>
                </div>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10">
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Salva Impostazioni
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}