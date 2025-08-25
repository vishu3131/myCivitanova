"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Eye, Star } from 'lucide-react';
import { NewsItem } from '@/types/news';
import { newsService } from '@/services/newsService';
import { supabase } from '@/utils/supabaseClient.ts';

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

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = activeFilter !== 'all' ? { type: activeFilter, limit: 10 } : { limit: 10 };
        const newsData = await newsService.getNews(filters);
        setNews(newsData);
      } catch (error) {
        console.error('Errore nel caricamento delle news:', error);
        setError('Errore nel caricamento delle news');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [activeFilter]);

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
          // Nota: la logica di aggiornamento è gestita nel servizio
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleFilterChange = (filter: 'all' | 'urgent' | 'news' | 'event') => {
    setActiveFilter(filter);
  };

  if (loading) {
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
            onClick={() => window.location.reload()} 
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
          onClick={() => console.log('Vedi tutte le news')}
        >
          Vedi tutti
          <span className="ml-1">→</span>
        </button>
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
            <p>Nessuna news disponibile per il filtro selezionato.</p>
          </div>
        )}
      </div>
    </div>
  );
}