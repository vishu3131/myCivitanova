"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Trophy, Medal, Award, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// Stili CSS per le animazioni
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fadeInUp 0.3s ease-out;
  }
  
  .animate-fade-in-delayed {
    animation: fadeInUp 0.3s ease-out;
    animation-fill-mode: both;
  }
`;

interface LeaderboardUser {
  user_id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  total_xp: number;
  current_level: number;
  badges_count: number;
  rank: number;
}

interface LeaderboardWidgetProps {
  userId?: string;
  limit?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export default function LeaderboardWidget({ 
  userId, 
  limit = 10, 
  showTitle = true, 
  compact = false 
}: LeaderboardWidgetProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_leaderboard', {
        limit_count: limit
      });

      if (error) {
        throw error;
      }

      // La funzione restituisce un array di oggetti, prendiamo il primo elemento
      let leaderboardArray = [];
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Controlla se i dati sono nella struttura attesa
        if (data[0] && data[0].get_leaderboard) {
          leaderboardArray = data[0].get_leaderboard;
        } else if (Array.isArray(data[0])) {
          // Fallback se i dati sono direttamente un array
          leaderboardArray = data;
        }
      }
      
      // Aggiungiamo il rank a ogni utente se non è già presente
      const rankedData = leaderboardArray.map((user: any, index: number) => ({
        ...user,
        rank: user.rank || index + 1
      }));
      
      setLeaderboardData(rankedData);
    } catch (error) {
      console.error('Errore nel caricamento della classifica:', error);
      setError('Impossibile caricare la classifica');
      
      // Fallback con dati demo
      setLeaderboardData([
        {
          user_id: '1',
          display_name: 'Utente Demo',
          email: 'demo@example.com',
          total_xp: 100,
          current_level: 1,
          badges_count: 1,
          rank: 1
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Award className="w-5 h-5 text-orange-400" />;
      default: return <span className="text-white/60 font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'border-yellow-400/50 bg-yellow-400/10';
      case 2: return 'border-gray-300/50 bg-gray-300/10';
      case 3: return 'border-orange-400/50 bg-orange-400/10';
      default: return 'border-white/10 bg-white/5';
    }
  };

  const getUserPosition = () => {
    if (!userId) return null;
    return leaderboardData.find(user => user.user_id === userId);
  };

  if (loading) {
    if (compact) {
      return (
        <div className="space-y-2">
          {[...Array(Math.min(limit, 5))].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg animate-pulse">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white/20 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-white/10 rounded w-20 mb-1"></div>
                <div className="h-2 bg-white/5 rounded w-16"></div>
              </div>
              <div className="text-right">
                <div className="h-3 bg-white/10 rounded w-12 mb-1"></div>
                <div className="h-2 bg-white/5 rounded w-8"></div>
              </div>
            </div>
          ))}
          <div className="mt-3 text-center">
            <div className="h-2 bg-white/5 rounded w-32 mx-auto"></div>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
          <span className="text-white/60">Caricamento classifica...</span>
        </div>
      </div>
    );
  }

  if (error && leaderboardData.length === 0) {
    if (compact) {
      return (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-center">
            <div className="text-red-400 text-sm mb-2">⚠️ Errore nel caricamento</div>
            <button 
              onClick={loadLeaderboard}
              className="px-3 py-1 bg-accent text-black rounded text-xs font-medium hover:bg-accent/90 transition-colors"
            >
              Riprova
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl border border-red-500/20 p-6">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={loadLeaderboard}
            className="mt-3 px-4 py-2 bg-accent text-black rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (compact) {
    // Versione compatta per la home page
    if (leaderboardData.length === 0) {
      return (
        <div className="text-center py-4">
          <Trophy className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-white/60 text-sm">Nessun dato disponibile</p>
          <p className="text-white/40 text-xs">Sii il primo a guadagnare XP!</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {leaderboardData.slice(0, Math.min(limit, 5)).map((user, index) => {
          const isCurrentUser = user.user_id === userId;
          const isTopThree = index < 3;
          
          return (
            <div
              key={user.user_id}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                isCurrentUser 
                  ? 'bg-accent/10 border border-accent/30 shadow-lg shadow-accent/10' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                isTopThree 
                  ? 'bg-accent text-black shadow-lg' 
                  : 'bg-white/10 text-white/70'
              }`}>
                {isTopThree ? ['🥇', '🥈', '🥉'][index] : user.rank}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-white text-sm truncate">
                    {user.display_name}
                  </span>
                  {isCurrentUser && (
                    <span className="text-xs bg-accent text-black px-1.5 py-0.5 rounded-full font-medium animate-pulse">
                      Tu
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-accent font-bold text-sm">{user.total_xp} XP</div>
                <div className="text-xs text-white/60">Lv.{user.current_level}</div>
              </div>
            </div>
          );
        })}
        
        {/* Messaggio se l'utente non è nella top 5 */}
        {userId && !getUserPosition() && (
          <div className="mt-2 p-2 bg-accent/10 border border-accent/30 rounded-lg animate-fade-in">
            <div className="text-center">
              <div className="text-accent font-medium text-sm">Continua a partecipare!</div>
              <div className="text-white/70 text-xs">Scala la classifica guadagnando XP</div>
            </div>
          </div>
        )}
        
        {/* Link per vedere la classifica completa */}
        {leaderboardData.length > 0 && (
          <div className="mt-3 text-center">
            <Link href="/classifica" className="text-xs text-accent hover:text-accent/80 transition-colors underline">
              Vedi classifica completa →
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Versione completa per la pagina dedicata
  return (
    <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      {showTitle && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-white">Classifica Cittadini</h3>
            <div className="flex items-center space-x-1 text-white/60 text-sm">
              <Users className="w-4 h-4" />
              <span>{leaderboardData.length} cittadini</span>
            </div>
          </div>
          {error && (
            <p className="text-yellow-400 text-xs mt-1">⚠️ Dati parzialmente disponibili</p>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Top 3 Podium */}
        {leaderboardData.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {leaderboardData.slice(0, 3).map((user, index) => {
              const isCurrentUser = user.user_id === userId;
              const podiumColors = [
                'border-yellow-400/50 bg-yellow-400/10',
                'border-gray-300/50 bg-gray-300/10', 
                'border-orange-400/50 bg-orange-400/10'
              ];
              const podiumIcons = ['🥇', '🥈', '🥉'];
              
              return (
                <div
                  key={user.user_id}
                  className={`text-center p-3 rounded-lg border ${
                    podiumColors[index]
                  } ${isCurrentUser ? 'ring-2 ring-accent' : ''}`}
                >
                  <div className="text-2xl mb-1">{podiumIcons[index]}</div>
                  <div className="font-bold text-white text-sm truncate mb-1">
                    {user.display_name}
                  </div>
                  <div className="text-accent font-bold text-sm">{user.total_xp} XP</div>
                  <div className="text-xs text-white/60">
                    Lv.{user.current_level} • {user.badges_count} badge
                  </div>
                  {isCurrentUser && (
                    <div className="mt-1">
                      <span className="text-xs bg-accent text-black px-2 py-1 rounded-full font-medium">
                        Tu
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Lista completa */}
        <div className="space-y-2">
          {leaderboardData.map((user, index) => {
            const isCurrentUser = user.user_id === userId;
            const isTopThree = index < 3;
            
            return (
              <div
                key={user.user_id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  isCurrentUser 
                    ? 'bg-accent/10 border-accent/30' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isTopThree 
                    ? 'bg-accent text-black' 
                    : 'bg-white/10 text-white/70'
                }`}>
                  {isTopThree ? ['🥇', '🥈', '🥉'][index] : user.rank}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white truncate">
                      {user.display_name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs bg-accent text-black px-2 py-1 rounded-full font-medium">
                        Tu
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-white/60 truncate">
                    {user.email}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-accent font-bold">{user.total_xp} XP</div>
                  <div className="text-xs text-white/60">
                    Lv.{user.current_level} • {user.badges_count} badge
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Posizione utente se non è nella top list */}
        {userId && !getUserPosition() && (
          <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
            <div className="text-center">
              <div className="text-accent font-bold mb-1">La Tua Posizione</div>
              <div className="text-white/80 text-sm">
                Continua a partecipare per scalare la classifica!
              </div>
              <div className="flex items-center justify-center space-x-1 mt-2 text-white/60 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>Guadagna XP completando attività</span>
              </div>
            </div>
          </div>
        )}

        {leaderboardData.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">Nessun dato disponibile</p>
            <p className="text-white/40 text-sm mt-1">
              Sii il primo a guadagnare XP!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}