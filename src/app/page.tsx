"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { WelcomeWidget } from '@/components/WelcomeWidget';
import { QuickStats } from '@/components/QuickStats';
import { QuickActionsGrid } from '@/components/QuickActionsGrid';
import { GamificationWidget } from '@/components/GamificationWidget';
import { ARTeaserSection } from '@/components/ARTeaserSection';
import { NewsFeed } from '@/components/NewsFeed';
import { SuggestionsWidget } from '@/components/SuggestionsWidget';
import { MobileHomeScreen } from '@/components/MobileHomeScreen';
import { TourARWidget } from '@/components/TourARWidget';
import RiveAnimationWidget from '@/components/RiveAnimationWidget';
import { TailwindTest } from '@/components/TailwindTest';

export default function Home() {
  // Stato per tracciare se la sidebar è aperta o chiusa
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Effetto per ascoltare un evento personalizzato dalla sidebar
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setIsSidebarOpen(e.detail.isOpen);
    };
    
    // Aggiungi event listener per l'evento personalizzato
    window.addEventListener('sidebarToggle' as any, handleSidebarToggle as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('sidebarToggle' as any, handleSidebarToggle as EventListener);
    };
  }, []);

  return (
    <>
      {/* Test component per verificare Tailwind */}
      <TailwindTest />
      
      {/* Mobile View - Show new immersive interface */}
      <div className="block md:hidden">
        <MobileHomeScreen />
      </div>
      
      {/* Desktop View - Keep existing layout */}
      <div className="hidden md:flex min-h-screen bg-dark-400 overflow-hidden">
        {/* Background gradient effect */}
        <div className="fixed inset-0 bg-gradient-to-br from-dark-400 via-dark-400 to-dark-300 z-0"></div>
        
        {/* Subtle noise texture */}
        <div className="fixed inset-0 opacity-5 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
        
        {/* Main content */}
        <div className="relative z-10 flex w-full">
          {/* Sidebar Navigation */}
          <Sidebar />
          
          {/* Main Content Area */}
          <div 
            className={`
              flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto
              transition-all duration-500 ease-in-out
              ${isSidebarOpen ? 'ml-16 md:ml-20 lg:ml-24' : 'ml-0'}
            `}
          >
            <div className="max-w-7xl mx-auto">
              {/* Welcome Widget */}
              <WelcomeWidget />
              
              {/* Quick Actions Grid */}
              <QuickActionsGrid />
              
              {/* Three Column Layout for Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2">
                  {/* AR Teaser Section */}
                  <ARTeaserSection />
                  
                  {/* Suggestions Widget */}
                  <SuggestionsWidget />
                </div>
                
                {/* Sidebar Column */}
                <div>
                  {/* Tour AR Widget */}
                  <TourARWidget />
                  
                  {/* Rive Animation Widget */}
                  <RiveAnimationWidget 
                    title="Animazione Civitanova"
                    description="Interagisci con l'animazione"
                    className="mb-6"
                  />
                  
                  {/* Widget Statistiche */}
                  <QuickStats />
                  {/* Gamification Widget */}
                  <GamificationWidget />
                  
                  {/* News Feed */}
                  <NewsFeed />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
