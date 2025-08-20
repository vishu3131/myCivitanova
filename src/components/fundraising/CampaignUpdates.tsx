'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Bell, MessageCircle } from 'lucide-react';
import { FundraisingAPI } from '@/lib/fundraisingApi';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';

interface CampaignUpdate {
  id: string;
  campaign_id: string;
  title: string;
  content: string;
  created_at: string;
  author_name: string;
  is_milestone: boolean;
}

interface CampaignUpdatesProps {
  campaignId: string;
  isOwner?: boolean;
}

export default function CampaignUpdates({ campaignId, isOwner = false }: CampaignUpdatesProps) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
    is_milestone: false
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthWithRole();

  useEffect(() => {
    loadUpdates();
  }, [campaignId]);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      const updatesData = await FundraisingAPI.getCampaignUpdates(campaignId);
      setUpdates(updatesData);
    } catch (err) {
      setError('Errore nel caricamento degli aggiornamenti');
      console.error('Error loading updates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newUpdate.title.trim() || !newUpdate.content.trim()) return;

    try {
      setSubmitting(true);
      await FundraisingAPI.createCampaignUpdate({
        campaign_id: campaignId,
        title: newUpdate.title.trim(),
        content: newUpdate.content.trim(),
        is_milestone: newUpdate.is_milestone
      });
      
      setNewUpdate({ title: '', content: '', is_milestone: false });
      setShowCreateForm(false);
      await loadUpdates();
    } catch (err) {
      console.error('Error creating update:', err);
      setError('Errore nella creazione dell\'aggiornamento');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Aggiornamenti</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {updates.length}
          </span>
        </div>
        
        {isOwner && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Nuovo Aggiornamento
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Form per creare nuovo aggiornamento */}
      {showCreateForm && isOwner && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <form onSubmit={handleCreateUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo
              </label>
              <input
                type="text"
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Titolo dell'aggiornamento"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenuto
              </label>
              <textarea
                value={newUpdate.content}
                onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrivi l'aggiornamento della campagna..."
                required
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="milestone"
                checked={newUpdate.is_milestone}
                onChange={(e) => setNewUpdate({ ...newUpdate, is_milestone: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="milestone" className="text-sm text-gray-700">
                Questo è un traguardo importante
              </label>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !newUpdate.title.trim() || !newUpdate.content.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? 'Pubblicazione...' : 'Pubblica'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Annulla
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Lista aggiornamenti */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nessun aggiornamento disponibile</p>
            <p className="text-sm text-gray-400 mt-1">
              Gli aggiornamenti della campagna appariranno qui
            </p>
          </div>
        ) : (
          updates.map((update, index) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${
                update.is_milestone
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  {update.is_milestone && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      Traguardo
                    </span>
                  )}
                  {update.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {formatDate(update.created_at)}
                </div>
              </div>
              
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">{update.content}</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>di {update.author_name}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}