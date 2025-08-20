'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Calendar, 
  Target, 
  Users, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MessageCircle
} from 'lucide-react';
import { FundraisingAPI, type FundraisingCampaign } from '@/lib/fundraisingApi';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';
import DonationForm from '@/components/fundraising/DonationForm';
import DonationsList from '@/components/fundraising/DonationsList';
import CampaignUpdates from '@/components/fundraising/CampaignUpdates';

const CATEGORIES = [
  { value: 'community', label: 'Comunità', color: 'bg-blue-100 text-blue-800' },
  { value: 'environment', label: 'Ambiente', color: 'bg-green-100 text-green-800' },
  { value: 'culture', label: 'Cultura', color: 'bg-purple-100 text-purple-800' },
  { value: 'sports', label: 'Sport', color: 'bg-orange-100 text-orange-800' },
  { value: 'education', label: 'Educazione', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'health', label: 'Salute', color: 'bg-red-100 text-red-800' },
  { value: 'technology', label: 'Tecnologia', color: 'bg-gray-100 text-gray-800' },
  { value: 'other', label: 'Altro', color: 'bg-yellow-100 text-yellow-800' }
];

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthWithRole();
  const [campaign, setCampaign] = useState<FundraisingCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadCampaign(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (campaign && user) {
      checkUserInteractions();
    }
  }, [campaign, user]);

  const loadCampaign = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await FundraisingAPI.getCampaignById(id);
      setCampaign(result);
    } catch (err) {
      console.error('Errore nel caricamento della campagna:', err);
      setError('Campagna non trovata');
    } finally {
      setLoading(false);
    }
  };

  const checkUserInteractions = async () => {
    if (!campaign || !user) return;

    try {
      const [likeStatus, followStatus] = await Promise.all([
        FundraisingAPI.getUserLikeStatus(campaign.id, user.id),
        FundraisingAPI.getUserFollowStatus(campaign.id, user.id)
      ]);
      setIsLiked(likeStatus.liked);
      setIsFollowing(followStatus.following);
    } catch (err) {
      console.error('Errore nel controllo delle interazioni:', err);
    }
  };

  const handleLike = async () => {
    if (!campaign || !user) return;

    try {
      const result = await FundraisingAPI.toggleLike(campaign.id, user.id);
      setIsLiked(result.liked);
      // Reload campaign to get updated likes count
      loadCampaign(campaign.id);
    } catch (err) {
      console.error('Errore nel like:', err);
    }
  };

  const handleFollow = async () => {
    if (!campaign || !user) return;

    try {
      const result = await FundraisingAPI.toggleFollow(campaign.id, user.id);
      setIsFollowing(result.following);
      // Reload campaign to get updated follows count
      loadCampaign(campaign.id);
    } catch (err) {
      console.error('Errore nel follow:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title,
          text: campaign?.short_description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Condivisione annullata');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiato negli appunti!');
    }
  };

  const handleDonationSuccess = () => {
    if (campaign) {
      loadCampaign(campaign.id);
      setRefreshTrigger(prev => prev + 1);
    }
    setShowDonationForm(false);
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Attiva', color: 'text-green-600 bg-green-100', icon: CheckCircle };
      case 'pending':
        return { label: 'In attesa', color: 'text-yellow-600 bg-yellow-100', icon: Clock };
      case 'completed':
        return { label: 'Completata', color: 'text-blue-600 bg-blue-100', icon: CheckCircle };
      case 'cancelled':
      case 'rejected':
        return { label: 'Annullata', color: 'text-red-600 bg-red-100', icon: AlertCircle };
      default:
        return { label: 'Sconosciuto', color: 'text-gray-600 bg-gray-100', icon: AlertCircle };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateDaysLeft = () => {
    if (!campaign?.end_date) return null;
    const endDate = new Date(campaign.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const progressPercentage = campaign && campaign.goal_amount > 0 
    ? Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento campagna...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campagna non trovata</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/raccolta-fondi')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Torna alle campagne
          </button>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(campaign.category);
  const statusInfo = getStatusInfo(campaign.status);
  const StatusIcon = statusInfo.icon;
  const daysLeft = calculateDaysLeft();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Indietro
            </button>
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isLiked 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    {campaign.likes_count}
                  </button>
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isFollowing
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isFollowing ? 'Seguito' : 'Segui'}
                  </button>
                </>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Condividi
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {campaign.featured_image && (
                <div className="aspect-video">
                  <img
                    src={campaign.featured_image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                      {campaign.is_featured && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          In evidenza
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {campaign.title}
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                      {campaign.short_description}
                    </p>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  {campaign.creator?.avatar_url ? (
                    <img
                      src={campaign.creator.avatar_url}
                      alt={campaign.creator.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {campaign.creator?.full_name || 'Creatore'}
                    </p>
                    <p className="text-sm text-gray-600">Organizzatore della campagna</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Descrizione</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {campaign.description}
                </p>
              </div>
            </motion.div>

            {/* Donations List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <DonationsList campaignId={campaign.id} refreshTrigger={refreshTrigger} />
              
              {/* Aggiornamenti della campagna */}
              <CampaignUpdates 
                campaignId={campaign.id} 
                isOwner={user?.id === campaign.creator_id}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 sticky top-6"
            >
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  €{(campaign.current_amount || 0).toLocaleString('it-IT')}
                </div>
                <div className="text-gray-600">
                  raccolti di €{(campaign.goal_amount || 0).toLocaleString('it-IT')}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{progressPercentage.toFixed(1)}% completato</span>
                  {daysLeft !== null && (
                    <span>{daysLeft} giorni rimasti</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Donatori</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {campaign.donors_count}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Mi piace</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {campaign.likes_count}
                  </div>
                </div>
              </div>

              {campaign.status === 'active' && (
                <button
                  onClick={() => setShowDonationForm(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Dona Ora
                </button>
              )}

              {/* Campaign Details */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Creata il {formatDate(campaign.created_at)}</span>
                </div>
                {campaign.start_date && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>Iniziata il {formatDate(campaign.start_date)}</span>
                  </div>
                )}
                {campaign.end_date && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Termina il {formatDate(campaign.end_date)}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Civitanova Marche</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Donation Form */}
      {showDonationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Dona per {campaign.title}</h2>
                <button
                  onClick={() => setShowDonationForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <DonationForm
                campaignId={campaign.id}
                onSuccess={handleDonationSuccess}
                onCancel={() => setShowDonationForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}