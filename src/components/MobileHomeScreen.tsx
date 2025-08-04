"use client";

import React, { useEffect, useState } from 'react';
import { HeroSection } from './HeroSection';
import { CategoryTags } from './CategoryTags';
import { InfoCards } from './InfoCards';
import { GamificationWidget } from './GamificationWidget';
import { GamificationWidgetNew } from './GamificationWidgetNew';
import { SimpleBadgeSystem } from './SimpleBadgeSystem';
import { BadgePage } from './BadgePage';
import { QuickStats } from './QuickStats';
import { LiveUpdates } from './LiveUpdates';
import { StatusBar } from './StatusBar';
import { TourARWidget } from './TourARWidget';

import { WeatherWidget } from './WeatherWidget';
import { TouristSpotWidget } from './TouristSpotWidget';
import { XPWidget } from './XPWidget';
import ReportModal from './CommunityReportModal';
import SocialWidgetsContainer from './SocialWidgetsContainer';
import PureNeonMobileWidget from './PureNeonMobileWidget';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';

export function MobileHomeScreen() {
  const [showNews, setShowNews] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const news = [
    {
      title: 'Nuova area pedonale inaugurata nel centro storico',
      time: '2 ore fa',
      category: 'Urbanistica',
    },
    {
      title: 'Calendario eventi estivi: pubblicato il programma completo',
      time: '5 ore fa',
      category: 'Eventi',
    },
    {
      title: 'Apertura nuovo sportello servizi comunali',
      time: '1 giorno fa',
      category: 'Servizi',
    },
  ];

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch user count
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        if (!error) setUserCount(count ?? 0);
        
        // Get current user
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              setCurrentUserId(user.id);
            } catch (error) {
              console.error('Error parsing stored user:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing mobile home screen:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
    
    // Realtime update (optional)
    const subscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        if (!error) setUserCount(count ?? 0);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="flex space-x-2 mb-4">
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-white/70">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Status Bar */}
      <StatusBar />
      {/* Safe Area Container */}
      <div
        className="content-with-navbar"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)' }}
      > {/* Padding for status bar and navbar */}
      {/* Hero Section */}
      <HeroSection />

      {/* Pure Neon Mobile Widget Row */}
      <div className="px-3 mt-4">
        <div className="grid grid-cols-1 gap-2">
            <div className="bg-black/20 rounded-xl p-4">
              <PureNeonMobileWidget
                buttonText="MYCIVITANOVA.IT"
                onButtonClick={() => {
                  console.log('Pure Neon CSS Widget cliccato dalla home mobile!');
                }}
              />
            </div>
        </div>
      </div>

        {/* Category Tags */}
        <CategoryTags />
        {/* Info Cards */}
        <InfoCards onReportClick={() => setShowReport(true)} />
        {/* Widget extra dalla versione desktop */}
        <div className="space-y-4 px-3 mt-4">

          {/* <WeatherWidget /> */}
          <TouristSpotWidget />
          
          {/* Social Widgets con Switch Toggle */}
          <SocialWidgetsContainer />
        </div>
        {/* iOS Control Center Style Layout */}
        <div className="px-3 mt-4 space-y-4">
          {/* Top Row - Large Widgets */}
          <div className="grid grid-cols-2 gap-2">
            {/* Tour AR Widget - Large */}
            <div className="col-span-2">
              <TourARWidget />
            </div>
          </div>
          
          {/* Pure Neon Mobile Widget Row */}
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-dark-300/30 backdrop-blur-sm border border-white/10 card-glow rounded-xl">
              <PureNeonMobileWidget
                title="✨ MyCivitanova"
                description="Tocca per l'effetto CSS"
                className=""
                buttonText="MyCivitanova.it"
                onButtonClick={() => {
                  console.log('Pure Neon CSS Widget cliccato dalla home mobile!');
                  // Qui puoi aggiungere la logica che vuoi
                }}
              />
            </div>
          </div>
          {/* Middle Row - Mixed Sizes */}
          <div className="grid grid-cols-4 gap-2">
            {/* XP Widget - Medium */}
            <div className="col-span-2">
              <XPWidget 
                userId={currentUserId || undefined} 
                onClick={() => setShowBadges(true)}
              />
            </div>
            {/* Community Widget - Small */}
            <div className="col-span-2 bg-dark-300/50 backdrop-blur-sm rounded-xl p-4 card-glow border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">Community</h3>
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-xs text-green-400">👥</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userCount !== null ? userCount : '...'}</div>
                <div className="text-white/60 text-xs">Cittadini attivi</div>
              </div>
            </div>
          </div>
          {/* Bottom Row - Small Widgets */}
          <div className="grid grid-cols-4 gap-2">
            {/* Badge - Small */}
            <div
              className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-3 card-glow border border-white/10 cursor-pointer hover:bg-dark-300/70 transition-colors"
              onClick={() => setShowBadges(true)}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xs text-accent">🏆</span>
                </div>
                <div className="text-white font-medium text-xs">Badge</div>
                <div className="text-accent text-xs">{currentUserId ? '...' : '5'}</div>
              </div>
            </div>
            {/* Events - Small */}
            <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-3 card-glow border border-white/10">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xs text-blue-400">📅</span>
                </div>
                <div className="text-white font-medium text-xs">Eventi</div>
                <div className="text-blue-400 text-xs">5</div>
              </div>
            </div>
            {/* Services - Small */}
            <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-3 card-glow border border-white/10 flex flex-col items-center justify-between">
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xs text-purple-400">⚙️</span>
                </div>
                <div className="text-white font-medium text-xs">Servizi</div>
                <div className="text-purple-400 text-xs mb-2">8</div>
              </div>
              <button
                className="w-full bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow hover:bg-purple-700 transition-all mt-2"
                onClick={() => setShowReport(true)}
              >
                Segnala Problema
              </button>
            </div>
            {/* News - Small */}
            <Link href="/news">
              <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-3 card-glow border border-white/10 cursor-pointer">
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xs text-red-400">📰</span>
                  </div>
                  <div className="text-white font-medium text-xs">News</div>
                  <div className="text-red-400 text-xs">3</div>
                </div>
              </div>
            </Link>
          </div>
          {/* Live Updates - Medium */}
          <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-4 card-glow border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Aggiornamenti Live</h3>
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-xs text-red-400">🔴</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-white/80 text-xs">Nuovo evento aggiunto: Festa del Mare</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white/80 text-xs">Aggiornamento meteo: sole per tutta la settimana</span>
              </div>
            </div>
          </div>
          {/* Additional spacing for content */}
          <div className="h-8"></div>
        </div>
        {/* News Popup */}
        {showNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                onClick={() => setShowNews(false)}
                aria-label="Chiudi"
              >
                ×
              </button>
              <h3 className="text-lg font-heading font-bold text-red-500 mb-4 flex items-center">
                <span className="mr-2">📰</span>Ultime News
              </h3>
              <ul className="mb-4">
                {news.map((n, idx) => (
                  <li key={idx} className="mb-3">
                    <div className="font-semibold text-gray-800">{n.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{n.category}</span>
                      <span>•</span>
                      <span>{n.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-2 bg-red-500 text-white rounded-lg font-semibold shadow hover:bg-red-600 transition-all"
                onClick={() => window.location.href='/news'}
              >
                Vai alla pagina News
              </button>
            </div>
          </div>
        )}
        {/* Segnala Problema Modal */}
        <ReportModal isOpen={showReport} onClose={() => setShowReport(false)} onSubmit={() => setShowReport(false)} />
        
        {/* Badge System Modal */}
        {showBadges && (
          <div className="fixed inset-0 z-50 bg-black">
            <div className="min-h-screen bg-black text-white">
              {/* Header */}
              <div className="bg-dark-300/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowBadges(false)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        ← Indietro
                      </button>
                      <h1 className="text-2xl font-bold">Sistema Badge & XP</h1>
                    </div>
                    <div className="text-accent text-sm">
                      🏆 Gamification
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="max-w-4xl mx-auto px-4 py-6">
                <SimpleBadgeSystem userId={currentUserId || undefined} />
              </div>
            </div>
          </div>
        )}
        


        {/* Bottom Navigation */}
      </div>
    </div>
  );
}