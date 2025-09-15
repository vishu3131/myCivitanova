"use client";

import React, { useState, useEffect } from 'react';
import { useXPSystem } from '@/hooks/useXPSystem';
import { DemoXPSystem } from '@/data/demoData';


interface XPWidgetProps {
  userId?: string;
  onClick?: () => void;
}

export function XPWidget({ userId, onClick }: XPWidgetProps) {
  const { userStats, loading, xpNotification } = useXPSystem(userId, { autoDailyLogin: false });
  const [demoMode, setDemoMode] = useState(false);
  const [demoStats, setDemoStats] = useState<any>(null);
  const [demoNotification, setDemoNotification] = useState<any>(null);


  useEffect(() => {
    if (!userId) {
      setDemoMode(true);
      const demoSystem = DemoXPSystem.getInstance();
      const stats = demoSystem.getUserStats();
      setDemoStats(stats);
    } else {
      setDemoMode(false);
    }
  }, [userId]);

  // Se l'utente non è loggato, mostra il messaggio di login
  if (!userId) {
    return (
      <>
        <div className="bg-gradient-to-br from-accent/20 via-dark-300/50 to-blue-500/20 backdrop-blur-sm rounded-xl p-5 border border-accent/20 relative overflow-hidden">
          {/* Effetto luminoso di sfondo */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-blue-500/5 rounded-xl"></div>
          
          {/* Contenuto del messaggio di login */}
          <div className="relative z-10 text-center">
            {/* Icona */}
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl">🔒</span>
            </div>
            
            {/* Titolo */}
            <h3 className="text-white font-semibold text-lg mb-2">Accedi per vedere i tuoi XP</h3>
            
            {/* Descrizione */}
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
              Effettua il login per visualizzare i tuoi punti esperienza,<br/>
              livello e progressi nella community.
            </p>
            
            {/* Pulsante Login */}
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-accent to-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:from-accent/90 hover:to-blue-500/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Accedi ora
            </button>
          </div>
        </div>
        

      </>
    );
  }

  // Usa dati demo o reali
  const currentStats = demoMode ? demoStats : userStats;
  const currentNotification = demoMode ? demoNotification : xpNotification;

  if (loading && !demoMode) {
    return (
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-4 card-glow border border-white/10">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-2 bg-white/10 rounded w-full"></div>
          <div className="h-3 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!currentStats) {
    return (
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-4 card-glow border border-white/10">
        <div className="text-center text-white/60 text-sm">
          Caricamento XP...
        </div>
      </div>
    );
  }

  // Calcola XP per il prossimo livello
  const currentLevelXP = (currentStats.current_level - 1) * 250;
  const nextLevelXP = currentStats.current_level * 250;
  const xpInCurrentLevel = currentStats.total_xp - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentStats.total_xp;

  // Titoli per livelli
  const getLevelTitle = (level: number) => {
    const titles = [
      'Novizio', 'Attivo', 'Impegnato', 'Esperto', 'Veterano',
      'Modello', 'Ambasciatore', 'Guardiano', 'Leggenda', 'Maestro'
    ];
    return titles[Math.min(level - 1, titles.length - 1)] || 'Maestro';
  };

  return (
    <div 
      className="bg-gradient-to-br from-accent/20 via-dark-300/50 to-blue-500/20 backdrop-blur-sm rounded-xl p-5 xp-glow border border-accent/20 cursor-pointer hover:from-accent/30 hover:to-blue-500/30 transition-all duration-300 relative overflow-hidden"
      onClick={onClick}
    >
      {/* Effetto luminoso di sfondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-blue-500/5 rounded-xl"></div>
      
      {/* Notifica XP */}
      {currentNotification && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-accent to-yellow-400 text-white text-xs px-3 py-1 rounded-full animate-bounce z-10 shadow-lg">
          +{currentNotification.xp} XP!
          {currentNotification.levelUp && <span className="ml-1">🆙</span>}
        </div>
      )}

      {/* Badge Demo */}
      {demoMode && (
        <div className="absolute top-2 left-2 bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
          DEMO
        </div>
      )}

      {/* Header con icona e livello */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-gradient-to-br from-accent to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-base font-bold">⚡</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">Esperienza</h3>
            <p className="text-accent text-sm font-medium">{getLevelTitle(currentStats.current_level)}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-accent font-bold text-xl">Lv.{currentStats.current_level}</div>
          <div className="text-white/60 text-sm">#{currentStats.rank_position}</div>
        </div>
      </div>

      {/* XP Totali */}
      <div className="mb-2 relative z-10">
        <div className="flex justify-between items-baseline">
          <span className="text-white font-bold text-2xl">{(currentStats.total_xp || 0).toLocaleString()}</span>
          <span className="text-white/60 text-sm">XP Totali</span>
        </div>
      </div>

      {/* Barra Progresso */}
      <div className="mb-2 relative z-10">
        <div className="flex justify-between text-xs text-white/60 mb-2">
          <span>{xpInCurrentLevel} XP</span>
          <span className="text-accent font-medium">{currentStats.level_progress.toFixed(0)}%</span>
          <span>{nextLevelXP - currentLevelXP} XP</span>
        </div>
        
        {/* Barra principale */}
        <div className="relative">
          <div className="w-full bg-dark-400/50 rounded-full h-[14px] overflow-hidden">
            <div 
              className="bg-gradient-to-r from-accent via-blue-400 to-accent h-[14px] rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${currentStats.level_progress}%` }}
            >
              {/* Effetto shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
          
          {/* Indicatori di milestone */}
          <div className="absolute top-0 left-0 w-full h-[14px] flex justify-between items-center">
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className={`w-1 h-3 rounded-full ${
                  currentStats.level_progress >= milestone 
                    ? 'bg-white/80' 
                    : 'bg-white/20'
                }`}
                style={{ marginLeft: `${milestone}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Info aggiuntive */}
      <div className="flex justify-between items-center text-xs relative z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="text-green-400">🏆</span>
            <span className="text-white/80">{currentStats.badges_count}</span>
          </div>
          <div className="text-white/60">
            {xpNeededForNext > 0 ? `${xpNeededForNext} XP al prossimo livello` : 'Livello massimo!'}
          </div>
        </div>
      </div>

      {/* Effetto particelle (opzionale) */}
      <div className="absolute inset-0 pointer-events-none">
        {currentNotification && (
          <>
            <div className="absolute top-4 right-8 w-1 h-1 bg-accent rounded-full animate-ping"></div>
            <div className="absolute top-6 right-12 w-1 h-1 bg-blue-400 rounded-full animate-ping animation-delay-200"></div>
            <div className="absolute top-8 right-6 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-400"></div>
          </>
        )}
      </div>
    </div>
  );
}

// Widget XP compatto per spazi più piccoli
export function XPWidgetCompact({ userId, onClick }: XPWidgetProps) {
  const { userStats, loading, xpNotification } = useXPSystem(userId, { autoDailyLogin: false });
  const [demoMode, setDemoMode] = useState(false);
  const [demoStats, setDemoStats] = useState<any>(null);


  useEffect(() => {
    if (!userId) {
      setDemoMode(true);
      const demoSystem = DemoXPSystem.getInstance();
      const stats = demoSystem.getUserStats();
      setDemoStats(stats);
    }
  }, [userId]);

  // Se l'utente non è loggato, mostra il messaggio di login compatto
  if (!userId) {
    return (
      <>
        <div className="bg-gradient-to-br from-accent/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-3 border border-accent/20 relative">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-sm">🔒</span>
            </div>
            <h4 className="text-white font-semibold text-sm mb-1">Login richiesto</h4>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-accent to-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:from-accent/90 hover:to-blue-500/90 transition-all duration-300"
            >
              Accedi
            </button>
          </div>
        </div>
        

      </>
    );
  }

  const currentStats = demoMode ? demoStats : userStats;
  const currentNotification = demoMode ? null : xpNotification;

  if (loading && !demoMode) {
    return (
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-3 card-glow border border-white/10">
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-white/10 rounded w-3/4"></div>
          <div className="h-2 bg-white/10 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!currentStats) return null;

  return (
    <div 
      className="bg-gradient-to-br from-accent/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-3 card-glow border border-accent/20 cursor-pointer hover:from-accent/30 hover:to-blue-500/30 transition-all duration-300 relative"
      onClick={onClick}
    >
      {currentNotification && (
        <div className="absolute -top-1 -right-1 bg-accent text-white text-xs px-2 py-1 rounded-full animate-bounce">
          +{currentNotification.xp}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-accent to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">⚡</span>
          </div>
          <span className="text-white font-semibold text-sm">XP</span>
        </div>
        <span className="text-accent font-bold text-sm">Lv.{currentStats.current_level}</span>
      </div>

      <div className="mb-2">
        <div className="text-white font-bold text-lg">{(currentStats.total_xp || 0).toLocaleString()}</div>
      </div>

      <div className="w-full bg-dark-400/50 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-accent to-blue-400 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${currentStats.level_progress}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs text-white/60 mt-1">
        <span>{currentStats.level_progress.toFixed(0)}%</span>
        <span>🏆 {currentStats.badges_count}</span>
      </div>
    </div>
  );
}