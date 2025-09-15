"use client";

import React, { useState, useEffect } from 'react';
import { BadgeSystem } from './BadgeSystem';
import { supabase } from '@/utils/supabaseClient';
import { useCallback } from 'react';

interface BadgePageProps {
  userId?: string;
  onClose?: () => void;
}

export function BadgePage({ userId, onClose }: BadgePageProps) {
  const [activeTab, setActiveTab] = useState<'earned' | 'available' | 'leaderboard'>('earned');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-dark-300/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                ← Indietro
              </button>
              <h1 className="text-2xl font-bold">Sistema Badge</h1>
            </div>
            <div className="text-accent text-sm">
              🏆 Sistema di Gamification
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('earned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'earned'
                  ? 'bg-accent text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              I Miei Badge
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'available'
                  ? 'bg-accent text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Disponibili
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-accent text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Classifica
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'earned' && (
          <div>
            <BadgeSystem userId={userId || ''} showNotifications={false} />
          </div>
        )}
        
        {activeTab === 'available' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-xl font-bold mb-2">Obiettivi da Raggiungere</h2>
              <p className="text-white/60">
                Completa le attività per sbloccare nuovi badge e guadagnare XP!
              </p>
            </div>
            
            {/* Qui verrà mostrata la lista dei badge disponibili */}
            <BadgeSystem userId={userId || ''} showNotifications={false} />
          </div>
        )}
        
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏆</div>
              <h2 className="text-xl font-bold mb-2">Classifica Cittadini</h2>
              <p className="text-white/60">
                Vedi come ti posizioni rispetto agli altri cittadini attivi!
              </p>
            </div>
            
            <LeaderboardComponent userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Classifica
function LeaderboardComponent({ userId }: { userId?: string }) {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        limit_count: 20
      });

      if (error) throw error;

      // Normalizza la risposta RPC per ottenere un array di utenti
      let leaderboardArray: any[] = [];
      if (Array.isArray(data)) {
        if (data.length > 0) {
          const first = (data as any)[0];
          if (first && Array.isArray(first)) {
            leaderboardArray = first as any[];
          } else if (first && typeof first === 'object' && 'get_leaderboard' in first && Array.isArray((first as any).get_leaderboard)) {
            leaderboardArray = (first as any).get_leaderboard;
          } else {
            leaderboardArray = data as any[];
          }
        } else {
          leaderboardArray = [];
        }
      } else if (data && typeof data === 'object' && 'get_leaderboard' in (data as any) && Array.isArray((data as any).get_leaderboard)) {
        leaderboardArray = (data as any).get_leaderboard;
      } else {
        leaderboardArray = [];
      }

      // Aggiungi rank se mancante e filtra per >= 100 XP
      const ranked = leaderboardArray.map((user: any, index: number) => ({
        ...user,
        rank: user?.rank ?? index + 1,
      }));
      const filtered = ranked.filter((u: any) => (u?.total_xp ?? 0) >= 100);

      setLeaderboardData(filtered);
    } catch (error) {
      console.error('Errore nel caricamento della classifica:', error);
      // Fallback con dati demo se il database non è disponibile
      setLeaderboardData([
        { id: '1', username: 'demo_user', display_name: 'Utente Demo', total_xp: 100, current_level: 1, badges_count: 1, rank: 1 }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Aggiorna la classifica quando arrivano aggiornamenti XP globali
  useEffect(() => {
    const handler = () => {
      loadLeaderboard();
    };
    window.addEventListener('xp-updated', handler as EventListener);
    return () => {
      window.removeEventListener('xp-updated', handler as EventListener);
    };
  }, [loadLeaderboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <span className="ml-2 text-white">Caricamento classifica...</span>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400 bg-yellow-400/20';
      case 2: return 'text-gray-300 bg-gray-300/20';
      case 3: return 'text-orange-400 bg-orange-400/20';
      default: return 'text-white/60 bg-white/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {leaderboardData.slice(0, 3).map((user, index) => (
          <div
            key={user.id}
            className={`text-center p-6 rounded-xl border ${
              index === 0 
                ? 'border-yellow-400/50 bg-yellow-400/10' 
                : index === 1 
                ? 'border-gray-300/50 bg-gray-300/10'
                : 'border-orange-400/50 bg-orange-400/10'
            }`}
          >
            <div className="text-4xl mb-2">{getRankIcon(user.rank)}</div>
            <div className="font-bold text-white mb-1">{user.display_name}</div>
            <div className="text-sm text-white/60 mb-2">@{user.username}</div>
            <div className="text-accent font-bold">{user.total_xp} XP</div>
            <div className="text-xs text-white/60">Lv.{user.current_level} • {user.badges_count} badge</div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Classifica Completa</h3>
        </div>
        <div className="divide-y divide-white/10">
          {leaderboardData.map((user) => (
            <div
              key={user.id}
              className={`p-4 flex items-center space-x-4 hover:bg-white/5 transition-colors ${
                user.id === userId ? 'bg-accent/10 border-l-4 border-accent' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankColor(user.rank)}`}>
                {getRankIcon(user.rank)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{user.display_name}</span>
                  {user.id === userId && (
                    <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">Tu</span>
                  )}
                </div>
                <div className="text-sm text-white/60">@{user.username}</div>
              </div>
              
              <div className="text-right">
                <div className="text-accent font-bold">{user.total_xp} XP</div>
                <div className="text-xs text-white/60">
                  Lv.{user.current_level} • {user.badges_count} badge
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User's Position (if not in top 5) */}
      {userId && !leaderboardData.some(u => u.id === userId) && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
          <div className="text-center">
            <div className="text-accent font-bold mb-2">La Tua Posizione</div>
            <div className="text-white/80">
              Continua a partecipare per scalare la classifica!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}