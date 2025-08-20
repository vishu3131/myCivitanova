'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  StarOff,
  Eye,
  Edit3,
  Trash2,
  X,
  Euro,
  Users,
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { FundraisingAPI, FundraisingCampaign, formatCurrency, getCampaignStatusColor, getCampaignStatusText } from '@/lib/fundraisingApi';
import { DonationsManagement } from './DonationsManagement';

interface FundraisingManagementProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
}

export function FundraisingManagement({ isOpen, onClose, currentUser }: FundraisingManagementProps) {
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'cancelled' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'community' | 'environment' | 'culture' | 'sport' | 'education' | 'health' | 'infrastructure' | 'other'>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<FundraisingCampaign | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDonationsModal, setShowDonationsModal] = useState(false);
  const [selectedCampaignForDonations, setSelectedCampaignForDonations] = useState<string | undefined>(undefined);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const data = await FundraisingAPI.getCampaigns({
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        search: searchTerm || undefined,
        limit: 100
      });
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    if (isOpen) {
      loadCampaigns();
    }
  }, [isOpen, loadCampaigns]);

  const handleApproveCampaign = async (campaignId: string) => {
    try {
      setActionLoading(campaignId);
      await FundraisingAPI.approveCampaign(campaignId, adminNotes);
      await loadCampaigns();
      setAdminNotes('');
      setShowCampaignModal(false);
    } catch (error) {
      console.error('Error approving campaign:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectCampaign = async (campaignId: string) => {
    try {
      setActionLoading(campaignId);
      await FundraisingAPI.rejectCampaign(campaignId, adminNotes);
      await loadCampaigns();
      setAdminNotes('');
      setShowCampaignModal(false);
    } catch (error) {
      console.error('Error rejecting campaign:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (campaignId: string, featured: boolean) => {
    try {
      setActionLoading(campaignId);
      await FundraisingAPI.toggleFeatured(campaignId, featured);
      await loadCampaigns();
    } catch (error) {
      console.error('Error toggling featured:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa campagna? Questa azione non può essere annullata.')) {
      return;
    }

    try {
      setActionLoading(campaignId);
      await FundraisingAPI.deleteCampaign(campaignId);
      await loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const openCampaignModal = (campaign: FundraisingCampaign) => {
    setSelectedCampaign(campaign);
    setAdminNotes(campaign.admin_notes || '');
    setShowCampaignModal(true);
  };

  const getStatusIcon = (status: FundraisingCampaign['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: FundraisingCampaign['category']) => {
    switch (category) {
      case 'community':
        return <Users className="w-4 h-4" />;
      case 'environment':
        return <TrendingUp className="w-4 h-4" />;
      case 'culture':
        return <Star className="w-4 h-4" />;
      case 'sport':
        return <Target className="w-4 h-4" />;
      case 'education':
        return <Users className="w-4 h-4" />;
      case 'health':
        return <Heart className="w-4 h-4" />;
      case 'infrastructure':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
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
          className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Heart className="w-6 h-6" />
                Gestione Raccolta Fondi
              </h2>
              <p className="text-gray-400">Gestisci campagne di raccolta fondi e donazioni</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Stats */}
          <div className="p-6 border-b border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">Totale Campagne</span>
                </div>
                <p className="text-2xl font-bold text-white">{campaigns.length}</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">In Attesa</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {campaigns.filter(c => c.status === 'pending').length}
                </p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Attive</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">Completate</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {campaigns.filter(c => c.status === 'completed').length}
                </p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Euro className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Totale Raccolto</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(campaigns.reduce((sum, c) => sum + c.current_amount, 0))}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cerca campagne..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full md:w-64"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="pending">In attesa</option>
                  <option value="active">Attive</option>
                  <option value="completed">Completate</option>
                  <option value="cancelled">Annullate</option>
                  <option value="rejected">Rifiutate</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Tutte le categorie</option>
                  <option value="community">Comunità</option>
                  <option value="environment">Ambiente</option>
                  <option value="culture">Cultura</option>
                  <option value="sport">Sport</option>
                  <option value="education">Educazione</option>
                  <option value="health">Salute</option>
                  <option value="infrastructure">Infrastrutture</option>
                  <option value="other">Altro</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCampaignForDonations(undefined);
                    setShowDonationsModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Euro className="w-4 h-4" />
                  Gestisci Donazioni
                </button>
              </div>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="ml-2 text-white">Caricamento...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onApprove={() => openCampaignModal(campaign)}
                    onReject={() => openCampaignModal(campaign)}
                    onToggleFeatured={(featured) => handleToggleFeatured(campaign.id, featured)}
                    onDelete={() => handleDeleteCampaign(campaign.id)}
                    onViewDetails={() => openCampaignModal(campaign)}
                    onViewDonations={() => {
                      setSelectedCampaignForDonations(campaign.id);
                      setShowDonationsModal(true);
                    }}
                    loading={actionLoading === campaign.id}
                    getStatusIcon={getStatusIcon}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
                {campaigns.length === 0 && (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nessuna campagna trovata</p>
                    <p className="text-gray-500 text-sm">Le campagne di raccolta fondi appariranno qui</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Campaign Details Modal */}
      {showCampaignModal && selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          adminNotes={adminNotes}
          setAdminNotes={setAdminNotes}
          onApprove={() => handleApproveCampaign(selectedCampaign.id)}
          onReject={() => handleRejectCampaign(selectedCampaign.id)}
          onClose={() => setShowCampaignModal(false)}
          loading={actionLoading === selectedCampaign.id}
        />
      )}

      {/* Donations Management Modal */}
      <DonationsManagement
        isOpen={showDonationsModal}
        onClose={() => setShowDonationsModal(false)}
        campaignId={selectedCampaignForDonations}
      />
    </AnimatePresence>
  );
}

// Campaign Card Component
function CampaignCard({
  campaign,
  onApprove,
  onReject,
  onToggleFeatured,
  onDelete,
  onViewDetails,
  onViewDonations,
  loading,
  getStatusIcon,
  getCategoryIcon
}: {
  campaign: FundraisingCampaign;
  onApprove: () => void;
  onReject: () => void;
  onToggleFeatured: (featured: boolean) => void;
  onDelete: () => void;
  onViewDetails: () => void;
  onViewDonations: () => void;
  loading: boolean;
  getStatusIcon: (status: FundraisingCampaign['status']) => React.ReactNode;
  getCategoryIcon: (category: FundraisingCampaign['category']) => React.ReactNode;
}) {
  const [showActions, setShowActions] = useState(false);
  const progress = campaign.goal_amount > 0 ? (campaign.current_amount / campaign.goal_amount) * 100 : 0;

  return (
    <motion.div
      layout
      className="bg-gray-700 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(campaign.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCampaignStatusColor(campaign.status)}`}>
              {getCampaignStatusText(campaign.status)}
            </span>
            {campaign.is_featured && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
            <div className="flex items-center gap-1 text-gray-400">
              {getCategoryIcon(campaign.category)}
              <span className="text-sm capitalize">{campaign.category}</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{campaign.title}</h3>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{campaign.short_description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{campaign.creator?.full_name || campaign.creator?.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(campaign.created_at).toLocaleDateString('it-IT')}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400">Progresso</span>
              <span className="text-sm font-medium text-white">
                {formatCurrency(campaign.current_amount)} / {formatCurrency(campaign.goal_amount)}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">{progress.toFixed(1)}%</span>
              <span className="text-xs text-gray-400">{campaign.donors_count} donatori</span>
            </div>
          </div>
        </div>

        <div className="relative ml-4">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <MoreVertical className="w-4 h-4" />
            )}
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10">
              <div className="py-2">
                <button
                  onClick={() => {
                    onViewDetails();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Visualizza dettagli
                </button>
                
                <button
                  onClick={() => {
                    onViewDonations();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-gray-700 flex items-center gap-2"
                >
                  <Euro className="w-4 h-4" />
                  Gestisci donazioni
                </button>
                
                {campaign.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        onApprove();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approva
                    </button>
                    <button
                      onClick={() => {
                        onReject();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Rifiuta
                    </button>
                  </>
                )}
                
                {campaign.status === 'active' && (
                  <button
                    onClick={() => {
                      onToggleFeatured(!campaign.is_featured);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-yellow-400 hover:bg-gray-700 flex items-center gap-2"
                  >
                    {campaign.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    {campaign.is_featured ? 'Rimuovi da in evidenza' : 'Metti in evidenza'}
                  </button>
                )}
                
                <div className="border-t border-gray-600 my-1" />
                
                <button
                  onClick={() => {
                    onDelete();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Elimina
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Campaign Details Modal Component
function CampaignDetailsModal({
  campaign,
  adminNotes,
  setAdminNotes,
  onApprove,
  onReject,
  onClose,
  loading
}: {
  campaign: FundraisingCampaign;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const progress = campaign.goal_amount > 0 ? (campaign.current_amount / campaign.goal_amount) * 100 : 0;

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
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Dettagli Campagna</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Campaign Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{campaign.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Creatore</label>
                <p className="text-white">{campaign.creator?.full_name || campaign.creator?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Categoria</label>
                <p className="text-white capitalize">{campaign.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Obiettivo</label>
                <p className="text-white">{formatCurrency(campaign.goal_amount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Raccolto</label>
                <p className="text-white">{formatCurrency(campaign.current_amount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Data Inizio</label>
                <p className="text-white">{new Date(campaign.start_date).toLocaleDateString('it-IT')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Data Fine</label>
                <p className="text-white">{new Date(campaign.end_date).toLocaleDateString('it-IT')}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-400">Progresso</span>
                <span className="text-sm font-medium text-white">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Descrizione</label>
              <div className="bg-gray-700 rounded-lg p-4 text-white whitespace-pre-wrap">
                {campaign.description}
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Note Admin</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Aggiungi note per il creatore della campagna..."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              rows={4}
            />
          </div>

          {/* Actions */}
          {campaign.status === 'pending' && (
            <div className="flex gap-4">
              <button
                onClick={onApprove}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approva Campagna
              </button>
              <button
                onClick={onReject}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Rifiuta Campagna
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default FundraisingManagement;