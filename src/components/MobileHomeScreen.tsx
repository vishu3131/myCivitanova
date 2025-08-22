"use client";

import React, { useEffect, useState } from 'react';
import { HeroSection } from './HeroSection';
import { CategoryTags } from './CategoryTags';
import { InfoCards } from './InfoCards';
import { StatusBar } from './StatusBar';
import { TouristSpotWidget } from './TouristSpotWidget';
import { BeachWidget } from './BeachWidget';
import { XPWidget } from './XPWidget';
import DailyXPClaim from './DailyXPClaim';
import ReportModal from './CommunityReportModal';
import CityReportModal from './CityReportModal';
import { FullScreenLoader } from './LoadingSpinner';
import { WasteCollectionWidget } from './WasteCollectionWidget';
import PureNeonMobileWidget from './PureNeonMobileWidget';
import { supabase } from '@/utils/supabaseClient';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';
import Link from 'next/link';
import TreasureHuntWidget from './TreasureHuntWidget';
import FundraisingWidget from './FundraisingWidget';
import dynamic from 'next/dynamic';
import HomeTutorial, { isHomeTutorialHidden } from './HomeTutorial'; // Import HomeTutorial
import { SearchModal } from './SearchModal';
import { PullToRefresh } from './PullToRefresh';
import { NewsCarousel } from './NewsCarousel';
import { WeatherWidget } from './WeatherWidget';
import EventsCarousel from './EventsCarousel';
import LazyRender from './LazyRender';
import TutorialDebugOverlay from './TutorialDebugOverlay';
import LeaderboardWidget from './LeaderboardWidget';

// Lazy-loaded components for performance
// Temporaneamente commentato per errore di sintassi
// const DynamicLeaderboardWidget = dynamic(() => import('./LeaderboardWidget'), {
//   ssr: false,
//   loading: () => (
//     <div className="h-[160px] md:h-[200px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>
//   ),
// });
const DynamicMarketplaceWidget = dynamic(() => import('./MarketplaceWidget'), {
  ssr: false,
  loading: () => (
    <div className="h-[80px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>
  ),
});
const DynamicSocialWidgetsContainer = dynamic(() => import('./SocialWidgetsContainer'), {
  ssr: false,
  loading: () => (
    <div className="h-[120px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>
  ),
});
const DynamicTourARWidget = dynamic(() => import('./TourARWidget').then(m => m.TourARWidget), {
  ssr: false,
  loading: () => (
    <div className="h-[140px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>
  ),
});
const DynamicSimpleBadgeSystem = dynamic(() => import('./SimpleBadgeSystem').then(m => m.SimpleBadgeSystem), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>
  ),
});

