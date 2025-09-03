"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Star, 
  StarOff, 
  Save, 
  X, 
  Search,
  BarChart3
} from 'lucide-react';
import { NewsItem, CreateNewsData, UpdateNewsData } from '@/types/news';
import { newsService } from '@/services/newsService';

interface NewsManagementProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
}

export function NewsManagement({ isOpen, onClose, currentUser }: NewsManagementProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'news' | 'event'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (filterType !== 'all') filters.type = filterType;
      if (filterStatus !== 'all') filters.status = filterStatus;
      if (searchTerm) filters.search = searchTerm;
      
      const newsData = await newsService.getNews(filters);
      setNews(newsData);
    } catch (error) {
      console.error('Errore nel caricamento delle news:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, searchTerm]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await newsService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Errore nel caricamento delle statistiche:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadNews();
      loadStats();
    }
  }, [isOpen, currentUser, loadNews, loadStats]);

  const handleCreateNews = async (data: CreateNewsData) => {
    try {
      const newNews = await newsService.createNews(data);
      setNews(prev => [newNews, ...prev]);
      setShowCreateForm(false);
      loadStats();
    } catch (error) {
      console.error('Errore nella creazione della news:', error);
      alert('Errore nella creazione della news');
    }
  };

  const handleUpdateNews = async (data: UpdateNewsData) => {
    try {
      const updatedNews = await newsService.updateNews(data);
      setNews(prev => prev.map(item => item.id === data.id ? updatedNews : item));
      setEditingNews(null);
      loadStats();
    } catch (error) {
      console.error('Errore nell\'aggiornamento della news:', error);
      alert('Errore nell\'aggiornamento della news');
    }
  };

  const handleSubmitNews = async (data: CreateNewsData | UpdateNewsData) => {
    if ('id' in data) {
      await handleUpdateNews(data as UpdateNewsData);
    } else {
      await handleCreateNews(data as CreateNewsData);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa news?')) return;
    
    try {
      await newsService.deleteNews(id);
      setNews(prev => prev.filter(item => item.id !== id));
      loadStats();
    } catch (error) {
      console.error('Errore nella cancellazione della news:', error);
      alert('Errore nella cancellazione della news');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await newsService.toggleFeatured(id);
      setNews(prev => prev.map(item => 
        item.id === id ? { ...item, featured: !item.featured } : item
      ));
    } catch (error) {
      console.error('Errore nel toggle featured:', error);
      alert('Errore nell\'aggiornamento dello stato featured');
    }
  };

  // Verifica permessi
  const hasPermission = currentUser && ['admin', 'editor', 'moderator'].includes(currentUser.role);

  if (!isOpen) return null;

  if (!hasPermission) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Accesso Negato</h2>
          <p className="text-gray-400 mb-6">Non hai i permessi per accedere a questa sezione</p>
          <button 
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg font-medium transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] border border-gray-700 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestione News</h2>
            <p className="text-gray-400">Crea, modifica e gestisci le news dell&apos;app</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="p-6 border-b border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">Totale</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.total_news}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Pubblicate</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.published_news}</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">Bozze</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.draft_news}</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">In Evidenza</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.featured_news}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Filters */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tutti i tipi</option>
                <option value="urgent">Urgenti</option>
                <option value="news">News</option>
                <option value="event">Eventi</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Tutti gli stati</option>
                <option value="draft">Bozze</option>
                <option value="published">Pubblicate</option>
                <option value="archived">Archiviate</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuova News
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-2 text-white">Caricamento...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((newsItem) => (
                <NewsCard
                  key={newsItem.id}
                  news={newsItem}
                  onEdit={() => setEditingNews(newsItem)}
                  onDelete={() => handleDeleteNews(newsItem.id)}
                  onToggleFeatured={() => handleToggleFeatured(newsItem.id)}
                />
              ))}
              
              {news.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>Nessuna news trovata</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {(showCreateForm || editingNews) && (
          <NewsForm
            news={editingNews}
            onSubmit={handleSubmitNews}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingNews(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente per la card della news
function NewsCard({ 
  news, 
  onEdit, 
  onDelete, 
  onToggleFeatured 
}: { 
  news: NewsItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'event': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400 bg-green-500/10';
      case 'draft': return 'text-yellow-400 bg-yellow-500/10';
      case 'archived': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white font-semibold line-clamp-1">{news.title}</h3>
            {news.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(news.type)}`}>
              {news.type.toUpperCase()}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(news.status)}`}>
              {news.status.toUpperCase()}
            </span>
          </div>

          {news.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-2">{news.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>👁 {news.views_count}</span>
            <span>👍 {news.likes_count}</span>
            <span><span role="img" aria-label="Chat bubble emoji">💬</span> {news.comments_count}</span>
            <span>📅 {new Date(news.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onToggleFeatured}
            className={`p-2 rounded-lg transition-colors ${
              news.featured 
                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
            title={news.featured ? 'Rimuovi da evidenza' : 'Metti in evidenza'}
          >
            {news.featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onEdit}
            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            title="Modifica"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            title="Elimina"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente per il form di creazione/modifica
function NewsForm({ 
  news, 
  onSubmit, 
  onCancel 
}: { 
  news?: NewsItem | null;
  onSubmit: (data: CreateNewsData | UpdateNewsData) => void | Promise<void>;
  onCancel: () => void;
}) {
  type FormStatus = 'draft' | 'published';
  type FormType = 'urgent' | 'news' | 'event';
  interface NewsFormData {
    title: string;
    description: string;
    content: string;
    type: FormType;
    status: FormStatus;
    source: string;
    featured: boolean;
    tags: string;
  }

  const initialStatus: FormStatus =
    news?.status === 'published' ? 'published' : 'draft';

  const [formData, setFormData] = useState<NewsFormData>({
    title: news?.title || '',
    description: news?.description || '',
    content: news?.content || '',
    type: (news?.type || 'news') as FormType,
    status: initialStatus,
    source: news?.source || '',
    featured: news?.featured || false,
    tags: news?.tags?.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseData: CreateNewsData = {
      title: formData.title,
      description: formData.description || undefined,
      content: formData.content || undefined,
      type: formData.type,
      status: formData.status,
      source: formData.source || undefined,
      featured: formData.featured,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    };

    const submitData: CreateNewsData | UpdateNewsData = news
      ? ({ ...baseData, id: news.id } as UpdateNewsData)
      : baseData;

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            {news ? 'Modifica News' : 'Nuova News'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Titolo *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Inserisci il titolo della news"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrizione breve</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Breve descrizione della news"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contenuto completo</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Contenuto completo della news"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as FormType }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="news">News</option>
                <option value="urgent">Urgente</option>
                <option value="event">Evento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stato *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as FormStatus }))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="draft">Bozza</option>
                <option value="published">Pubblicata</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fonte</label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Es: Comune di Civitanova"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tag (separati da virgola)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Es: eventi, cultura, sport"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
              Metti in evidenza
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {news ? 'Aggiorna' : 'Crea'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}