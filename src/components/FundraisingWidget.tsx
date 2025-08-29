"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartHandshake, Coins, Sparkles } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

interface FundraisingStats {
  totalRaised: number;
  activeCampaigns: number;
  totalCampaigns: number;
}

export default function FundraisingWidget() {
  const [stats, setStats] = useState<FundraisingStats>({
    totalRaised: 0,
    activeCampaigns: 0,
    totalCampaigns: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFundraisingStats();
  }, []);

  const fetchFundraisingStats = async () => {
    try {
      // Fetch campaign statistics
      const { data: campaigns, error } = await supabase
        .from('fundraising_campaigns')
        .select('raised_amount, status')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching fundraising stats:', error);
        return;
      }

      const totalRaised = campaigns?.reduce((sum, campaign) => sum + (campaign.raised_amount || 0), 0) || 0;
      const activeCampaigns = campaigns?.length || 0;

      // Get total campaigns count
      const { count: totalCount } = await supabase
        .from('fundraising_campaigns')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalRaised,
        activeCampaigns,
        totalCampaigns: totalCount || 0
      });
    } catch (error) {
      console.error('Error fetching fundraising stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-2 sm:p-3 card-glow border border-white/10">
      <div className="flex items-start gap-2">
        {/* Icona */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-400/20 rounded-lg flex items-center justify-center shrink-0">
          <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
        </div>

        {/* Testi e contenuto */}
        <div className="flex-1 min-w-0">
          {/* Titolo + badge */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h3 className="text-white font-semibold text-[11px] sm:text-xs leading-none">Raccolta Fondi</h3>
            <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30 shrink-0">Attivo</span>
          </div>

          {/* Descrizione breve */}
          <p className="text-white/70 text-[10px] sm:text-[11px] mt-1 leading-snug">
            Sostieni i progetti che migliorano Civitanova Marche.
          </p>

          {/* Mini stats - in colonna su mobile, 2 colonne da sm in su */}
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 sm:p-2">
              <div className="text-[9px] sm:text-[10px] text-white/60 leading-none">Totale raccolto</div>
              <div className="text-[11px] sm:text-xs font-semibold text-emerald-300 mt-0.5">
                {loading ? '...' : formatCurrency(stats.totalRaised)}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 sm:p-2">
              <div className="text-[9px] sm:text-[10px] text-white/60 leading-none">Progetti attivi</div>
              <div className="text-[11px] sm:text-xs font-semibold text-cyan-300 mt-0.5">
                {loading ? '...' : stats.activeCampaigns}
              </div>
            </div>
          </div>

          {/* Azioni - singola colonna su mobile, due colonne da sm in su */}
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            <Link href="/raccolta-fondi" className="group" aria-label="Scopri i Progetti">
              <div className="w-full py-1.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] text-center bg-gradient-to-r from-blue-600/80 to-emerald-500/80 text-white border border-white/10 hover:from-blue-500 hover:to-emerald-400 transition-all shadow">
                Scopri i Progetti
              </div>
            </Link>
            <Link href="/raccolta-fondi#creatori" className="group" aria-label="Proponi Progetto">
              <div className="w-full py-1.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] text-center bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-colors flex items-center justify-center gap-1">
                <HeartHandshake className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-300" />
                Proponi Progetto
              </div>
            </Link>
          </div>

          {/* Footer informativo - nascosto su mobile stretto */}
          <div className="mt-2 hidden sm:flex items-center justify-between text-[10px] text-white/60">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>Match donatori intelligente</span>
            </div>
            <span className="text-white/40">Beta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
