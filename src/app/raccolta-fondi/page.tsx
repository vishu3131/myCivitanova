"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Timer, 
  Users, 
  MapPin, 
  Euro, 
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Share2
} from 'lucide-react';
import { FundraisingAPI, formatCurrency, calculateProgress, type FundraisingCampaign } from '@/lib/fundraisingApi';
import { CreateCampaignForm } from '@/components/fundraising/CreateCampaignForm';
import DonationModal from '@/components/fundraising/DonationModal';
import LoginPromptModal from '@/components/ui/LoginPromptModal';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';

export default function RaccoltaFondiPage() {
  const { user, role, loading: authLoading } = useAuthWithRole();
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState<FundraisingCampaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stats, setStats] = useState({ totalCampaigns: 0, totalRaised: 0, activeDonors: 0 });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const categories = [
    { value: 'all', label: 'Tutti' },
    { value: 'community', label: 'Comunità' },
    { value: 'environment', label: 'Ambiente' },
    { value: 'culture', label: 'Cultura' },
    { value: 'sport', label: 'Sport' },
    { value: 'education', label: 'Educazione' },
    { value: 'health', label: 'Salute' },
    { value: 'infrastructure', label: 'Infrastrutture' },
    { value: 'other', label: 'Altro' }
  ];

  useEffect(() => {
    loadCampaigns();
    loadStats();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await FundraisingAPI.getApprovedCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      console.error('Error loading campaigns:', err);
      setError(err.message || 'Errore nel caricamento delle campagne');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await FundraisingAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.short_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateSuccess = () => {
    loadCampaigns();
    loadStats();
    setShowCreateForm(false);
  };

  const handleDonationSuccess = () => {
    loadCampaigns();
    loadStats();
    setSelectedCampaignForDonation(null);
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'expired': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attiva';
      case 'completed': return 'Completata';
      case 'expired': return 'Scaduta';
      default: return 'In corso';
    }
  };
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">←</Link>
            <h1 className="text-lg sm:text-xl font-bold">Raccolta Fondi</h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crea Campagna
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Trasforma Civitanova Marche insieme a noi
              </h2>
              <p className="text-white/70 mt-3 text-lg">
                Sostieni i progetti che rendono la nostra città più innovativa e vivibile. 
                Ogni contributo fa la differenza per la nostra comunità.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Scopri i Progetti
                </button>
                {user ? (
                  <button 
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 rounded-lg text-sm font-semibold bg-white/10 border border-white/20 hover:bg-white/15 transition-colors"
                  >
                    Proponi il tuo Progetto
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowLoginPrompt(true)}
                    className="px-6 py-3 rounded-lg text-sm font-semibold bg-white/10 border border-white/20 hover:bg-white/15 transition-colors"
                  >
                    Accedi per Creare
                  </button>
                )}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-blue-600/20 to-emerald-500/10">
                  <div className="text-sm text-white/60 mb-1">Fondi Raccolti</div>
                  <div className="text-3xl font-bold text-emerald-300">
                    €{(stats.totalRaised || 0).toLocaleString()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-4 border border-white/10 bg-white/5">
                    <div className="text-xs text-white/60 mb-1">Campagne</div>
                    <div className="text-xl font-bold">{stats.totalCampaigns}</div>
                  </div>
                  <div className="rounded-xl p-4 border border-white/10 bg-white/5">
                    <div className="text-xs text-white/60 mb-1">Donatori</div>
                    <div className="text-xl font-bold">{stats.activeDonors}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-blue-500/10 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Cerca campagne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/15'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div id="campaigns">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={loadCampaigns}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Riprova
              </button>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Nessuna campagna trovata con i filtri selezionati'
                  : 'Nessuna campagna attiva al momento'
                }
              </p>
              {user ? (
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Crea la Prima Campagna
                </button>
              ) : (
                <button 
                  onClick={() => setShowLoginPrompt(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Accedi per Creare
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => {
                const progress = calculateProgress(campaign.current_amount, campaign.goal_amount);
                const status = campaign.status;
                const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                
                return (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/10 bg-white/5 overflow-hidden group hover:border-white/20 transition-all duration-300"
                  >
                    {/* Campaign Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-600/30 to-emerald-500/20">
                      {campaign.image_url ? (
                        <img 
                          src={campaign.image_url} 
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="w-12 h-12 text-white/30" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full border ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-black/50 text-white/80 border border-white/20">
                        {getCategoryLabel(campaign.category)}
                      </div>
                      
                      {campaign.featured && (
                        <div className="absolute bottom-3 left-3 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          ⭐ In Evidenza
                        </div>
                      )}
                    </div>
                    
                    {/* Campaign Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2 line-clamp-2">{campaign.title}</h3>
                      <p className="text-white/70 text-sm mb-4 line-clamp-2">{campaign.short_description}</p>
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/60">Raccolti</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-emerald-400 font-medium">
                            {formatCurrency(campaign.current_amount || 0)}
                          </span>
                          <span className="text-white/60">
                            di {formatCurrency(campaign.goal_amount || 0)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Campaign Info */}
                      <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{campaign.donor_count || 0} donatori</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          <span>
                            {status === 'active' ? `${daysLeft} giorni rimasti` : 
                             status === 'completed' ? 'Completata' : 'Scaduta'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (user) {
                              setSelectedCampaignForDonation(campaign);
                            } else {
                              setShowLoginPrompt(true);
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Heart className="w-4 h-4" />
                          Dona Ora
                        </button>
                        <Link 
                          href={`/raccolta-fondi/${campaign.id}`}
                          className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm transition-colors flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Beta Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-300">Sistema di Pagamento in Beta</h3>
          </div>
          <p className="text-yellow-200/80 mb-4">
            Il sistema di donazioni è attualmente in fase di sviluppo. Le campagne sono reali e gestite dagli amministratori, 
            ma i pagamenti non sono ancora attivi. Stiamo lavorando per integrare un sistema di pagamento sicuro e affidabile.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-yellow-300 mb-2">Funzionalità Attive:</h4>
              <ul className="space-y-1 text-yellow-200/70">
                <li>✅ Creazione campagne</li>
                <li>✅ Gestione admin</li>
                <li>✅ Tracking donazioni</li>
                <li>✅ Notifiche e aggiornamenti</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-300 mb-2">In Arrivo:</h4>
              <ul className="space-y-1 text-yellow-200/70">
                <li>🔄 Pagamenti sicuri</li>
                <li>🔄 Rimborsi automatici</li>
                <li>🔄 Ricevute fiscali</li>
                <li>🔄 Metodi di pagamento multipli</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Create Campaign Form Modal */}
      <CreateCampaignForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleCreateSuccess}
        currentUser={user}
      />

      {/* Donation Modal */}
      {selectedCampaignForDonation && (
        <DonationModal
          isOpen={!!selectedCampaignForDonation}
          onClose={() => setSelectedCampaignForDonation(null)}
          campaign={selectedCampaignForDonation}
          onDonationSuccess={handleDonationSuccess}
        />
      )}

      {/* Login Prompt Modal */}
       <LoginPromptModal
         isOpen={showLoginPrompt}
         onClose={() => setShowLoginPrompt(false)}
       />
    </div>
  );
}
