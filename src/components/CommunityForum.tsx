'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Share2,
  Flag,
  MoreVertical,
  User,
  Clock,
  TrendingUp
} from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
  };
  timestamp: string;
  likes: number;
  dislikes: number;
  replies: number;
  views: number;
  tags: string[];
  isPinned?: boolean;
  isLocked?: boolean;
}

interface ForumReply {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
  };
  timestamp: string;
  likes: number;
  dislikes: number;
  isSolution?: boolean;
}

const CommunityForum = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tutte le Discussioni', count: 156 },
    { id: 'urban', label: 'Urbanistica', count: 23 },
    { id: 'events', label: 'Eventi', count: 45 },
    { id: 'sports', label: 'Sport', count: 18 },
    { id: 'culture', label: 'Cultura', count: 32 },
    { id: 'business', label: 'Commercio', count: 28 },
    { id: 'environment', label: 'Ambiente', count: 10 }
  ];

  const mockTopics: ForumPost[] = [
    {
      id: '1',
      title: 'Idee per migliorare il lungomare di Civitanova',
      content: 'Cosa ne pensate di aggiungere più panchine, fontane e aree verdi lungo il lungomare? Potrebbe rendere la zona ancora più accogliente per residenti e turisti.',
      author: {
        name: 'Laura Bianchi',
        avatar: '/avatars/laura.jpg',
        reputation: 1250
      },
      timestamp: '2 ore fa',
      likes: 24,
      dislikes: 2,
      replies: 18,
      views: 156,
      tags: ['urbanistica', 'lungomare', 'miglioramenti'],
      isPinned: true
    },
    {
      id: '2',
      title: 'Organizziamo un mercatino dell\'artigianato locale',
      content: 'Propongo di organizzare un mercatino mensile per promuovere l\'artigianato locale. Potremmo coinvolgere gli artigiani della zona e creare un evento ricorrente.',
      author: {
        name: 'Marco Rossi',
        avatar: '/avatars/marco.jpg',
        reputation: 890
      },
      timestamp: '5 ore fa',
      likes: 15,
      dislikes: 1,
      replies: 8,
      views: 89,
      tags: ['eventi', 'artigianato', 'commercio']
    },
    {
      id: '3',
      title: 'Problemi con i parcheggi nel centro storico',
      content: 'Sto notando sempre più difficoltà nel trovare parcheggio nel centro storico, specialmente nei weekend. Qualcuno ha proposte per migliorare la situazione?',
      author: {
        name: 'Giulia Verdi',
        avatar: '/avatars/giulia.jpg',
        reputation: 567
      },
      timestamp: '1 giorno fa',
      likes: 12,
      dislikes: 0,
      replies: 6,
      views: 67,
      tags: ['parcheggi', 'centro-storico', 'mobilità']
    }
  ];

  const mockReplies: ForumReply[] = [
    {
      id: '1',
      content: 'Ottima idea! Suggerirei di aggiungere anche delle aree gioco per i bambini e più illuminazione per le serate estive.',
      author: {
        name: 'Antonio Neri',
        avatar: '/avatars/antonio.jpg',
        reputation: 2340
      },
      timestamp: '1 ora fa',
      likes: 8,
      dislikes: 0,
      isSolution: true
    },
    {
      id: '2',
      content: 'Concordo con Laura, il lungomare è già bello ma potrebbe essere ancora più accogliente. Forse potremmo anche pensare a dei chioschi con prodotti locali.',
      author: {
        name: 'Sofia Costa',
        avatar: '/avatars/sofia.jpg',
        reputation: 1567
      },
      timestamp: '30 minuti fa',
      likes: 5,
      dislikes: 0
    }
  ];

  const filteredTopics = mockTopics.filter(topic => {
    const matchesCategory = selectedCategory === 'all' || topic.tags.includes(selectedCategory);
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-6 card-glow border border-white/10 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Forum di Discussione</h2>
            <p className="text-white/60">Partecipa alle discussioni della community</p>
          </div>
          <button
            onClick={() => setShowNewTopic(true)}
            className="bg-accent text-dark-400 px-4 py-2 rounded-lg hover:bg-accent/90 flex items-center space-x-2 font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Nuova Discussione</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Cerca nelle discussioni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white/40"
          />
          <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-accent text-dark-400'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <span>{category.label}</span>
              <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-6 card-glow border border-white/10 hover:border-accent/30 transition-all cursor-pointer"
            onClick={() => setSelectedTopic(topic.id)}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-accent" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {topic.isPinned && (
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                      📌 In Evidenza
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-white truncate">
                    {topic.title}
                  </h3>
                </div>
                
                <p className="text-white/80 mb-3 line-clamp-2">
                  {topic.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-white/60">
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-xs text-accent">LB</span>
                      </div>
                      <span>{topic.author.name}</span>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                        {topic.author.reputation}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{topic.timestamp}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{topic.views} visualizzazioni</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 text-white/60 hover:text-accent transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{topic.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-white/60 hover:text-red-400 transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                        <span>{topic.dislikes}</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-1 text-white/60">
                      <Reply className="w-4 h-4" />
                      <span>{topic.replies}</span>
                    </div>
                    <button className="text-white/60 hover:text-accent transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {topic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-accent/20 text-accent px-2 py-1 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nessuna discussione trovata</h3>
          <p className="text-white/60">Prova a modificare i filtri o inizia una nuova discussione!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityForum; 