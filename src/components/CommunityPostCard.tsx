'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ImageWithFallback from '@/components/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  ThumbsUp, 
  ThumbsDown,
  MapPin,
  Clock,
  Eye,
  Bookmark,
  Flag,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Send,
  Image as ImageIcon,
  Smile,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CommunityPost, CommunityComment } from '@/hooks/useCommunity';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface CommunityPostCardProps {
  post: CommunityPost;
  currentUser: any;
  onLike: (postId: string) => Promise<void>;
  onDislike: (postId: string) => Promise<void>;
  onShare: (postId: string, shareType: 'internal' | 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'link') => Promise<void>;
  onComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<CommunityComment[]>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Aperto';
    case 'in-progress': return 'In Lavorazione';
    case 'resolved': return 'Risolto';
    case 'closed': return 'Chiuso';
    default: return status;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'report': return '🚨';
    case 'discussion': return '💬';
    case 'event': return '📅';
    case 'group': return '👥';
    default: return '📝';
  }
};

const shareOptions: Array<{
  id: 'internal' | 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'link';
  label: string;
  icon: any;
}> = [
  { id: 'link', label: 'Copia Link', icon: Copy },
  { id: 'whatsapp', label: 'WhatsApp', icon: Send },
  { id: 'facebook', label: 'Facebook', icon: ExternalLink },
  { id: 'twitter', label: 'Twitter', icon: ExternalLink },
  { id: 'email', label: 'Email', icon: Send }
];

