"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Calendar, Users, Star } from 'lucide-react';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import { supabase } from '@/utils/supabaseClient.ts';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
}

export default function ClassificaPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCurrentUser(profile);
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento utente:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeFilterOptions = [
    { value: 'all', label: 'Tutto il tempo', icon: Trophy },
    { value: 'monthly', label: 'Questo mese', icon: Calendar },
    { value: 'weekly', label: 'Questa settimana', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-400 via-dark-300 to-dark-400">
      {/* Header */}
      <div className="bg-dark-300/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-black" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Classifica Cittadini
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto">
              Scopri i cittadini più attivi di Civitanova Marche e vedi come ti posizioni nella community!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filtri temporali */}
        <div className="mb-8">
          <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Periodo di riferimento</h2>
              <div className="flex items-center space-x-1 text-white/60 text-sm">
                <Star className="w-4 h-4" />
                <span>Aggiornato in tempo reale</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {timeFilterOptions.map((option) => {
                const Icon = option.icon;
                const isActive = timeFilter === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setTimeFilter(option.value as any)}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-accent/20 border-accent/50 text-accent'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{option.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-accent rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Statistiche rapide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">1°</div>
                <div className="text-white/60 text-sm">Posizione più alta</div>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-400/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">6</div>
                <div className="text-white/60 text-sm">Cittadini attivi</div>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">+15%</div>
                <div className="text-white/60 text-sm">Crescita settimanale</div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget Classifica */}
        <div className="mb-8">
          <LeaderboardWidget 
            userId={currentUser?.id}
            limit={20}
            showTitle={true}
            compact={false}
          />
        </div>

        {/* Informazioni aggiuntive */}
        <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Come funziona la classifica?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center">
                <Star className="w-4 h-4 text-accent mr-2" />
                Guadagna XP
              </h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Partecipa agli eventi della città</li>
                <li>• Completa attività civiche</li>
                <li>• Interagisci con la community</li>
                <li>• Segnala problemi e migliorie</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center">
                <Medal className="w-4 h-4 text-accent mr-2" />
                Ottieni Badge
              </h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Raggiungi traguardi specifici</li>
                <li>• Completa sfide settimanali</li>
                <li>• Mantieni streak di attività</li>
                <li>• Contribuisci alla community</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Trophy className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <div className="text-accent font-medium text-sm">Premi e Riconoscimenti</div>
                <div className="text-white/70 text-sm mt-1">
                  I cittadini più attivi ricevono riconoscimenti speciali e possono partecipare a eventi esclusivi organizzati dal Comune di Civitanova Marche.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}