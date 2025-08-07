'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { DatabaseService } from '@/lib/database';
import { useAuthWithRole } from "@/hooks/useAuthWithRole";
import { 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Shield,
  Filter,
  MoreVertical
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  author_id?: string;
  views?: number;
  likes?: number;
}

export default function ContentPage() {
  const { user, role, loading: authLoading } = useAuthWithRole();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadNews();
    }
  }, [user]);

  const loadNews = async () => {
    try {
      const newsData = await DatabaseService.getNews();
      setNews(newsData);
    } catch (error) {
      console.error('Errore caricamento news:', error);
      // Mock data in caso di errore
      setNews([
        {
          id: '1',
          title: 'Festa del Mare 2024',
          content: 'La tradizionale Festa del Mare torna anche quest\'anno...',
          excerpt: 'La tradizionale Festa del Mare torna anche quest\'anno con tante novità',
          image_url: '/images/festa-mare.jpg',
          status: 'published',
          created_at: '2024-02-15T10:00:00Z',
          updated_at: '2024-02-15T10:00:00Z',
          author_id: '1',
          views: 1250,
          likes: 89
        },
        {
          id: '2',
          title: 'Nuovo Parco Giochi',
          content: 'È stato inaugurato il nuovo parco giochi in via Roma...',
          excerpt: 'È stato inaugurato il nuovo parco giochi in via Roma',
          status: 'published',
          created_at: '2024-02-10T14:30:00Z',
          updated_at: '2024-02-10T14:30:00Z',
          author_id: '1',
          views: 650,
          likes: 45
        },
        {
          id: '3',
          title: 'Lavori in Corso Centro Storico',
          content: 'Iniziano i lavori di riqualificazione del centro storico...',
          excerpt: 'Iniziano i lavori di riqualificazione del centro storico',
          status: 'draft',
          created_at: '2024-02-08T09:15:00Z',
          updated_at: '2024-02-08T09:15:00Z',
          author_id: '1',
          views: 0,
          likes: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Pubblicato';
      case 'draft': return 'Bozza';
      case 'archived': return 'Archiviato';
      default: return status;
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Caricamento contenuti...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !['admin', 'moderator'].includes(role)) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Accesso Negato</h2>
          <p className="text-gray-500 dark:text-gray-400">Non hai i permessi per accedere a questa sezione</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestione Contenuti
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Crea e gestisci articoli, news e contenuti del sito
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Plus className="w-4 h-4" />
              Nuovo Articolo
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {news.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Totali</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Eye className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {news.filter(n => n.status === 'published').length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Pubblicati</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Edit className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {news.filter(n => n.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Bozze</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {news.reduce((sum, n) => sum + (n.views || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Visualizzazioni</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca articoli per titolo o contenuto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tutti gli stati</option>
                <option value="published">Pubblicati</option>
                <option value="draft">Bozze</option>
                <option value="archived">Archiviati</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {item.image_url && (
                <div className="h-48 bg-gray-200 dark:bg-gray-700 bg-cover bg-center" 
                     style={{ backgroundImage: `url(${item.image_url})` }}>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {item.excerpt || item.content.substring(0, 150) + '...'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.created_at).toLocaleDateString('it-IT')}
                  </div>
                  {item.views !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {item.views}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Edit className="w-4 h-4 inline mr-1" />
                    Modifica
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nessun contenuto trovato
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Prova a modificare i filtri di ricerca o crea il tuo primo articolo
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto">
              <Plus className="w-4 h-4" />
              Crea Primo Articolo
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}