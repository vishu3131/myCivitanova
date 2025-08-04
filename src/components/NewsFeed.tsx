"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2 } from 'lucide-react';

interface NewsItemProps {
  title: string;
  timestamp: string;
  source: string;
  type: 'urgent' | 'news' | 'event';
  onClick: () => void;
}

function NewsItem({ title, timestamp, source, type, onClick }: NewsItemProps) {
  const getTypeStyles = () => {
    switch (type) {
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
  
  // Remove animation states
  const [userReaction, setUserReaction] = useState(null); // 'like', 'dislike', or null
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  // Remove isAnimating states
  const [isAnimatingLike, setIsAnimatingLike] = useState(false);
  const [isAnimatingDislike, setIsAnimatingDislike] = useState(false);
  const [isAnimatingComment, setIsAnimatingComment] = useState(false);
  const [isAnimatingShare, setIsAnimatingShare] = useState(false);

  const handleLike = () => {
    if (userReaction === 'like') {
      setLikes(likes - 1);
      setUserReaction(null);
    } else {
      if (userReaction === 'dislike') {
        setDislikes(dislikes - 1);
      }
      setLikes(likes + 1);
      setUserReaction('like');
    }
    setIsAnimatingLike(true);
    setTimeout(() => setIsAnimatingLike(false), 1000);
  };

  const handleDislike = () => {
    if (userReaction === 'dislike') {
      setDislikes(dislikes - 1);
      setUserReaction(null);
    } else {
      if (userReaction === 'like') {
        setLikes(likes - 1);
      }
      setDislikes(dislikes + 1);
      setUserReaction('dislike');
    }
    setIsAnimatingDislike(true);
    setTimeout(() => setIsAnimatingDislike(false), 1000);
  };
  const handleCommentToggle = () => {
    setShowComments(!showComments);
    setIsAnimatingComment(true);
    setTimeout(() => setIsAnimatingComment(false), 1000);
  };
  const handleShare = () => {
    // Add share logic if needed
    setIsAnimatingShare(true);
    setTimeout(() => setIsAnimatingShare(false), 1000);
  };
  const handleComment = () => {
    if (newComment) {
      setComments([...comments, { id: Date.now(), text: newComment }]);
      setNewComment('');
    }
  };

  const styles = getTypeStyles();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      whileHover={{ scale: 1.02, boxShadow: "0px 0px 8px rgb(255,255,255)" }}
      className={`w-full text-left p-4 rounded-lg ${styles.bgColor} border ${styles.borderColor} mb-3`}
    >
      <div className="flex items-start">
        <div className={`w-8 h-8 rounded-full ${styles.bgColor} flex items-center justify-center ${styles.textColor} mr-3 text-lg`}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-medium ${type === 'urgent' ? 'text-[#E76F51]' : 'text-[#264653]'}`}>{title}</h3>
          <div className="flex items-center text-gray-500 text-xs mt-1">
            <span>{timestamp}</span>
            <span className="mx-1">•</span>
            <span>{source}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-around mt-4">
        <button onClick={handleLike} className={`flex items-center text-black ${userReaction === 'like' ? 'text-blue-500' : ''}`}>
          <ThumbsUp className="w-5 h-5 mr-1" /> {likes}
        </button>
        <button onClick={handleDislike} className={`flex items-center text-black ${userReaction === 'dislike' ? 'text-red-500' : ''}`}>
          <ThumbsDown className="w-5 h-5 mr-1 relative z-10" /> {dislikes}
        </button>
        <button onClick={handleCommentToggle} className="flex items-center text-black relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-green-500 opacity-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={isAnimatingComment ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{ clipPath: 'circle(100% at 50% 50%)', mixBlendMode: 'multiply' }}
          />
          <MessageCircle className="w-5 h-5 mr-1 relative z-10" /> {comments.length}
        </button>
        <button onClick={handleShare} className="flex items-center text-black relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-purple-500 opacity-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={isAnimatingShare ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{ clipPath: 'circle(100% at 50% 50%)', mixBlendMode: 'multiply' }}
          />
          <Share2 className="w-5 h-5 relative z-10" />
        </button>
      </div>
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {comments.map(comment => (
              <div key={comment.id} className="text-sm text-gray-700 border-b py-2">{comment.text}</div>
            ))}
            <input 
              value={newComment} 
              onChange={e => setNewComment(e.target.value)} 
              placeholder="Aggiungi commento..." 
              className="w-full p-2 mt-2 border rounded text-black"
              onKeyPress={e => e.key === 'Enter' && handleComment()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function NewsFeed() {
  const showFeatureComingSoon = () => {
    alert("Questa funzionalità sarà disponibile prossimamente!");
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-heading font-medium">News & Annunci</h2>
        <button 
          className="text-accent text-sm font-medium flex items-center"
          onClick={showFeatureComingSoon}
        >
          Vedi tutti
          <span className="ml-1">→</span>
        </button>
      </div>
      
      <div className="space-y-3">
        <NewsItem 
          title="LAVORI STRADALI: Via Dante chiusa fino al 15 agosto" 
          timestamp="2 ore fa" 
          source="Ufficio Tecnico" 
          type="urgent"
          onClick={showFeatureComingSoon}
        />
        
        <NewsItem 
          title="Festa della Pizza 2024 - Sabato 3 agosto in Piazza" 
          timestamp="Ieri" 
          source="Eventi Comunali" 
          type="event"
          onClick={showFeatureComingSoon}
        />
        
        <NewsItem 
          title="Nuovi orari biblioteca comunale per l'estate" 
          timestamp="3 giorni fa" 
          source="Biblioteca Civica" 
          type="news"
          onClick={showFeatureComingSoon}
        />
        
        <NewsItem 
          title="Inaugurazione nuova pista ciclabile" 
          timestamp="1 settimana fa" 
          source="Assessorato Mobilità" 
          type="news"
          onClick={showFeatureComingSoon}
        />
        
        <NewsItem 
          title="Concerto al tramonto - Lungomare Sud" 
          timestamp="15 Agosto, 19:30" 
          source="Eventi Estivi" 
          type="event"
          onClick={showFeatureComingSoon}
        />
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        <button className="bg-dark-200 hover:bg-dark-100 text-white text-sm px-3 py-1 rounded-full transition-colors">
          Tutti
        </button>
        <button className="bg-[#E76F51]/20 hover:bg-[#E76F51]/30 text-[#E76F51] text-sm px-3 py-1 rounded-full transition-colors">
          Urgenti
        </button>
        <button className="bg-accent/20 hover:bg-accent/30 text-accent text-sm px-3 py-1 rounded-full transition-colors">
          News
        </button>
        <button className="bg-accent/20 hover:bg-accent/30 text-accent text-sm px-3 py-1 rounded-full transition-colors">
          Eventi
        </button>
      </div>
    </div>
  );
}