'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Euro,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  User,
  Calendar,
  CreditCard,
  MessageSquare,
  X,
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react';
import { getCampaignDonations, getCampaignDonationStats, updateDonationStatus, type Donation } from '@/lib/donationsApi';
import { FundraisingAPI, type FundraisingCampaign } from '@/lib/fundraisingApi';

interface DonationsManagementProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
}

interface DonationStats {
  totalAmount: number;
  totalDonations: number;
  averageDonation: number;
}

export function DonationsManagement({ isOpen, onClose, campaignId }: DonationsManagementProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string>(campaignId || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load campaigns for filter
      const campaignsData = await FundraisingAPI.getCampaigns({ limit: 100 });
      setCampaigns(campaignsData || []);
      
      // Load donations
      if (selectedCampaign && selectedCampaign !== 'all') {
        const [donationsData, statsData] = await Promise.all([
          getCampaignDonations(selectedCampaign),
          getCampaignDonationStats(selectedCampaign)
        ]);
        setDonations(donationsData || []);
        setStats(statsData);
      } else {
        // Load all donations (we'll need to implement this in the API)
        setDonations([]);
        setStats(null);
      }
    } catch (error) {
      console.error('Error loading donations data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCampaign]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const handleUpdateDonationStatus = async (donationId: string, status: 'completed' | 'failed' | 'refunded') => {
    try {
      setActionLoading(donationId);
      await updateDonationStatus(donationId, status);
      await loadData();
      setShowDonationModal(false);
    } catch (error) {
      console.error('Error updating donation status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const openDonationModal = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowDonationModal(true);
  };

  const getStatusIcon = (status: Donation['payment_status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Donation['payment_status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'refunded':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesStatus = statusFilter === 'all' || donation.payment_status === statusFilter;
    const matchesSearch = !searchTerm || 
      donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Euro className="w-6 h-6" />
                  Gestione Donazioni
                </h2>
                <p className="text-blue-100 mt-1">
                  Monitora e gestisci tutte le donazioni delle campagne
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Euro className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Totale Raccolto</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 text-sm font-medium">Donazioni</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalDonations}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium">Media Donazione</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.averageDonation)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Campaign Filter */}
                <div className="relative">
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="appearance-none bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-8 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tutte le campagne</option>
                    {campaigns.map(campaign => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.title}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="appearance-none bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-8 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tutti gli stati</option>
                    <option value="pending">In attesa</option>
                    <option value="completed">Completate</option>
                    <option value="failed">Fallite</option>
                    <option value="refunded">Rimborsate</option>
                  </select>
                  <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cerca per donatore, email o riferimento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={loadData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Aggiorna
              </button>
            </div>
          </div>

          {/* Donations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-400">Caricamento donazioni...</span>
              </div>
            ) : (
              <div className="p-6">
                {filteredDonations.length === 0 ? (
                  <div className="text-center py-12">
                    <Euro className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nessuna donazione trovata</p>
                    <p className="text-gray-500 text-sm">Le donazioni appariranno qui quando saranno effettuate</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDonations.map((donation) => (
                      <DonationCard
                        key={donation.id}
                        donation={donation}
                        onViewDetails={() => openDonationModal(donation)}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Donation Details Modal */}
      {showDonationModal && selectedDonation && (
        <DonationDetailsModal
          donation={selectedDonation}
          onUpdateStatus={(status) => handleUpdateDonationStatus(selectedDonation.id, status)}
          onClose={() => setShowDonationModal(false)}
          loading={actionLoading === selectedDonation.id}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
        />
      )}
    </AnimatePresence>
  );
}

// Donation Card Component
function DonationCard({
  donation,
  onViewDetails,
  getStatusIcon,
  getStatusColor,
  formatCurrency,
  formatDate
}: {
  donation: Donation;
  onViewDetails: () => void;
  getStatusIcon: (status: Donation['payment_status']) => React.ReactNode;
  getStatusColor: (status: Donation['payment_status']) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(donation.payment_status)}`}>
              {getStatusIcon(donation.payment_status)}
              <span className="capitalize">{donation.payment_status}</span>
            </div>
            <span className="text-lg font-bold text-white">{formatCurrency(donation.amount)}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>
                {donation.is_anonymous 
                  ? 'Donatore anonimo' 
                  : donation.donor_name || donation.donor_email || 'N/A'
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(donation.created_at)}</span>
            </div>
            {donation.payment_method && (
              <div className="flex items-center gap-1">
                <CreditCard className="w-4 h-4" />
                <span className="capitalize">{donation.payment_method}</span>
              </div>
            )}
          </div>

          {donation.message && (
            <div className="flex items-start gap-1 text-sm text-gray-300">
              <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{donation.message}</span>
            </div>
          )}
        </div>

        <button
          onClick={onViewDetails}
          className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Donation Details Modal Component
function DonationDetailsModal({
  donation,
  onUpdateStatus,
  onClose,
  loading,
  formatCurrency,
  formatDate,
  getStatusIcon,
  getStatusColor
}: {
  donation: Donation;
  onUpdateStatus: (status: 'completed' | 'failed' | 'refunded') => void;
  onClose: () => void;
  loading: boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  getStatusIcon: (status: Donation['payment_status']) => React.ReactNode;
  getStatusColor: (status: Donation['payment_status']) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Dettagli Donazione</h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Donation Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Importo</label>
              <p className="text-2xl font-bold text-white">{formatCurrency(donation.amount)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Stato</label>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(donation.payment_status)}`}>
                {getStatusIcon(donation.payment_status)}
                <span className="capitalize">{donation.payment_status}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Donatore</label>
              <p className="text-white">
                {donation.is_anonymous 
                  ? 'Donatore anonimo' 
                  : donation.donor_name || 'N/A'
                }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <p className="text-white">
                {donation.is_anonymous 
                  ? 'Nascosta' 
                  : donation.donor_email || 'N/A'
                }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Data</label>
              <p className="text-white">{formatDate(donation.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Metodo di Pagamento</label>
              <p className="text-white capitalize">{donation.payment_method || 'N/A'}</p>
            </div>
            {donation.payment_reference && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Riferimento Pagamento</label>
                <p className="text-white font-mono text-sm bg-gray-700 p-2 rounded">{donation.payment_reference}</p>
              </div>
            )}
          </div>

          {donation.message && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Messaggio</label>
              <div className="bg-gray-700 rounded-lg p-4 text-white">
                {donation.message}
              </div>
            </div>
          )}

          {/* Actions */}
          {donation.payment_status === 'pending' && (
            <div className="flex gap-4">
              <button
                onClick={() => onUpdateStatus('completed')}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Conferma Pagamento
              </button>
              <button
                onClick={() => onUpdateStatus('failed')}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Segna come Fallita
              </button>
            </div>
          )}

          {donation.payment_status === 'completed' && (
            <button
              onClick={() => onUpdateStatus('refunded')}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Rimborsa Donazione
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default DonationsManagement;