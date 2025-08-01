"use client";

import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from './StatusBar';
import { BottomNavbar } from './BottomNavbar';
import { ArrowLeft, Settings, Edit3, Bell, Shield, HelpCircle, LogOut, ChevronRight, Camera, Star, Award, MapPin, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { PublicProfile } from './PublicProfile';

const userStats = [
  { id: 'visits', label: 'Luoghi visitati', value: 23, icon: MapPin, color: 'from-blue-500 to-blue-600' },
  { id: 'events', label: 'Eventi partecipati', value: 8, icon: Star, color: 'from-purple-500 to-purple-600' },
  { id: 'points', label: 'Punti guadagnati', value: 1250, icon: Award, color: 'from-yellow-500 to-yellow-600' },
];

const menuSections = [
  {
    title: 'Account',
    items: [
      { id: 'edit-profile', label: 'Modifica Profilo', icon: Edit3, color: 'text-blue-400' },
      { id: 'public-profile', label: 'Profilo pubblico', icon: User, color: 'text-green-400' },
      { id: 'notifications', label: 'Notifiche', icon: Bell, color: 'text-green-400', badge: '3' },
      { id: 'privacy', label: 'Privacy e Sicurezza', icon: Shield, color: 'text-purple-400' },
    ]
  },
  {
    title: 'Supporto',
    items: [
      { id: 'help', label: 'Centro Assistenza', icon: HelpCircle, color: 'text-orange-400' },
      { id: 'settings', label: 'Impostazioni', icon: Settings, color: 'text-gray-400' },
    ]
  },
  {
    title: 'Altro',
    items: [
      { id: 'logout', label: 'Esci', icon: LogOut, color: 'text-red-400' },
    ]
  }
];

const recentActivity = [
  { id: 1, action: 'Visitato', place: 'Centro Storico', time: '2 ore fa', icon: MapPin },
  { id: 2, action: 'Partecipato', place: 'Concerto Jazz', time: '1 giorno fa', icon: Star },
  { id: 3, action: 'Guadagnato', place: '50 punti', time: '2 giorni fa', icon: Award },
];

export function MobileProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiList = ['😀','😎','🦄','🐱','🌸','🚀','👽','🐶','🍕','🎨'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);

        // 1. Prova a caricare l'utente dal localStorage (per il login bypass)
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userFromStorage = JSON.parse(storedUser);
          console.log('Dati profilo recuperati da localStorage:', userFromStorage);
          setUser(userFromStorage);
          setLoadingProfile(false);
          return;
        }

        // 2. Se non c'è, usa il metodo standard di Supabase Auth
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          // Recupera tutti i dati del profilo dalla tabella 'users'
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (error) {
            console.error('Errore nel recupero del profilo:', error.message);
            setUser(null);
            return;
          }

          if (data) {
            console.log('Dati profilo recuperati:', data); // Debug
            setUser(data);
          } else {
            console.warn('Nessun profilo trovato per questo utente.');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Errore:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleMenuClick = async (itemId: string) => {
    switch (itemId) {
      case 'logout':
        setShowLogoutModal(true);
        break;
      case 'public-profile':
        setShowPublicPreview(true);
        break;
      default:
        console.log('Menu item clicked:', itemId);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutModal(false);
    router.push('/');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError('');
    if (!user || !e.target.files || e.target.files.length === 0) return;
    setAvatarUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      setAvatarError('Errore upload immagine');
      setAvatarUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatarUrl = urlData?.publicUrl;
    if (avatarUrl) {
      await supabase.from('profiles').update({ avatar: avatarUrl }).eq('id', user.id);
      setUser({ ...user, avatar: avatarUrl });
    }
    setAvatarUploading(false);
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (!user) return;
    await supabase.from('profiles').update({ avatar: emoji }).eq('id', user.id);
    setUser({ ...user, avatar: emoji });
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      <StatusBar />
      <div className="content-with-navbar">
        {/* Anteprima profilo pubblico */}
        {showPublicPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="relative">
              <PublicProfile user={user || {}} />
              <button
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full"
                onClick={() => setShowPublicPreview(false)}
              >
                Chiudi
              </button>
            </div>
          </div>
        )}
        {/* Sezione profilo utente */}
        <div className="relative px-6 pt-16 pb-6">
          <div className="flex flex-col items-center">
            <div className="profile-header text-center py-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
              {loadingProfile ? (
                <span className="text-white/70">Caricamento profilo...</span>
              ) : (
                <>
                  <h1 className="text-4xl font-extrabold text-white mb-4">
                    {user?.display_name || `${user?.signupName || 'Nome'} ${user?.signupSurname || 'Cognome'}`}
                  </h1>
                  <div className="text-lg text-gray-200 space-y-2">
                    <p>Email: {user?.email || 'Non disponibile'}</p>
                    <p>Ruolo: {user?.role || 'Non disponibile'}</p>
                    <p>Telefono: {user?.phone || 'Non disponibile'}</p>
                    <p>Data di nascita: {user?.birthdate || 'Non disponibile'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Menu Sections */}
        <div className="px-6 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-white text-lg font-bold mb-4">{section.title}</h2>
              <div
                className="rounded-2xl border overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {section.items.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors duration-200 ${
                        index !== section.items.length - 1 ? 'border-b border-white/10' : ''
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${item.color}`} />
                      <span className="flex-1 text-left text-white text-sm font-medium">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="h-8" />
      </div>
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4">Vuoi uscire?</h2>
            <button onClick={handleLogout} className="w-full bg-red-500 text-white p-2 rounded mb-2">Logout</button>
            <button onClick={() => setShowLogoutModal(false)} className="w-full text-gray-500 mt-2">Annulla</button>
          </div>
        </div>
      )}
      <BottomNavbar />
    </div>
  );
}