export function CommunityPostCard({
  post,
  currentUser,
  onLike,
  onDislike,
  onShare,
  onComment,
  onDelete,
  fetchComments
}: CommunityPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [showFullContent, setShowFullContent] = useState(false);
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Chiudi menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carica commenti quando vengono mostrati
  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const fetchedComments = await fetchComments(post.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Errore nel caricamento commenti:', error);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  // Gestisci like
  const handleLike = async () => {
    if (isLiking || !currentUser) return;
    setIsLiking(true);
    try {
      await onLike(post.id);
    } catch (error) {
      console.error('Errore nel like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Gestisci dislike
  const handleDislike = async () => {
    if (isDisliking || !currentUser) return;
    setIsDisliking(true);
    try {
      await onDislike(post.id);
    } catch (error) {
      console.error('Errore nel dislike:', error);
    } finally {
      setIsDisliking(false);
    }
  };

  // Gestisci condivisione
  const handleShare = async (shareType: 'internal' | 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'link') => {
    try {
      if (shareType === 'link') {
        const url = `${window.location.origin}/community/post/${post.id}`;
        await navigator.clipboard.writeText(url);
        // Mostra notifica di successo
      } else {
        await onShare(post.id, shareType);
      }
      setShowShareMenu(false);
    } catch (error) {
      console.error('Errore nella condivisione:', error);
    }
  };

  // Gestisci nuovo commento
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    
    try {
      await onComment(post.id, newComment.trim(), replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
      
      // Ricarica i commenti
      const updatedComments = await fetchComments(post.id);
      setComments(updatedComments);
    } catch (error) {
      console.error('Errore nell\'aggiunta commento:', error);
    }
  };

  // Gestisci eliminazione post
  const handleDelete = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questo post?')) {
      try {
        await onDelete(post.id);
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error);
      }
    }
    setShowMoreMenu(false);
  };

  const isOwner = currentUser && post.user_id === currentUser.id;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { 
    addSuffix: true, 
    locale: it 
  });

  // Tronca il contenuto se troppo lungo
  const shouldTruncate = post.content.length > 300;
  const displayContent = shouldTruncate && !showFullContent 
    ? post.content.substring(0, 300) + '...' 
    : post.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-300/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-accent/30 transition-all duration-300"
    >
      {/* Header del Post */}
      <div className="p-3 sm:p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center flex-shrink-0">
              {post.author_avatar ? (
                <ImageWithFallback
                  src={post.author_avatar}
                  alt={post.author_name || 'User avatar'}
                  fallbackSrc="/fallback-avatar.png"
                  className="w-full h-full rounded-full object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <span className="text-accent font-semibold text-sm">
                  {post.author_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>

            {/* Info Autore */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-white text-sm truncate">
                  {post.author_name || 'Utente Anonimo'}
                </h3>
                {post.author_role === 'admin' && (
                  <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
                    Admin
                  </span>
                )}
                {post.is_pinned && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                    📌 Fissato
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3 text-xs text-white/60">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{timeAgo}</span>
                </div>
                
                {post.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{post.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{post.views_count}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Azioni */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 top-10 bg-dark-400 rounded-lg shadow-xl border border-white/10 py-2 min-w-[160px] z-20"
                >
                  <button className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-white text-sm">
                    <Bookmark className="w-4 h-4" />
                    <span>Salva</span>
                  </button>
                  
                  {!isOwner && (
                    <button className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-white text-sm">
                      <Flag className="w-4 h-4" />
                      <span>Segnala</span>
                    </button>
                  )}
                  
                  {isOwner && (
                    <>
                      <button className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-white text-sm">
                        <Edit3 className="w-4 h-4" />
                        <span>Modifica</span>
                      </button>
                      <button 
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-red-400 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Elimina</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tipo e Status */}
        <div className="flex items-center space-x-2 mt-3 mb-2">
          <span className="text-lg">{getTypeIcon(post.type)}</span>
          <span className="text-white/60 text-sm capitalize">{post.type}</span>
          {post.category && (
            <>
              <span className="text-white/40">•</span>
              <span className="text-white/60 text-sm">{post.category}</span>
            </>
          )}
          {post.status && (
            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(post.status)}`}>
              {getStatusLabel(post.status)}
            </span>
          )}
        </div>
      </div>

      {/* Contenuto del Post */}
      <div className="px-3 sm:px-4 pb-3">
        <h2 className="text-white font-semibold text-base sm:text-lg mb-2 leading-tight">
          {post.title}
        </h2>
        
        <div className="text-white/80 text-sm sm:text-base leading-relaxed">
          <p className="whitespace-pre-wrap">{displayContent}</p>
          {shouldTruncate && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-accent hover:text-accent/80 text-sm mt-1 font-medium"
            >
              {showFullContent ? 'Mostra meno' : 'Mostra tutto'}
            </button>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full hover:bg-accent/20 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Immagini */}
        {post.images && post.images.length > 0 && (
          <div className="mt-3">
            {post.images.length === 1 ? (
              <div className="relative">
                <ImageWithFallback
                  src={post.images[0] || ''}
                  alt="Post image"
                  fallbackSrc="/fallback-image.png"
                  className="w-full max-h-96 object-cover rounded-lg"
                  width={600}
                  height={400}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {post.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative">
                    <ImageWithFallback
                      src={image}
                      alt={`Post image ${index + 1}`}
                      fallbackSrc="/fallback-image.png"
                      className="w-full h-28 sm:h-32 object-cover rounded-lg"
                      width={300}
                      height={200}
                    />
                    {index === 3 && post.images!.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">
                          +{post.images!.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistiche Reazioni */}
      {(post.likes_count > 0 || post.dislikes_count > 0 || post.comments_count > 0) && (
        <div className="px-4 py-2 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center space-x-4">
              {post.likes_count > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <ThumbsUp className="w-3 h-3 text-white" />
                  </div>
                  <span>{post.likes_count}</span>
                </div>
              )}
              {post.dislikes_count > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <ThumbsDown className="w-3 h-3 text-white" />
                  </div>
                  <span>{post.dislikes_count}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {post.comments_count > 0 && (
                <button
                  onClick={handleToggleComments}
                  className="hover:text-white transition-colors"
                >
                  {post.comments_count} {post.comments_count === 1 ? 'commento' : 'commenti'}
                </button>
              )}
              {post.shares_count > 0 && (
                <span>{post.shares_count} condivisioni</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pulsanti Azione */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-white/10">
        <div className="flex items-center justify-around sm:justify-between">
          <div className="flex items-center space-x-1">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={isLiking || !currentUser}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-all ${
                post.user_reaction === 'like'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/60 hover:text-blue-400 hover:bg-blue-500/10'
              } ${isLiking ? 'opacity-50' : ''}`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiking ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline text-sm font-medium">Mi piace</span>
            </button>

            {/* Dislike */}
            <button
              onClick={handleDislike}
              disabled={isDisliking || !currentUser}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-all ${
                post.user_reaction === 'dislike'
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-white/60 hover:text-red-400 hover:bg-red-500/10'
              } ${isDisliking ? 'opacity-50' : ''}`}
            >
              <ThumbsDown className={`w-4 h-4 ${isDisliking ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline text-sm font-medium">Non mi piace</span>
            </button>

            {/* Commenta */}
            <button
              onClick={handleToggleComments}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-white/60 hover:text-accent hover:bg-accent/10 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Commenta</span>
            </button>
          </div>

          {/* Condividi */}
          <div className="relative" ref={shareMenuRef}>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white/60 hover:text-green-400 hover:bg-green-500/10 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Condividi</span>
            </button>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 bottom-12 bg-dark-400 rounded-lg shadow-xl border border-white/10 py-2 min-w-[160px] z-20"
                >
                  {shareOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleShare(option.id)}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-white text-sm"
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sezione Commenti */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10"
          >
            {/* Input Nuovo Commento */}
            {currentUser && (
              <div className="p-4 border-b border-white/10">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center flex-shrink-0">
                    {currentUser.avatar ? (
                      <Image 
                        src={currentUser.avatar} 
                        alt={currentUser.display_name || 'User avatar'} 
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-accent font-semibold text-xs">
                        {currentUser.display_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <textarea
                      ref={commentInputRef}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={replyingTo ? "Scrivi una risposta..." : "Scrivi un commento..."}
                      className="w-full bg-dark-400/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm resize-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                    />
                    
                    {replyingTo && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-white/60">
                          Rispondendo a un commento
                        </span>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="text-white/60 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-white/60 hover:text-accent transition-colors">
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-white/60 hover:text-accent transition-colors">
                          <Smile className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim()}
                        className="px-4 py-1 bg-accent text-dark-400 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Pubblica
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista Commenti */}
            <div className="max-h-96 overflow-y-auto">
              {loadingComments ? (
                <div className="p-4 text-center">
                  <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Caricamento commenti...</p>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3 p-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center flex-shrink-0">
                        {comment.author_avatar ? (
                          <Image 
                            src={comment.author_avatar} 
                            alt={comment.author_name || 'User avatar'} 
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-accent font-semibold text-xs">
                            {comment.author_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="bg-dark-400/50 rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-white text-sm">
                              {comment.author_name}
                            </span>
                            <span className="text-xs text-white/60">
                              {formatDistanceToNow(new Date(comment.created_at), { 
                                addSuffix: true, 
                                locale: it 
                              })}
                            </span>
                          </div>
                          <p className="text-white/80 text-sm whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 ml-3">
                          <button className="text-xs text-white/60 hover:text-accent transition-colors">
                            Mi piace
                          </button>
                          <button 
                            onClick={() => setReplyingTo(comment.id)}
                            className="text-xs text-white/60 hover:text-accent transition-colors"
                          >
                            Rispondi
                          </button>
                          {comment.likes_count > 0 && (
                            <span className="text-xs text-white/60">
                              {comment.likes_count} mi piace
                            </span>
                          )}
                        </div>

                        {/* Risposte */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex space-x-2 ml-4">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center flex-shrink-0">
                                  <span className="text-accent font-semibold text-xs">
                                    {reply.author_name?.charAt(0)?.toUpperCase() || '?'}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="bg-dark-400/30 rounded-lg px-2 py-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-semibold text-white text-xs">
                                        {reply.author_name}
                                      </span>
                                      <span className="text-xs text-white/60">
                                        {formatDistanceToNow(new Date(reply.created_at), { 
                                          addSuffix: true, 
                                          locale: it 
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-white/80 text-xs">
                                      {reply.content}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Nessun commento ancora</p>
                  <p className="text-white/40 text-xs">Sii il primo a commentare!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </motion.div>
  );
}