// Reusable Section component with optional collapsible behavior
interface SectionProps {
  id: string;
  title: string;
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

function Section({ id, title, collapsible = false, expanded = true, onToggle, actions, children }: SectionProps) {
  const titleId = `${id}-title`;
  const contentId = `${id}-content`;
  return (
    <section id={id} aria-labelledby={titleId} role="region" className="px-3 mt-6 scroll-mt-20">
      <div className="flex items-center justify-between mb-2">
        <h3 id={titleId} className="section-title text-white font-semibold text-base">{title}</h3>
        <div className="flex items-center gap-3">
          {actions}
          {collapsible && (
            <div className="toggle-container">
              <div className="toggle-wrap">
                <input
                  className="toggle-input"
                  id={`${id}-holo-toggle`}
                  type="checkbox"
                  checked={!!expanded}
                  onChange={onToggle}
                  aria-label={`Mostra/Nascondi ${title}`}
                />
                <label className="toggle-track" htmlFor={`${id}-holo-toggle`}>
                  <div className="track-lines">
                    <div className="track-line"></div>
                  </div>

                  <div className="toggle-thumb">
                    <div className="thumb-core"></div>
                    <div className="thumb-inner"></div>
                    <div className="thumb-scan"></div>
                    <div className="thumb-particles">
                      <div className="thumb-particle"></div>
                      <div className="thumb-particle"></div>
                      <div className="thumb-particle"></div>
                      <div className="thumb-particle"></div>
                      <div className="thumb-particle"></div>
                    </div>
                  </div>

                  <div className="toggle-data">
                    <div className="data-text off">OFF</div>
                    <div className="data-text on">ON</div>
                    <div className="status-indicator off"></div>
                    <div className="status-indicator on"></div>
                  </div>

                  <div className="energy-rings">
                    <div className="energy-ring"></div>
                    <div className="energy-ring"></div>
                    <div className="energy-ring"></div>
                  </div>

                  <div className="interface-lines">
                    <div className="interface-line"></div>
                    <div className="interface-line"></div>
                    <div className="interface-line"></div>
                    <div className="interface-line"></div>
                    <div className="interface-line"></div>
                    <div className="interface-line"></div>
                  </div>

                  <div className="toggle-reflection"></div>
                  <div className="holo-glow"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
      {(!collapsible || expanded) && (
        <div id={contentId} className="section-panel holo-appear">
          {children}
        </div>
      )}
    </section>
  );
}

export function MobileHomeScreen() {
  const { user, loading: authLoading } = useAuthWithRole();
  const [showReport, setShowReport] = useState(false);
  const [showCityReport, setShowCityReport] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current user ID from auth hook
  const currentUserId = user?.id || null;
  const [showHomeTutorial, setShowHomeTutorial] = useState(false); // State for HomeTutorial
  const [heartActiveHome, setHeartActiveHome] = useState(false); // Stato per widget cuore spostato qui
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Check if tutorial has been hidden before and intro is complete
    const checkTutorial = () => {
      try {
        const introComplete = localStorage.getItem('introUnlockedV1') === '1';
        const tutorialHidden = isHomeTutorialHidden();
        
        // Only show tutorial if intro is complete and tutorial hasn't been hidden
        if (introComplete && !tutorialHidden) {
          // Add a delay to ensure smooth transition after intro
          setTimeout(() => {
            setShowHomeTutorial(true);
          }, 500);
        }
      } catch (error) {
        console.error('Error checking tutorial state:', error);
      }
    };

    checkTutorial();
  }, []);

  // Toggle body class when tutorial is active to prevent background scroll
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (showHomeTutorial) {
      document.body.classList.add('tutorial-is-active');
    } else {
      document.body.classList.remove('tutorial-is-active');
    }
  }, [showHomeTutorial]);

  // Collapsible states with persistence
  const [showProgress, setShowProgress] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showLabs, setShowLabs] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Fetch user count (for potential future use)
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        if (!error) setUserCount(count ?? 0);

        // Get preferences from localStorage
        if (typeof window !== 'undefined') {

          // Restore collapsible preferences
          const prefProgress = localStorage.getItem('home__showProgress');
          const prefCommunity = localStorage.getItem('home__showCommunity');
          const prefLabs = localStorage.getItem('home__showLabs');
          const prefSocial = localStorage.getItem('home__showSocial');
          const prefDiscover = localStorage.getItem('home__showDiscover');
          const prefAdvanced = localStorage.getItem('home__showAdvanced');
          if (prefProgress !== null) setShowProgress(prefProgress === 'true');
          if (prefCommunity !== null) setShowCommunity(prefCommunity === 'true');
          if (prefLabs !== null) setShowLabs(prefLabs === 'true');
          if (prefSocial !== null) setShowSocial(prefSocial === 'true');
          if (prefDiscover !== null) setShowDiscover(prefDiscover === 'true');
          if (prefAdvanced !== null) setShowAdvanced(prefAdvanced === 'true');
        }
      } catch (error) {
        console.error('Error initializing mobile home screen:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only initialize data when auth is not loading
    if (!authLoading) {
      initializeData();
    }
  }, [authLoading]);

  // Show loading while auth is loading or data is loading
  const isAppLoading = authLoading || isLoading;

  // Realtime update (optional) - deferred to idle to not block initial load
  useEffect(() => {
    let channel: any = null;
    const subscribe = () => {
      channel = supabase
        .channel('public:users')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
          const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
          if (!error) setUserCount(count ?? 0);
        })
        .subscribe();
    };
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(subscribe);
    } else {
      setTimeout(subscribe, 1000);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Persist preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('home__showProgress', String(showProgress));
  }, [showProgress]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('home__showCommunity', String(showCommunity));
  }, [showCommunity]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('home__showLabs', String(showLabs));
  }, [showLabs]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('home__showSocial', String(showSocial));
  }, [showSocial]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('home__showDiscover', String(showDiscover));
  }, [showDiscover]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('home__showAdvanced', String(showAdvanced));
  }, [showAdvanced]);

  // Loading screen
  if (isAppLoading) {
    return <FullScreenLoader />;
  }

  // Quick actions config (Segnala è nella CTA primaria del hero)
  const quickActions: { id: string; label: string; icon: string; href: string; aria: string }[] = [
    { id: 'servizi', label: 'Servizi', icon: '⚙️', href: '/servizi', aria: 'Apri servizi utili' },
    { id: 'eventi', label: 'Eventi', icon: '📅', href: '/eventi', aria: 'Vedi eventi' },
    { id: 'ar', label: 'Mappa AR', icon: '🗺️', href: '/ar', aria: 'Apri mappa AR' },
    { id: 'scopri', label: 'Scopri', icon: '🧭', href: '#scopri-citta', aria: 'Vai a Scopri la città' },
  ];

  const QuickActionsGrid = () => (
    <div className="px-3 mt-3 grid grid-cols-4 gap-2">
      {quickActions.map((qa) => {
        const common = (
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center hover:bg-white/10 transition-colors">
            <div className="text-2xl" aria-hidden="true">{qa.icon}</div>
            <div className="text-xs text-white mt-1">{qa.label}</div>
          </div>
        );
        return qa.href.startsWith('/') ? (
          <Link key={qa.id} href={qa.href} aria-label={qa.aria} className="block focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-xl">
            {common}
          </Link>
        ) : (
          <a key={qa.id} href={qa.href} aria-label={qa.aria} className="block focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-xl">
            {common}
          </a>
        );
      })}
    </div>
  );

  const handleRefresh = async () => {
    setRefreshToken((t) => t + 1);
  };

  return (
    <div className={`${showHomeTutorial ? 'tutorial-active' : ''} mobile-home-root min-h-screen bg-black relative overflow-x-hidden isolate z-0`}>
      {/* Skip link for accessibility */}
      <a
        href="#novita"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-purple-700 focus:text-white focus:px-3 focus:py-2 focus:rounded"
      >
        Salta al contenuto
      </a>

      {/* Status Bar */}
      <StatusBar />

      {/* Top App Bar */}
      <div className="sticky top-0 z-10 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="px-3 py-2 flex items-center gap-3">
          <div className="text-white font-semibold tracking-wide">MyCivitanova</div>
          {/* Debug button - only show in development */}
          <button
            onClick={() => setShowDebug(true)}
            className="text-xs text-white/50 hover:text-white/80 px-2 py-1 rounded"
            title="Debug Tutorial"
          >
            🐛
          </button>
          <div className="flex-1">
            <input
              type="search"
              placeholder="Cerca servizi, eventi, luoghi"
              className="w-full bg-white/5 text-white placeholder-white/50 text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Apri ricerca"
              readOnly
              onClick={() => setIsSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsSearchOpen(true);
                }
              }}
              role="button"
              aria-haspopup="dialog"
              aria-expanded={isSearchOpen}
            />
          </div>
          <Link href="/profile" className="text-white/80 hover:text-white" aria-label="Profilo">🙂</Link>
        </div>
      </div>

      {/* Safe Area Container */}
      <div
        className="content-with-navbar"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)' }}
      >
        <PullToRefresh onRefresh={handleRefresh}>
        {/* Hero Section */}
        <HeroSection />

        {/* Hero Primary CTA row */}
        <div className="px-3 mt-3 flex items-center gap-2">
          <button
            onClick={() => setShowCityReport(true)}
            className="flex-1 bg-purple-600 text-white px-3 py-3 rounded-xl text-sm font-semibold shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
            aria-label="Segnala un problema"
          >
            <span className="text-lg">⚠️</span>
            Segnala un problema
          </button>
          <Link
            href="/news"
            className="flex-1 bg-white/5 text-white px-3 py-3 rounded-xl text-sm font-semibold border border-white/10 hover:bg-white/10 transition-all text-center"
            aria-label="Vedi novità ed eventi"
          >
            📅 Vedi novità
          </Link>
        </div>

        {/* Quick actions */}
        <QuickActionsGrid />

        {/* Novità vicino a te */}
        <Section
          id="novita"
          title="Novità vicino a te"
          actions={<Link href="/news" className="text-xs text-white/80 hover:text-white underline">Vedi tutto</Link>}
        >
          <div className="space-y-3">
            <LazyRender fallback={<div className="h-[60px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
              <WeatherWidget key={`weather-${refreshToken}`} />
            </LazyRender>
            <LazyRender fallback={<div className="h-[100px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
              <NewsCarousel key={`news-${refreshToken}`} />
            </LazyRender>
            <LazyRender fallback={<div className="h-[120px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
              <EventsCarousel key={`events-${refreshToken}`} />
            </LazyRender>
          </div>
        </Section>

        {/* Servizi utili */}
        <Section id="servizi-utili" title="Servizi utili">
          <div className="space-y-3">
            <LazyRender fallback={<div className="h-[36px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
              <CategoryTags />
            </LazyRender>
            <LazyRender fallback={<div className="h-[160px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
              <InfoCards onReportClick={() => setShowCityReport(true)} userId={currentUserId || undefined} />
            </LazyRender>
          </div>
        </Section>

        {/* Cuore (spostato qui) */}
        <div className="mt-6 mx-3 h-[100px] flex items-center justify-center bg-transparent relative">
          {!heartActiveHome ? (
            <>
              <div className="love relative">
                <input id="love-switch-home" type="checkbox" onChange={(e) => { if (e.target.checked) { setTimeout(() => setHeartActiveHome(true), 1300); } }} />
                <label className="love-heart" htmlFor="love-switch-home">
                  <i className="left"></i>
                  <i className="right"></i>
                  <i className="bottom"></i>
                  <div className="round"></div>
                </label>
              </div>
                          </>
          ) : (
            <>
              {/* From Uiverse.io by SouravBandyopadhyay */}
              <div className="cssload-main">
                <div className="cssload-heart">
                  <span className="cssload-heartL"></span>
                  <span className="cssload-heartR"></span>
                  <span className="cssload-square"></span>
                </div>
                <div className="cssload-shadow"></div>
              </div>
                          </>
          )}
        </div>

        {/* Servizi Avanzati */}
        <Section
          id="servizi-avanzati"
          title="Servizi Avanzati"
          collapsible
          expanded={showAdvanced}
          onToggle={() => setShowAdvanced((s) => !s)}
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-1">
              <LazyRender fallback={<div className="h-[80px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
                <DynamicMarketplaceWidget />
              </LazyRender>
            </div>
            <div className="col-span-1">
              <LazyRender fallback={<div className="h-[80px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
                <WasteCollectionWidget />
              </LazyRender>
            </div>
            <div className="col-span-1">
              <LazyRender fallback={<div className="h-[80px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
                <FundraisingWidget />
              </LazyRender>
            </div>
            <div className="col-span-1">
              <div className="h-full bg-dark-300/50 backdrop-blur-sm rounded-xl p-2 sm:p-3 card-glow border border-white/10 flex items-center justify-center">
                <div className="text-white/60 text-xs sm:text-sm">Prossimamente</div>
              </div>
            </div>
          </div>
        </Section>

        {/* I tuoi progressi */}
        <Section
          id="progressi"
          title="I tuoi progressi"
          collapsible
          expanded={showProgress}
          onToggle={() => setShowProgress((s) => !s)}
        >
          <div className="space-y-3">
            <LazyRender fallback={<div className="h-[60px] bg-white/5 border border-white/10 rounded-xl animate-pulse -mx-3" aria-hidden="true"></div>}>
              <DailyXPClaim userId={currentUserId || undefined} className="-mx-3" />
            </LazyRender>
            <div className="grid grid-cols-1 gap-2">
              <LazyRender fallback={<div className="h-[100px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
                <XPWidget userId={currentUserId || undefined} onClick={() => setShowBadges(true)} />
              </LazyRender>
            </div>
            <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-3 card-glow border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium text-sm">Classifica</h4>
                <Link href="/classifica" className="text-xs text-white/70 hover:text-white underline">Vedi tutto</Link>
              </div>
              <LazyRender fallback={<div className="h-[180px] md:h-[200px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
                <LeaderboardWidget 
                  userId={currentUserId || undefined}
                  limit={5}
                  showTitle={false}
                  compact={true}
                />
              </LazyRender>
            </div>
          </div>
        </Section>

        {/* Extra */}
        <Section
          id="community"
          title="Extra"
          collapsible
          expanded={showCommunity}
          onToggle={() => setShowCommunity((s) => !s)}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <LazyRender fallback={<div className="h-[120px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
                <TreasureHuntWidget />
              </LazyRender>
            </div>
            <div>
              <LazyRender fallback={<div className="h-[140px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
                <DynamicSocialWidgetsContainer />
              </LazyRender>
            </div>
          </div>
        </Section>

        {/* Scopri la città */}
        <Section
          id="scopri-citta"
          title="Scopri la città"
          collapsible
          expanded={showDiscover}
          onToggle={() => setShowDiscover((s) => !s)}
        >
          <div className="space-y-3">
            <LazyRender fallback={<div className="h-[140px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
              <TouristSpotWidget />
            </LazyRender>
            <LazyRender fallback={<div className="h-[140px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
              <DynamicTourARWidget />
            </LazyRender>
            <LazyRender fallback={<div className="h-[140px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
              <BeachWidget />
            </LazyRender>
          </div>
        </Section>

        {/* Sperimenta (effetti/lab) */}
        <Section
          id="sperimenta"
          title="Sperimenta"
          collapsible
          expanded={showLabs}
          onToggle={() => setShowLabs((s) => !s)}
        >
          <div className="grid grid-cols-1 gap-2 w-full">
            <div className="bg-dark-300/30 backdrop-blur-sm border border-white/10 card-glow rounded-xl">
              <LazyRender fallback={<div className="h-[100px] bg-white/5 border border-white/10 rounded-xl animate-pulse" aria-hidden="true"></div>}>
                <PureNeonMobileWidget
                  title="✨ MyCivitanova"
                  description="Tocca per l'effetto CSS"
                  className=""
                  onButtonClick={() => {
                    console.log('Pure Neon CSS Widget cliccato dalla home mobile!');
                  }}
                />
              </LazyRender>
            </div>
          </div>
        </Section>

        {/* Modals */}
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
                <DynamicSimpleBadgeSystem userId={currentUserId || undefined} />
              </div>
            </div>
          </div>
        )}

        
        {/* Spacing for Bottom Navbar */}
        <div className="h-24"></div>
        </PullToRefresh>
        <style jsx global>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .neon-toggle {
            position: relative;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            border-radius: 10px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            overflow: hidden;
            transition: transform .2s ease, box-shadow .3s ease, background .3s ease;
            box-shadow: 0 0 0 rgba(0,0,0,0);
          }
          .neon-toggle:before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: inherit;
            background: linear-gradient(120deg, rgba(168,85,247,0.35), rgba(6,182,212,0.35), rgba(99,102,241,0.35));
            filter: blur(14px);
            opacity: .9;
            background-size: 200% 200%;
            animation: gradientShift 6s ease infinite;
            z-index: 0;
          }
          .neon-toggle:after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 1px;
            background: linear-gradient(120deg, rgba(168,85,247,0.9), rgba(6,182,212,0.9), rgba(99,102,241,0.9));
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            background-size: 200% 200%;
            animation: gradientShift 8s linear infinite;
            z-index: 1;
            opacity: .6;
          }
          .neon-toggle .label {
            position: relative;
            z-index: 2;
            font-size: 11px;
            font-weight: 700;
          }
          .neon-toggle .arrow {
            position: relative;
            z-index: 2;
            transition: transform .3s ease;
          }
          .neon-toggle:hover {
            transform: translateY(-1px) scale(1.02);
            box-shadow: 0 0 16px rgba(168,85,247,.35), 0 0 28px rgba(6,182,212,.25);
            background: rgba(255,255,255,0.08);
          }
          .neon-toggle:active {
            transform: translateY(0px) scale(0.98);
          }
          .neon-toggle .glint {
            position: absolute;
            top: -50%;
            left: -20%;
            width: 40%;
            height: 200%;
            background: radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 60%);
            transform: rotate(25deg);
            animation: glintMove 3.2s cubic-bezier(.4,.0,.2,1) infinite;
            opacity: .25;
            z-index: 2;
            pointer-events: none;
          }
          @keyframes glintMove {
            0% { transform: translateX(-120%) rotate(25deg); }
            50% { transform: translateX(120%) rotate(25deg); }
            100% { transform: translateX(120%) rotate(25deg); }
          }

          .toggle-container {
            position: relative;
            width: 130px;
            display: flex;
            flex-direction: column;
            align-items: center;
            perspective: 800px;
            z-index: 5;
            transform: scale(0.8);
            transform-origin: right center;
          }
          
          .toggle-wrap {
            position: relative;
            width: 100%;
            height: 60px;
            transform-style: preserve-3d;
          }
          
          .toggle-input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .toggle-track {
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgba(0, 30, 60, 0.4);
            border-radius: 30px;
            cursor: pointer;
            box-shadow:
              0 0 15px rgba(0, 80, 255, 0.2),
              inset 0 0 10px rgba(0, 0, 0, 0.8);
            overflow: hidden;
            backdrop-filter: blur(5px);
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            border: 1px solid rgba(0, 150, 255, 0.3);
          }
          
          .toggle-track::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(
                ellipse at center,
                rgba(0, 80, 255, 0.1) 0%,
                rgba(0, 0, 0, 0) 70%
              ),
              linear-gradient(90deg, rgba(0, 60, 120, 0.1) 0%, rgba(0, 30, 60, 0.2) 100%);
            opacity: 0.6;
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          }
          
          .toggle-track::after {
            content: "";
            position: absolute;
            top: 2px;
            left: 2px;
            right: 2px;
            height: 10px;
            background: linear-gradient(
              90deg,
              rgba(0, 170, 255, 0.3) 0%,
              rgba(0, 80, 255, 0.1) 100%
            );
            border-radius: 30px 30px 0 0;
            opacity: 0.7;
            filter: blur(1px);
          }
          
          .track-lines {
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 1px;
            transform: translateY(-50%);
            overflow: hidden;
          }
          
          .track-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(
              90deg,
              rgba(0, 150, 255, 0.3) 0px,
              rgba(0, 150, 255, 0.3) 5px,
              transparent 5px,
              transparent 15px
            );
            animation: track-line-move 3s linear infinite;
          }
          
          @keyframes track-line-move {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(20px);
            }
          }
          
          .toggle-thumb {
            position: absolute;
            width: 54px;
            height: 54px;
            left: 3px;
            top: 3px;
            background: radial-gradient(
              circle,
              rgba(10, 40, 90, 0.9) 0%,
              rgba(0, 20, 50, 0.8) 100%
            );
            border-radius: 50%;
            box-shadow:
              0 2px 15px rgba(0, 0, 0, 0.5),
              inset 0 0 15px rgba(0, 150, 255, 0.5);
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            z-index: 2;
            border: 1px solid rgba(0, 170, 255, 0.6);
            overflow: hidden;
            transform-style: preserve-3d;
          }
          
          .thumb-core {
            position: absolute;
            width: 40px;
            height: 40px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(
              circle,
              rgba(0, 180, 255, 0.6) 0%,
              rgba(0, 50, 120, 0.2) 100%
            );
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(0, 150, 255, 0.5);
            opacity: 0.9;
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          }
          
          .thumb-inner {
            position: absolute;
            width: 25px;
            height: 25px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(
              circle,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(100, 200, 255, 0.5) 100%
            );
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(100, 200, 255, 0.7);
            opacity: 0.7;
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            animation: pulse 2s infinite alternate;
          }
          
          @keyframes pulse {
            0% {
              opacity: 0.5;
              transform: translate(-50%, -50%) scale(0.9);
            }
            100% {
              opacity: 0.8;
              transform: translate(-50%, -50%) scale(1.1);
            }
          }
          
          .thumb-scan {
            position: absolute;
            width: 100%;
            height: 5px;
            background: linear-gradient(
              90deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 150, 255, 0.5) 20%,
              rgba(255, 255, 255, 0.8) 50%,
              rgba(0, 150, 255, 0.5) 80%,
              rgba(0, 0, 0, 0) 100%
            );
            top: 0;
            left: 0;
            filter: blur(1px);
            animation: thumb-scan 2s linear infinite;
            opacity: 0.7;
          }
          
          @keyframes thumb-scan {
            0% {
              top: -5px;
              opacity: 0;
            }
            20% {
              opacity: 0.7;
            }
            80% {
              opacity: 0.7;
            }
            100% {
              top: 54px;
              opacity: 0;
            }
          }
          
          .thumb-particles {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            overflow: hidden;
          }
          
          .thumb-particle {
            position: absolute;
            width: 3px;
            height: 3px;
            background: rgba(100, 200, 255, 0.8);
            border-radius: 50%;
            box-shadow: 0 0 5px rgba(100, 200, 255, 0.8);
            animation: thumb-particle-float 3s infinite ease-out;
            opacity: 0;
          }
          
          .thumb-particle:nth-child(1) {
            top: 70%;
            left: 30%;
            animation-delay: 0.2s;
          }
          
          .thumb-particle:nth-child(2) {
            top: 60%;
            left: 60%;
            animation-delay: 0.6s;
          }
          
          .thumb-particle:nth-child(3) {
            top: 50%;
            left: 40%;
            animation-delay: 1s;
          }
          
          .thumb-particle:nth-child(4) {
            top: 40%;
            left: 70%;
            animation-delay: 1.4s;
          }
          
          .thumb-particle:nth-child(5) {
            top: 80%;
            left: 50%;
            animation-delay: 1.8s;
          }
          
          @keyframes thumb-particle-float {
            0% {
              transform: translateY(0) scale(1);
              opacity: 0;
            }
            20% {
              opacity: 0.8;
            }
            100% {
              transform: translateY(-30px) scale(0);
              opacity: 0;
            }
          }
          
          .toggle-data {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 1;
          }
          
          .data-text {
            position: absolute;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            transition: all 0.5s ease;
          }
          
          .data-text.off {
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            opacity: 1;
            color: rgba(0, 150, 255, 0.6);
            text-shadow: 0 0 5px rgba(0, 100, 255, 0.4);
          }
          
          .data-text.on {
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0;
            color: rgba(0, 255, 150, 0.6);
            text-shadow: 0 0 5px rgba(0, 255, 100, 0.4);
          }
          
          .status-indicator {
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: radial-gradient(
              circle,
              rgba(0, 180, 255, 0.8) 0%,
              rgba(0, 80, 200, 0.4) 100%
            );
            box-shadow: 0 0 10px rgba(0, 150, 255, 0.5);
            animation: blink 2s infinite alternate;
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          }
          
          .status-indicator.off {
            top: 25px;
            right: 15px;
          }
          
          .status-indicator.on {
            top: 25px;
            left: 15px;
            opacity: 0;
            background: radial-gradient(
              circle,
              rgba(0, 255, 150, 0.8) 0%,
              rgba(0, 200, 80, 0.4) 100%
          );
            box-shadow: 0 0 10px rgba(0, 255, 150, 0.5);
          }
          
          @keyframes blink {
            0%,
            100% {
              opacity: 0.5;
              transform: scale(0.9);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
          }
          
          .energy-rings {
            position: absolute;
            width: 54px;
            height: 54px;
            left: 3px;
            top: 3px;
            pointer-events: none;
            z-index: 1;
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          }
          
          .energy-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 2px solid transparent;
            opacity: 0;
          }
          
          .energy-ring:nth-child(1) {
            width: 50px;
            height: 50px;
            border-top-color: rgba(0, 150, 255, 0.5);
            border-right-color: rgba(0, 150, 255, 0.3);
            animation: spin 3s linear infinite;
          }
          
          .energy-ring:nth-child(2) {
            width: 40px;
            height: 40px;
            border-bottom-color: rgba(0, 150, 255, 0.5);
            border-left-color: rgba(0, 150, 255, 0.3);
            animation: spin 2s linear infinite reverse;
          }
          
          .energy-ring:nth-child(3) {
            width: 30px;
            height: 30px;
            border-left-color: rgba(0, 150, 255, 0.5);
            border-top-color: rgba(0, 150, 255, 0.3);
            animation: spin 1.5s linear infinite;
          }
          
          @keyframes spin {
            0% {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            100% {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }
          
          .interface-lines {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }
          
          .interface-line {
            position: absolute;
            background: rgba(0, 150, 255, 0.3);
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          }
          
          .interface-line:nth-child(1) {
            width: 15px;
            height: 1px;
            bottom: -5px;
            left: 20px;
          }
          
          .interface-line:nth-child(2) {
            width: 1px;
            height: 8px;
            bottom: -12px;
            left: 35px;
          }
          
          .interface-line:nth-child(3) {
            width: 25px;
            height: 1px;
            bottom: -12px;
            left: 35px;
          }
          
          .interface-line:nth-child(4) {
            width: 15px;
            height: 1px;
            bottom: -5px;
            right: 20px;
          }
          
          .interface-line:nth-child(5) {
            width: 1px;
            height: 8px;
            bottom: -12px;
            right: 35px;
          }
          
          .interface-line:nth-child(6) {
            width: 25px;
            height: 1px;
            bottom: -12px;
            right: 10px;
          }
          
          .toggle-reflection {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.1) 0%,
              rgba(255, 255, 255, 0) 40%
            );
            border-radius: 30px;
            pointer-events: none;
          }
          
          .toggle-label {
            position: relative;
            margin-top: 20px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-align: center;
            color: rgba(0, 150, 255, 0.7);
            text-shadow: 0 0 10px rgba(0, 100, 255, 0.5);
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          }
          
          .holo-glow {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 30px;
            background: radial-gradient(
              ellipse at center,
              rgba(0, 150, 255, 0.2) 0%,
              rgba(0, 0, 0, 0) 70%
            );
            filter: blur(10px);
            opacity: 0.5;
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            z-index: 0;
          }
          
          .toggle-input:checked + .toggle-track {
            background: rgba(0, 60, 30, 0.4);
            border-color: rgba(0, 255, 150, 0.3);
            box-shadow:
              0 0 15px rgba(0, 255, 150, 0.2),
              inset 0 0 10px rgba(0, 0, 0, 0.8);
          }
          
          .toggle-input:checked + .toggle-track::before {
            background: radial-gradient(
                ellipse at center,
                rgba(0, 255, 150, 0.1) 0%,
                rgba(0, 0, 0, 0) 70%
              ),
              linear-gradient(90deg, rgba(0, 120, 60, 0.1) 0%, rgba(0, 60, 30, 0.2) 100%);
          }
          
          .toggle-input:checked + .toggle-track::after {
            background: linear-gradient(
              90deg,
              rgba(0, 255, 150, 0.3) 0%,
              rgba(0, 160, 80, 0.1) 100%
            );
          }
          
          .toggle-input:checked + .toggle-track .track-line {
            background: repeating-linear-gradient(
              90deg,
              rgba(0, 255, 150, 0.3) 0px,
              rgba(0, 255, 150, 0.3) 5px,
              transparent 5px,
              transparent 15px
            );
            animation-direction: reverse;
          }
          
          .toggle-input:checked + .toggle-track .toggle-thumb {
            left: calc(100% - 57px);
            background: radial-gradient(
              circle,
              rgba(10, 90, 40, 0.9) 0%,
              rgba(0, 50, 20, 0.8) 100%
            );
            border-color: rgba(0, 255, 150, 0.6);
            box-shadow:
              0 2px 15px rgba(0, 0, 0, 0.5),
              inset 0 0 15px rgba(0, 255, 150, 0.5);
          }
          
          .toggle-input:checked + .toggle-track .thumb-core {
            background: radial-gradient(
              circle,
              rgba(0, 255, 150, 0.6) 0%,
              rgba(0, 120, 50, 0.2) 100%
            );
            box-shadow: 0 0 20px rgba(0, 255, 150, 0.5);
          }
          
          .toggle-input:checked + .toggle-track .thumb-inner {
            background: radial-gradient(
              circle,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(100, 255, 200, 0.5) 100%
            );
            box-shadow: 0 0 10px rgba(100, 255, 200, 0.7);
          }
          
          .toggle-input:checked + .toggle-track .thumb-scan {
            background: linear-gradient(
              90deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 255, 150, 0.5) 20%,
              rgba(255, 255, 255, 0.8) 50%,
              rgba(0, 255, 150, 0.5) 80%,
              rgba(0, 0, 0, 0) 100%
            );
          }
          
          .toggle-input:checked + .toggle-track .thumb-particle {
            background: rgba(100, 255, 200, 0.8);
            box-shadow: 0 0 5px rgba(100, 255, 200, 0.8);
          }
          
          .toggle-input:checked + .toggle-track .data-text.off {
            opacity: 0;
          }
          
          .toggle-input:checked + .toggle-track .data-text.on {
            opacity: 1;
          }
          
          .toggle-input:checked + .toggle-track .status-indicator.off {
            opacity: 0;
          }
          
          .toggle-input:checked + .toggle-track .status-indicator.on {
            opacity: 1;
          }
          
          .toggle-input:checked + .toggle-track .energy-rings {
            left: calc(100% - 57px);
          }
          
          .toggle-input:checked + .toggle-track .energy-ring {
            opacity: 1;
          }
          
          .toggle-input:checked + .toggle-track .energy-ring:nth-child(1) {
            border-top-color: rgba(0, 255, 150, 0.5);
            border-right-color: rgba(0, 255, 150, 0.3);
          }
          
          .toggle-input:checked + .toggle-track .energy-ring:nth-child(2) {
            border-bottom-color: rgba(0, 255, 150, 0.5);
            border-left-color: rgba(0, 255, 150, 0.3);
          }
          
          .toggle-input:checked + .toggle-track .energy-ring:nth-child(3) {
            border-left-color: rgba(0, 255, 150, 0.5);
            border-top-color: rgba(0, 255, 150, 0.3);
          }
          
          .toggle-input:checked + .toggle-track .interface-line {
            background: rgba(0, 255, 150, 0.3);
          }
          
          .toggle-input:checked ~ .toggle-label {
            color: rgba(0, 255, 150, 0.7);
            text-shadow: 0 0 10px rgba(0, 255, 150, 0.5);
          }
          
          .toggle-input:checked + .toggle-track .holo-glow {
            background: radial-gradient(
              ellipse at center,
              rgba(0, 255, 150, 0.2) 0%,
              rgba(0, 0, 0, 0) 70%
            );
          }
          
          .toggle-input:hover + .toggle-track {
            box-shadow:
              0 0 20px rgba(0, 150, 255, 0.3),
              inset 0 0 10px rgba(0, 0, 0, 0.8);
          }
          
          .toggle-input:checked:hover + .toggle-track {
            box-shadow:
              0 0 20px rgba(0, 255, 150, 0.3),
              inset 0 0 10px rgba(0, 0, 0, 0.8);
          }

          .holo-appear {
            position: relative;
            animation: sectionIn 700ms cubic-bezier(.2,.7,.2,1) both;
          }
          .holo-appear::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(120deg, rgba(168,85,247,0.12), rgba(6,182,212,0.08), rgba(99,102,241,0.12));
            opacity: 0;
            animation: sectionSweep 700ms ease-out forwards;
            pointer-events: none;
          }
          .section-panel {
            content-visibility: auto;
            contain-intrinsic-size: 1px 600px;
          }
          .section-panel > * {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(6px);
            animation: itemIn 520ms cubic-bezier(.2,.7,.2,1) forwards;
          }
          .section-panel > *:nth-child(1) { animation-delay: .04s; }
          .section-panel > *:nth-child(2) { animation-delay: .08s; }
          .section-panel > *:nth-child(3) { animation-delay: .12s; }
          .section-panel > *:nth-child(4) { animation-delay: .16s; }
          .section-panel > *:nth-child(5) { animation-delay: .2s; }
          .section-panel > *:nth-child(6) { animation-delay: .24s; }
          @keyframes sectionIn {
            0% { opacity: 0; transform: translateY(14px) scale(.98); filter: blur(10px); }
            60% { filter: blur(0px); }
            100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }
          @keyframes sectionSweep {
            0% { opacity: 0; transform: translateX(-20%); }
            40% { opacity: .6; }
            100% { opacity: 0; transform: translateX(120%); }
          }
          @keyframes itemIn {
            0% { opacity: 0; transform: translateY(10px); filter: blur(8px); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); }
          }

          /* Blur and disable interactions on the home screen when tutorial is active */
          .mobile-home-root.tutorial-active > .content-with-navbar {
            filter: blur(2px);
            pointer-events: none;
            transition: filter 0.3s ease-in-out;
            opacity: 0.7;
          }

          /* Ensure the sticky header is also affected */
          .mobile-home-root.tutorial-active > .sticky {
            filter: blur(2px);
            pointer-events: none;
            transition: filter 0.3s ease-in-out;
            opacity: 0.7;
          }
          
          body.tutorial-is-active {
             overflow: hidden;
          }

          .mobile-home-root.tutorial-active .hide-on-tutorial-active {
            display: none;
          }

          /* From Uiverse.io by barisdogansutcu */
          .love-heart:before, #love-switch-home {
            display: none;
          }
          .love-heart, .love-heart::after {
            border-color: hsl(231deg 28% 86%);
            border: 1px solid;
            border-top-left-radius: 100px;
            border-top-right-radius: 100px;
            width: 10px;
            height: 8px;
            border-bottom: 0;
          }
          .round {
            position: absolute;
            z-index: 1;
            width: 8px;
            height: 8px;
            background: hsl(0deg 0% 100%);
            box-shadow: rgb(0 0 0 / 24%) 0px 0px 4px 0px;
            border-radius: 100%;
            left: 0px;
            bottom: -1px;
            transition: all 1.2s ease;
            animation: check-animation2 1.2s forwards;
          }
          input:checked + label .round {
            transform: translate(0px, 0px);
            animation: check-animation 1.2s forwards;
            background-color: hsl(0deg 0% 100%);
          }
          @keyframes check-animation {
            0% { transform: translate(0px, 0px); }
            50% { transform: translate(0px, 7px); }
            100% { transform: translate(7px, 7px); }
          }
          @keyframes check-animation2 {
            0% { transform: translate(7px, 7px); }
            50% { transform: translate(0px, 7px); }
            100% { transform: translate(0px, 0px); }
          }
          .love-heart {
            box-sizing: border-box;
            position: relative;
            transform: rotate(-45deg) translate(-50%, -33px) scale(4);
            display: block;
            border-color: hsl(231deg 28% 86%);
            cursor: pointer;
            top: 0;
          }
          input:checked + .love-heart, 
          input:checked + .love-heart::after, 
          input:checked + .love-heart .bottom {
            border-color: hsl(347deg 81% 61%);
            box-shadow: inset 6px -5px 0px 2px hsl(347deg 99% 72%);
          }
          .love-heart::after, .love-heart .bottom {
            content: "";
            display: block;
            box-sizing: border-box;
            position: absolute;
            border-color: hsl(231deg 28% 86%);
          }
          .love-heart::after {
            right: -9px;
            transform: rotate(90deg);
            top: 7px;
          }
          .love-heart .bottom {
            width: 11px;
            height: 11px;
            border-left: 1px solid;
            border-bottom: 1px solid;
            border-color: hsl(231deg 28% 86%);
            left: -1px;
            top: 5px;
            border-radius: 0px 0px 0px 5px;
          }

          /* From Uiverse.io by SouravBandyopadhyay */
          .cssload-main {
            position: relative;
            width: 124px;
            height: 124px;
          }
          .cssload-main * { font-size: 62px; }
          .cssload-heart {
            animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
            top: 50%;
            left: 50%;
            position: absolute;
            transform: translate(-50%, -65%);
          }
          .cssload-heartL {
            width: 1em;
            height: 1em;
            border: 1px solid rgb(252, 0, 101);
            background-color: rgb(252, 0, 101);
            content: '';
            position: absolute;
            display: block;
            border-radius: 100%;
            animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
            transform: translate(-28px, -27px);
          }
          .cssload-heartR {
            width: 1em;
            height: 1em;
            border: 1px solid rgb(252, 0, 101);
            background-color: rgb(252, 0, 101);
            content: '';
            position: absolute;
            display: block;
            border-radius: 100%;
            transform: translate(28px, -27px);
            animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          }
          .cssload-square {
            width: 1em;
            height: 1em;
            border: 1px solid rgb(252, 0, 101);
            background-color: rgb(252, 0, 101);
            position: relative;
            display: block;
            content: '';
            transform: scale(1) rotate(-45deg);
            animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          }
          .cssload-shadow {
            left: 50%;
            position: absolute;
            bottom: 2px;
            transform: translateX(-50%);
            width: 1em;
            height: .24em;
            background-color: rgb(215,215,215);
            border: 1px solid rgb(215,215,215);
            border-radius: 50%;
            animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          }
          @keyframes cssload-square {
            50% { border-radius: 100%; transform: scale(0.5) rotate(-45deg); }
            100% { transform: scale(1) rotate(-45deg); }
          }
          @keyframes cssload-heart {
            50% { transform: translate(-50%, -65%) rotate(360deg); }
            100% { transform: translate(-50%, -65%) rotate(720deg); }
          }
          @keyframes cssload-heartL { 60% { transform: translate(-28px, -27px) scale(0.4); } }
          @keyframes cssload-heartR { 40% { transform: translate(28px, -27px) scale(0.4); } }
          @keyframes cssload-shadow { 50% { transform: translateX(-50%) scale(0.5); border-color: rgb(228,228,228); } }

          /* Subtle section title effect */
          .section-title {
            position: relative;
            display: inline-block;
            padding-bottom: 2px;
            letter-spacing: 0.02em;
            text-shadow: 0 0 6px rgba(168, 85, 247, 0.08), 0 0 10px rgba(6, 182, 212, 0.06);
          }
          .section-title::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -3px;
            height: 2px;
            width: 100%;
            background: linear-gradient(90deg, rgba(168,85,247,0.6), rgba(6,182,212,0.4), rgba(99,102,241,0.6));
            background-size: 200% 100%;
            transform-origin: left;
            transform: scaleX(0.65);
            opacity: 0.7;
            border-radius: 9999px;
            filter: drop-shadow(0 0 6px rgba(168,85,247,0.25));
            transition: transform .4s cubic-bezier(.2,.7,.2,1), opacity .3s ease, background-position .6s ease;
          }
          .section-title:hover::after {
            transform: scaleX(1);
            opacity: 0.9;
            background-position: 100% 0;
          }
          .section-title:focus-visible::after {
            transform: scaleX(1);
            opacity: 1;
          }
          @media (prefers-reduced-motion: reduce) {
            .section-title::after {
              transition: none;
              background-size: 100% 100%;
            }
          }

        `}</style>
      </div>

      {/* Home Tutorial */}
      <HomeTutorial
        isOpen={showHomeTutorial}
        onClose={() => {
          try { localStorage.setItem('homeTutorialHiddenV1', '1'); } catch {}
          setShowHomeTutorial(false);
        }}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={(q) => {
          setIsSearchOpen(false);
          if (typeof window !== 'undefined') {
            window.location.href = `/explore?query=${encodeURIComponent(q)}`;
          }
        }}
      />

      {/* Debug Overlay */}
      <TutorialDebugOverlay
        isVisible={showDebug}
        onClose={() => setShowDebug(false)}
      />

      {/* Report Modals */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
      
      <CityReportModal
        isOpen={showCityReport}
        onClose={() => setShowCityReport(false)}
      />
    </div>
  );
}
