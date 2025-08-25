"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Eye, Star } from 'lucide-react';
import { NewsItem } from '@/types/news';
import { newsService } from '@/services/newsService';
import { createClient } from '@supabase/supabase-js';

const typeStyles = {
  urgent: {
    icon: "⚠️",
    bg: "bg-[#E76F51]/10",
    text: "text-[#E76F51]",
    border: "border-[#E76F51]/20"
  },
  event: {
    icon: "📅",
    bg: "bg-[#2A9D8F]/10",
    text: "text-[#2A9D8F]",
    border: "border-[#2A9D8F]/20"
  },
  news: {
    icon: "📰",
    bg: "bg-[#0077BE]/10",
    text: "text-[#0077BE]",
    border: "border-[#0077BE]/20"
  },
};

export function NewsCarousel() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [index, setIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [activeItem, setActiveItem] = useState<NewsItem | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');

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
        const supabaseLocalClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        console.log('Supabase auth object (local):', supabaseLocalClient.auth); // Debugging line
        const { data: { user } } = await supabaseLocalClient.auth.getUser();
        if (user) {
          const { data: profile } = await supabaseLocalClient
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
    const loadFeaturedNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const featuredNews = await newsService.getFeaturedNews();
        setNews(featuredNews);
      } catch (error) {
        console.error('Errore nel caricamento delle news in evidenza:', error);
        setError('Errore nel caricamento delle news');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedNews();
  }, []);

  // Auto-scroll del carousel
  useEffect(() => {
    if (news.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news.length]);

  const handlePrevious = () => {
    setIndex((prevIndex) => (prevIndex - 1 + news.length) % news.length);
  };

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex + 1) % news.length);
  };

  const handleViewNews = async (newsItem: NewsItem) => {
    // Registra la visualizzazione
    if (currentUser) {
      try {
        await newsService.addView(newsItem.id, currentUser.id);
        // Aggiorna il contatore locale
        setNews(prevNews => 
          prevNews.map(item => 
            item.id === newsItem.id 
              ? { ...item, views_count: (item.views_count || 0) + 1 }
              : item
          )
        );
      } catch (error) {
        console.error('Errore nella registrazione della visualizzazione:', error);
      }
    }

    // Apri modal dettagli
    setActiveItem(newsItem);
    setShowDetails(true);
  };

  const handleLike = async (newsItem: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    try {
      const currentReaction = await newsService.getUserReaction(newsItem.id, currentUser.id);
      
      if (currentReaction === 'like') {
        await newsService.removeReaction(newsItem.id, currentUser.id);
      } else {
        await newsService.addReaction(newsItem.id, currentUser.id, 'like');
      }
      
      // Ricarica le news per aggiornare i contatori
      const updatedNews = await newsService.getFeaturedNews();
      setNews(updatedNews);
    } catch (error) {
      console.error('Errore nella gestione del like:', error);
    }
  };

  const handleDislike = async (newsItem: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    try {
      const currentReaction = await newsService.getUserReaction(newsItem.id, currentUser.id);
      
      if (currentReaction === 'dislike') {
        await newsService.removeReaction(newsItem.id, currentUser.id);
      } else {
        await newsService.addReaction(newsItem.id, currentUser.id, 'dislike');
      }
      
      // Ricarica le news per aggiornare i contatori
      const updatedNews = await newsService.getFeaturedNews();
      setNews(updatedNews);
    } catch (error) {
      console.error('Errore nella gestione del dislike:', error);
    }
  };

  const handleShare = async (newsItem: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: newsItem.title,
          text: newsItem.description,
          url: window.location.href
        });
      } else {
        // Fallback: copia il link negli appunti
        await navigator.clipboard.writeText(window.location.href);
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Link copiato negli appunti', type: 'success' } }));
      }
    } catch (error) {
      console.error('Errore nella condivisione:', error);
    }
  };

  const submitComment = async () => {
    if (!currentUser || !activeItem || !commentText.trim()) return;
    try {
      await newsService.addComment(activeItem.id, currentUser.id, commentText.trim());
      setNews(prev => prev.map(n => n.id === activeItem.id ? { ...n, comments_count: n.comments_count + 1 } : n));
      setCommentText('');
      setShowCommentModal(false);
    } catch (err) {
      console.error('Errore nell\'aggiunta del commento:', err);
    }
  };

  const handleComment = async (newsItem: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    setActiveItem(newsItem);
    setShowCommentModal(true);
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

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Caricamento news in evidenza...</span>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-center">
            {error || 'Nessuna news in evidenza al momento'}
          </p>
        </div>
      </div>
    );
  }

  const currentNews = news[index];
  const styles = typeStyles[currentNews.type];
  const eventCount = news.filter(n => n.type === 'event').length;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-heading font-medium">In Evidenza</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span>{currentNews.type === 'event' ? `${eventCount} eventi` : `${news.length} news`}</span>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={`relative rounded-2xl p-6 border ${styles.bg} ${styles.border} cursor-pointer overflow-hidden`}
            onClick={() => handleViewNews(currentNews)}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full ${styles.bg} flex items-center justify-center text-xl`}>
                  {styles.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${styles.bg} ${styles.text} border ${styles.border}`}>
                      {currentNews.type.toUpperCase()}
                    </span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${currentNews.type === 'urgent' ? styles.text : 'text-white'}`}>
                    {currentNews.title}
                  </h3>
                  {currentNews.description && (
                    <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                      {currentNews.description}
                    </p>
                  )}
                  <div className="flex items-center text-gray-500 text-xs">
                    <span>{formatTimestamp(currentNews.published_at || currentNews.created_at)}</span>
                    <span className="mx-1">•</span>
                    <span>{currentNews.source}</span>
                    {currentNews.views_count > 0 && (
                      <>
                        <span className="mx-1">•</span>
                        <Eye className="w-3 h-3 mr-1" />
                        <span>{currentNews.views_count}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-around pt-4 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={(e) => handleLike(currentNews, e)}
                  className="flex items-center text-white hover:text-blue-400 transition-colors"
                  disabled={!currentUser}
                >
                  <ThumbsUp className="w-5 h-5 mr-1" />
                  {currentNews.likes_count}
                </button>
                
                <button 
                  onClick={(e) => handleDislike(currentNews, e)}
                  className="flex items-center text-white hover:text-red-400 transition-colors"
                  disabled={!currentUser}
                >
                  <ThumbsDown className="w-5 h-5 mr-1" />
                  {currentNews.dislikes_count}
                </button>
                
                <button 
                  onClick={(e) => handleComment(currentNews, e)}
                  className="flex items-center text-white hover:text-yellow-400 transition-colors"
                  disabled={!currentUser}
                >
                  <MessageCircle className="w-5 h-5 mr-1" />
                  {currentNews.comments_count}
                </button>
                
                <button 
                  onClick={(e) => handleShare(currentNews, e)}
                  className="flex items-center text-white hover:text-yellow-400 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {news.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
            >
              →
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {news.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === index ? "bg-yellow-400" : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    {/* Details Modal */}
      {showDetails && activeItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 overscroll-contain" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="w-full sm:max-w-lg sm:rounded-2xl bg-gray-900 border border-white/10 p-4 sm:p-6 max-h-[85vh] overflow-y-auto mx-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white text-lg font-semibold pr-6">{activeItem.title}</h3>
              <button className="text-white/60 hover:text-white" onClick={() => setShowDetails(false)} aria-label="Chiudi">✕</button>
            </div>
            {activeItem.description && <p className="text-white/80 text-sm mb-3">{activeItem.description}</p>}
            {activeItem.content && <div className="text-white/70 text-sm whitespace-pre-line pr-1">{activeItem.content}</div>}
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={() => setShowDetails(false)}>Chiudi</button>
            </div>
          </motion.div>
          <button className="absolute inset-0 w-full h-full" onClick={() => setShowDetails(false)} aria-hidden="true"></button>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && activeItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6 overscroll-contain" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="w-full sm:max-w-md sm:rounded-2xl bg-gray-900 border border-white/10 p-4 sm:p-6 max-h-[85vh] overflow-y-auto mx-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white text-lg font-semibold pr-6">Commenta: {activeItem.title}</h3>
              <button className="text-white/60 hover:text-white" onClick={() => setShowCommentModal(false)} aria-label="Chiudi">✕</button>
            </div>
            <textarea
              className="w-full bg-white/10 text-white text-sm rounded-lg p-3 border border-white/10 outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
              placeholder="Scrivi il tuo commento..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={() => setShowCommentModal(false)}>Annulla</button>
              <button className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50" onClick={submitComment} disabled={!commentText.trim()}>Invia</button>
            </div>
          </motion.div>
          <button className="absolute inset-0 w-full h-full" onClick={() => setShowCommentModal(false)} aria-hidden="true"></button>
        </div>
      )}
    </div>
  );
}
