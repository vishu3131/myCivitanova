'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Calendar, Euro, User, Eye, EyeOff } from 'lucide-react';
import { getPublicDonations, getCampaignDonationStats } from '@/lib/donationsApi';
import type { Donation } from '@/lib/donationsApi';

interface DonationsListProps {
  campaignId: string;
  className?: string;
  refreshTrigger?: number;
}

interface DonationStats {
  total_amount: number;
  total_donations: number;
  average_donation: number;
}

export default function DonationsList({ campaignId, className = '', refreshTrigger }: DonationsListProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadDonations();
  }, [campaignId, refreshTrigger]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [donationsData, statsData] = await Promise.all([
        getPublicDonations(campaignId, showAll ? 50 : 10),
        getCampaignDonationStats(campaignId)
      ]);
      
      setDonations(donationsData);
      setStats(statsData);
    } catch (err) {
      console.error('Errore nel caricamento delle donazioni:', err);
      setError('Errore nel caricamento delle donazioni');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDonorName = (donation: Donation) => {
    if (donation.is_anonymous) {
      return 'Donatore Anonimo';
    }
    return donation.donor_name || 'Donatore';
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/3" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
                <div className="h-3 bg-gray-300 rounded w-3/4" />
              </div>
              <div className="h-6 bg-gray-300 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadDonations}
          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Nessuna donazione ancora</p>
        <p className="text-sm text-gray-400 mt-1">
          Sii il primo a supportare questa campagna!
        </p>
      </div>
    );
  }

  const displayedDonations = showAll ? donations : donations.slice(0, 5);

  return (
    <div className={className}>
      {/* Statistiche */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-2xl font-bold text-emerald-300">
              €{(stats.total_amount || 0).toLocaleString('it-IT')}
            </div>
            <div className="text-sm text-white/60">Totale raccolto</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-2xl font-bold text-blue-300">
              {stats.total_donations}
            </div>
            <div className="text-sm text-white/60">Donazioni</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-2xl font-bold text-purple-300">
              €{(stats.average_donation || 0).toLocaleString('it-IT')}
            </div>
            <div className="text-sm text-white/60">Media donazione</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Donazioni Recenti ({donations.length})
        </h3>
        {donations.length > 5 && (
          <button
            onClick={() => {
              setShowAll(!showAll);
              if (!showAll) {
                loadDonations();
              }
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            {showAll ? (
              <>
                <EyeOff className="w-4 h-4" />
                Mostra meno
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Mostra tutte
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedDonations.map((donation, index) => (
          <motion.div
            key={donation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                  {donation.is_anonymous ? (
                    <Heart className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-white truncate">
                    {getDonorName(donation)}
                  </h4>
                  <div className="flex items-center gap-1 text-emerald-300 font-semibold">
                    <Euro className="w-4 h-4" />
                    {(donation.amount || 0).toLocaleString('it-IT')}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(donation.created_at)}</span>
                </div>

                {donation.message && (
                  <div className="bg-white/5 rounded-lg p-3 mt-2 border border-white/10">
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-white/80 leading-relaxed italic">
                        "{donation.message}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      {stats && (
        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80 font-medium">
              Totale raccolto da {stats.total_donations} donatori
            </span>
            <span className="text-emerald-300 font-bold">
              €{(stats.total_amount || 0).toLocaleString('it-IT')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}