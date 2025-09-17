"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Eye, Star } from 'lucide-react';
import { NewsItem } from '@/types/news';
import { newsService } from '@/services/newsService';
import { supabase } from '@/utils/supabaseClient';
import SafeImage from '@/components/SafeImage';

interface NewsItemComponentProps {
  news: NewsItem;
  currentUserId?: string;
  onView?: (news: NewsItem) => void;
  onReaction?: (newsId: string, type: 'like' | 'dislike') => void;
}

function NewsItemComponent({ news, currentUserId, onView, onReaction }: NewsItemComponentProps) {
  const getTypeStyles = () => {
    switch (news.type) {
      case 'urgent':
        return {
          icon: '⚠️',
          bgColor: 'bg-[#E76F51]/10',
          textColor: 'text-[#E76F51]',
          borderColor: 'border-[#E76F51]/20'
        };
      case 'event':
        return {
          icon: '📅',
          bgColor: 'bg-[#2A9D8F]/10',
          textColor: 'text-[#2A9D8F]',
          borderColor: 'border-[#2A9D8F]/20'
        };
      default:
        return {
          icon: '📰',
          bgColor: 'bg-[#0077BE]/10',
          textColor: 'text-[#0077BE]',
          borderColor: 'border-[#0077BE]/20'
        };
    }
  };
  
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [isAnimatingLike, setIsAnimatingLike] = useState(false);
  const [isAnimatingDislike, setIsAnimatingDislike] = useState(false);
  const [isAnimatingShare, setIsAnimatingShare] = useState(false);

  // Carica la reazione dell'utente corrente
  useEffect(() => {
    const loadUserReaction = async () => {
      if (currentUserId) {
        try {
          const reaction = await newsService.getUserReaction(news.id, currentUserId);
          setUserReaction(reaction);
        } catch (error) {
          console.error('Errore nel caricamento della reazione:', error);
        }
      }
    };

    loadUserReaction();
  }, [news.id, currentUserId]);

  const handleLike = async () => {
    if (!currentUserId) return;
    
    try {
      if (userReaction === 'like') {
        await newsService.removeReaction(news.id, currentUserId);
        setUserReaction(null);
      } else {
        await newsService.addReaction(news.id, currentUserId, 'like');
        setUserReaction('like');
      }
      
      if (onReaction) {
        onReaction(news.id, 'like');
      }
      
      setIsAnimatingLike(true);
      setTimeout(() => setIsAnimatingLike(false), 1000);
    } catch (error) {
      console.error('Errore nella gestione del like:', error);
    }
  };

  const handleDislike = async () => {
    if (!currentUserId) return;
    
    try {
      if (userReaction === 'dislike') {
        await newsService.removeReaction(news.id, currentUserId);
        setUserReaction(null);
      } else {
        await newsService.addReaction(news.id, currentUserId, 'dislike');
        setUserReaction('dislike');
      }
      
      if (onReaction) {
        onReaction(news.id, 'dislike');
      }
      
      setIsAnimatingDislike(true);
      setTimeout(() => setIsAnimatingDislike(false), 1000);
    } catch (error) {
      console.error('Errore nella gestione del dislike:', error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: news.title,
          text: news.description,
          url: window.location.href
        });
      } else {
        // Fallback: copia il link negli appunti
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiato negli appunti!');
      }
      
      setIsAnimatingShare(true);
      setTimeout(() => setIsAnimatingShare(false), 1000);
    } catch (error) {
      console.error('Errore nella condivisione:', error);
    }
  };

  const handleViewNews = () => {
    if (onView) {
      onView(news);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Ora';
    if (diffInHours < 24) return `${diffInHours} ore fa`;
    if (diffInHours < 48) return 'Ieri';
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} giorni fa`;
  };

  const styles = getTypeStyles();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      whileHover={{ scale: 1.02, boxShadow: "0px 0px 8px rgb(255,255,255)" }}
      className={`w-full text-left p-4 rounded-lg ${styles.bgColor} border ${styles.borderColor} mb-3 cursor-pointer`}
      onClick={handleViewNews}
    >
      <div className="flex items-start">
        <div className={`w-8 h-8 rounded-full ${styles.bgColor} flex items-center justify-center ${styles.textColor} mr-3 text-lg`}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium ${news.type === 'urgent' ? 'text-[#E76F51]' : 'text-white'}`}>
              {news.title}
            </h3>
            {news.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
          </div>
          
          {news.description && (
            <p className="text-sm text-gray-300 mb-2 line-clamp-2">{news.description}</p>
          )}

          {news.image_url && (
            <div className="mt-2 mb-2 overflow-hidden rounded-md border border-white/10">
              <SafeImage src={news.image_url} alt={news.title} width={1200} height={675} className="w-full h-40 object-cover" />
            </div>
          )}
          
          <div className="flex items-center text-gray-500 text-xs">
            <span>{formatTimestamp(news.published_at || news.created_at)}</span>
            <span className="mx-1">•</span>
            <span>{news.source}</span>
            {news.views_count > 0 && (
              <>
                <span className="mx-1">•</span>
                <Eye className="w-3 h-3 mr-1" />
                <span>{news.views_count}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-around mt-4" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={handleLike} 
          className={`flex items-center text-white hover:text-yellow-400 transition-colors ${
            userReaction === 'like' ? 'text-blue-400' : ''
          }`}
          disabled={!currentUserId}
        >
          <motion.div
            animate={isAnimatingLike ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <ThumbsUp className="w-5 h-5 mr-1" />
          </motion.div>
          {news.likes_count}
        </button>
        
        <button 
          onClick={handleDislike} 
          className={`flex items-center text-white hover:text-yellow-400 transition-colors ${
            userReaction === 'dislike' ? 'text-red-400' : ''
          }`}
          disabled={!currentUserId}
        >
          <motion.div
            animate={isAnimatingDislike ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <ThumbsDown className="w-5 h-5 mr-1" />
          </motion.div>
          {news.dislikes_count}
        </button>
        
        <button 
          onClick={handleViewNews} 
          className="flex items-center text-white hover:text-yellow-400 transition-colors"
        >
          <MessageCircle className="w-5 h-5 mr-1" />
          {news.comments_count}
        </button>
        
        <button 
          onClick={handleShare} 
          className="flex items-center text-white hover:text-yellow-400 transition-colors"
        >
          <motion.div
            animate={isAnimatingShare ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Share2 className="w-5 h-5" />
          </motion.div>
        </button>
      </div>
    </motion.div>
  );
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'news' | 'event'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string | 'tutte'>('tutte');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        // Prova prima con localStorage (per il bypass del login)
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
          return;
        }

        // Altrimenti usa Supabase Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setCurrentUser(profile);
        }
      } catch (error) {
        console.error('Errore nel caricamento dell\'utente:', error);
      }
    };

    loadCurrentUser();
  }, []);

  // Helper: mapping DB -> NewsItem
  const mapNewsRow = (row: any): NewsItem => {
    return {
      id: row.id,
      title: row.title,
      description: row.excerpt ?? undefined,
      content: row.content ?? undefined,
      type: row.is_featured ? 'urgent' : 'news',
      status: row.status ?? 'published',
      author_id: row.author_id ?? undefined,
      source: row.category ? `Categoria: ${row.category}` : undefined,
      image_url: row.featured_image ?? undefined,
      tags: undefined,
      likes_count: row.likes_count ?? 0,
      dislikes_count: 0,
      comments_count: row.comments_count ?? 0,
      views_count: row.views_count ?? 0,
      featured: !!row.is_featured,
      published_at: row.published_at ?? undefined,
      created_at: row.created_at ?? new Date().toISOString(),
      updated_at: row.updated_at ?? new Date().toISOString(),
    };
  };

  const mapEventRow = (row: any): NewsItem => {
    return {
      id: row.id,
      title: row.title,
      description: row.short_description ?? undefined,
      content: row.description ?? undefined,
      type: 'event',
      status: 'published',
      author_id: undefined,
      source: row.category ? `Evento: ${row.category}` : 'Evento',
      image_url: row.featured_image ?? undefined,
      tags: undefined,
      likes_count: 0,
      dislikes_count: 0,
      comments_count: 0,
      views_count: 0,
      featured: !!row.is_featured,
      published_at: row.start_date ?? undefined,
      created_at: row.created_at ?? new Date().toISOString(),
      updated_at: row.updated_at ?? new Date().toISOString(),
    };
  };

  const fetchFromSupabase = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const isEvents = activeFilter === 'event';
      const isUrgent = activeFilter === 'urgent';
      const table = isEvents ? 'events' : 'news';

      let query = supabase
        .from(table)
        .select(isEvents 
          ? 'id,title,short_description,description,featured_image,category,is_featured,status,start_date,created_at,updated_at' 
          : 'id,title,excerpt,content,featured_image,category,status,is_featured,author_id,views_count,likes_count,comments_count,published_at,created_at,updated_at'
        );

      if (!isEvents) {
        query = query.eq('status', 'published');
        if (isUrgent) query = query.eq('is_featured', true);
      } else {
        // Eventi: mostra "ongoing" e "upcoming"
        query = query.in('status', ['upcoming','ongoing']);
      }

      if (category && category !== 'tutte') {
        query = query.eq('category', category);
      }
      
      if (searchTerm.trim()) {
        const term = `%${searchTerm.trim()}%`;
        query = query.or(isEvents 
          ? `title.ilike.${term},description.ilike.${term}`
          : `title.ilike.${term},content.ilike.${term},excerpt.ilike.${term}`
        );
      }

      // Ordinamento e paginazione
      query = isEvents 
        ? query.order('start_date', { ascending: true, nullsFirst: false })
        : query.order('published_at', { ascending: false, nullsFirst: false });

      const from = reset ? 0 : page * pageSize;
      const to = reset ? pageSize - 1 : from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: sbError } = await query;
      if (sbError) throw sbError;

      const mapped = (data || []).map(row => isEvents ? mapEventRow(row) : mapNewsRow(row));
      setNews(prev => reset ? mapped : [...prev, ...mapped]);
      setHasMore((data || []).length === pageSize);
    } catch (e: any) {
      console.error('Errore Supabase:', e?.message || e);
      // Fallback ai mock
      try {
        const filters = activeFilter !== 'all' ? { type: activeFilter as any, limit: pageSize } : { limit: pageSize };
        const mock = await newsService.getNews(filters);
        setNews(prev => prev.length && !e ? prev : mock);
        setHasMore(false);
      } catch (err) {
        setError('Errore nel caricamento delle news');
      }
    } finally {
      setLoading(false);
    }
  };

  // Primo caricamento e quando cambiano filtri/ricerca/categoria
  useEffect(() => {
    setPage(0);
    fetchFromSupabase(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, searchTerm, category]);

  // Paginazione: carica altri
  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFromSupabase(false);
  };

  // Realtime subscribe a news ed eventi
  useEffect(() => {
    const newsChannel = supabase.channel('realtime-news')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new;
          if (row.status === 'published') {
            setNews(prev => [mapNewsRow(row), ...prev]);
          }
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new;
          setNews(prev => prev.map(n => n.id === row.id ? mapNewsRow(row) : n));
        } else if (payload.eventType === 'DELETE') {
          const row = payload.old;
          setNews(prev => prev.filter(n => n.id !== row.id));
        }
      })
      .subscribe();

    const eventsChannel = supabase.channel('realtime-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setNews(prev => [mapEventRow(payload.new), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNews(prev => prev.map(n => n.id === payload.new.id ? mapEventRow(payload.new) : n));
        } else if (payload.eventType === 'DELETE') {
          setNews(prev => prev.filter(n => n.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(newsChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, []);

  const handleViewNews = async (newsItem: NewsItem) => {
    // Registra la visualizzazione
    if (currentUser) {
      try {
        await newsService.addView(newsItem.id, currentUser.id);
        // Aggiorna il contatore locale
        setNews(prevNews => 
          prevNews.map(item => 
            item.id === newsItem.id 
              ? { ...item, views_count: item.views_count + 1 }
              : item
          )
        );
      } catch (error) {
        console.error('Errore nella registrazione della visualizzazione:', error);
      }
    }

    // Mostra i dettagli (per ora un alert)
    alert(`Visualizzazione dettagli: ${newsItem.title}\n\n${newsItem.description}\n\n${newsItem.content}`);
  };

  const handleReaction = async (newsId: string, type: 'like' | 'dislike') => {
    // Aggiorna lo stato locale immediatamente per una migliore UX
    setNews(prevNews => 
      prevNews.map(item => {
        if (item.id === newsId) {
          const updatedItem = { ...item };
          // Nota: la logica di aggiornamento è gestita nel servizio/mock
          if (type === 'like') updatedItem.likes_count = (updatedItem.likes_count || 0) + 1;
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleFilterChange = (filter: 'all' | 'urgent' | 'news' | 'event') => {
    setActiveFilter(filter);
  };

  if (loading && page === 0) {
    return (
      <div className="mb-8">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Caricamento news...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => fetchFromSupabase(true)} 
            className="mt-2 text-sm text-red-300 hover:text-red-200"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-heading font-medium">News & Annunci</h2>
        <button 
          className="text-accent text-sm font-medium flex items-center hover:text-accent/80 transition-colors"
          onClick={() => setActiveFilter('all')}
        >
          Vedi tutti
          <span className="ml-1">→</span>
        </button>
      </div>

      {/* Barra di ricerca e categorie */}
      <div className="mb-3 flex flex-col md:flex-row gap-2 md:items-center">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cerca nelle notizie..."
          className="w-full md:w-1/2 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        <div className="flex gap-2 overflow-x-auto">
          {['tutte','generale','eventi','servizi','trasporti','cultura','sport','amministrazione'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${category === cat ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Filtri */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          onClick={() => handleFilterChange('all')}
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            activeFilter === 'all' 
              ? 'bg-white text-black' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Tutti
        </button>
        <button 
          onClick={() => handleFilterChange('urgent')}
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            activeFilter === 'urgent' 
              ? 'bg-[#E76F51] text-white' 
              : 'bg-[#E76F51]/20 text-[#E76F51] hover:bg-[#E76F51]/30'
          }`}
        >
          Urgenti
        </button>
        <button 
          onClick={() => handleFilterChange('news')}
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            activeFilter === 'news' 
              ? 'bg-[#0077BE] text-white' 
              : 'bg-[#0077BE]/20 text-[#0077BE] hover:bg-[#0077BE]/30'
          }`}
        >
          News
        </button>
        <button 
          onClick={() => handleFilterChange('event')}
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            activeFilter === 'event' 
              ? 'bg-[#2A9D8F] text-white' 
              : 'bg-[#2A9D8F]/20 text-[#2A9D8F] hover:bg-[#2A9D8F]/30'
          }`}
        >
          Eventi
        </button>
      </div>
      
      {/* Lista delle news */}
      <div className="space-y-3">
        <AnimatePresence>
          {news.length > 0 ? (
            news.map((newsItem) => (
              <NewsItemComponent
                key={newsItem.id}
                news={newsItem}
                currentUserId={currentUser?.id}
                onView={handleViewNews}
                onReaction={handleReaction}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Nessuna news disponibile per i filtri selezionati.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Carica altri */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
          >
            {loading ? 'Caricamento...' : 'Carica altri'}
          </button>
        </div>
      )}
    </div>
  );
}