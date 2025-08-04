'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Calendar,
  MessageCircle,
  Heart,
  Share2,
  Crown,
  Shield,
  Star,
  UserPlus,
  Settings,
  MoreVertical
} from 'lucide-react';

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: string;
  coverImage?: string;
  members: number;
  maxMembers?: number;
  isPrivate: boolean;
  isVerified: boolean;
  createdAt: string;
  lastActivity: string;
  tags: string[];
  location?: string;
  upcomingEvents: number;
  recentPosts: number;
  isJoined: boolean;
  isModerator: boolean;
  isOwner: boolean;
}

const CommunityGroups = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrivateGroups, setShowPrivateGroups] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const categories = [
    { id: 'all', label: 'Tutti i Gruppi', count: 28 },
    { id: 'sports', label: 'Sport', count: 8 },
    { id: 'culture', label: 'Cultura', count: 6 },
    { id: 'hobby', label: 'Hobby', count: 5 },
    { id: 'business', label: 'Business', count: 4 },
    { id: 'environment', label: 'Ambiente', count: 3 },
    { id: 'social', label: 'Social', count: 2 }
  ];

  const mockGroups: CommunityGroup[] = [
    {
      id: '1',
      name: 'Ciclisti Civitanova',
      description: 'Gruppo di ciclisti amatoriali e professionisti. Organizziamo escursioni settimanali e partecipiamo a eventi ciclistici.',
      category: 'sports',
      avatar: '/groups/ciclisti.jpg',
      members: 45,
      maxMembers: 100,
      isPrivate: false,
      isVerified: true,
      createdAt: '2023-01-15',
      lastActivity: '2 ore fa',
      tags: ['ciclismo', 'escursioni', 'sport'],
      location: 'Civitanova Marche',
      upcomingEvents: 2,
      recentPosts: 5,
      isJoined: true,
      isModerator: false,
      isOwner: false
    },
    {
      id: '2',
      name: 'Artigiani Locali',
      description: 'Community di artigiani della zona per condividere tecniche, organizzare mostre e promuovere l\'artigianato locale.',
      category: 'culture',
      avatar: '/groups/artigiani.jpg',
      members: 23,
      maxMembers: 50,
      isPrivate: true,
      isVerified: true,
      createdAt: '2023-03-20',
      lastActivity: '1 giorno fa',
      tags: ['artigianato', 'cultura', 'mostre'],
      location: 'Centro Storico',
      upcomingEvents: 1,
      recentPosts: 3,
      isJoined: false,
      isModerator: false,
      isOwner: false
    },
    {
      id: '3',
      name: 'Fotografi Amatoriali',
      description: 'Gruppo per appassionati di fotografia. Condividiamo scatti, organizziamo uscite fotografiche e workshop.',
      category: 'hobby',
      avatar: '/groups/fotografi.jpg',
      members: 67,
      maxMembers: 150,
      isPrivate: false,
      isVerified: false,
      createdAt: '2023-02-10',
      lastActivity: '5 ore fa',
      tags: ['fotografia', 'arte', 'workshop'],
      location: 'Civitanova Marche',
      upcomingEvents: 3,
      recentPosts: 12,
      isJoined: true,
      isModerator: true,
      isOwner: false
    },
    {
      id: '4',
      name: 'Giovani Imprenditori',
      description: 'Network di giovani imprenditori per scambiare idee, creare collaborazioni e supportarsi reciprocamente.',
      category: 'business',
      avatar: '/groups/imprenditori.jpg',
      members: 34,
      maxMembers: 80,
      isPrivate: true,
      isVerified: true,
      createdAt: '2023-04-05',
      lastActivity: '3 ore fa',
      tags: ['business', 'networking', 'imprenditoria'],
      location: 'Civitanova Marche',
      upcomingEvents: 1,
      recentPosts: 8,
      isJoined: false,
      isModerator: false,
      isOwner: false
    },
    {
      id: '5',
      name: 'Pulizia Spiaggia',
      description: 'Volontari che si occupano della pulizia e manutenzione delle spiagge di Civitanova Marche.',
      category: 'environment',
      avatar: '/groups/pulizia.jpg',
      members: 89,
      maxMembers: 200,
      isPrivate: false,
      isVerified: true,
      createdAt: '2022-06-15',
      lastActivity: '1 ora fa',
      tags: ['ambiente', 'volontariato', 'spiaggia'],
      location: 'Lido Cluana',
      upcomingEvents: 4,
      recentPosts: 15,
      isJoined: true,
      isModerator: false,
      isOwner: true
    },
    {
      id: '6',
      name: 'Book Club Civitanova',
      description: 'Club di lettura per condividere la passione per i libri. Incontri mensili e discussioni online.',
      category: 'culture',
      avatar: '/groups/bookclub.jpg',
      members: 28,
      maxMembers: 60,
      isPrivate: false,
      isVerified: false,
      createdAt: '2023-05-12',
      lastActivity: '2 giorni fa',
      tags: ['lettura', 'cultura', 'libri'],
      location: 'Biblioteca Comunale',
      upcomingEvents: 1,
      recentPosts: 6,
      isJoined: false,
      isModerator: false,
      isOwner: false
    }
  ];

  const filteredGroups = mockGroups.filter(group => {
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrivacyFilter = showPrivateGroups || !group.isPrivate;
    return matchesCategory && matchesSearch && matchesPrivacyFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sports': return '⚽';
      case 'culture': return '🎭';
      case 'hobby': return '🎨';
      case 'business': return '💼';
      case 'environment': return '🌱';
      case 'social': return '👥';
      default: return '📁';
    }
  };

  const getMemberStatus = (group: CommunityGroup) => {
    if (group.isOwner) return { text: 'Proprietario', color: 'bg-purple-100 text-purple-800' };
    if (group.isModerator) return { text: 'Moderatore', color: 'bg-blue-100 text-blue-800' };
    if (group.isJoined) return { text: 'Membro', color: 'bg-green-100 text-green-800' };
    return { text: 'Pubblico', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gruppi Community</h2>
            <p className="text-gray-600">Unisciti ai gruppi di interesse della tua città</p>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crea Gruppo</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca gruppi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowPrivateGroups(!showPrivateGroups)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showPrivateGroups
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Gruppi Privati
          </button>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{getCategoryIcon(category.id)}</span>
              <span>{category.label}</span>
              <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGroups.map((group) => {
          const memberStatus = getMemberStatus(group);
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Group Header */}
              <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                {group.coverImage ? (
                  <Image 
                    src={group.coverImage} 
                    alt={group.name}
                    className="w-full h-full object-cover"
                    fill
                    sizes="100vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-white opacity-50" />
                  </div>
                )}
                
                {/* Group Status */}
                <div className="absolute top-3 right-3 flex space-x-2">
                  {group.isPrivate && (
                    <div className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs">
                      🔒 Privato
                    </div>
                  )}
                  {group.isVerified && (
                    <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                      ✓ Verificato
                    </div>
                  )}
                </div>
                
                {/* Member Status */}
                <div className="absolute bottom-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${memberStatus.color}`}>
                    {memberStatus.text}
                  </span>
                </div>
              </div>

              {/* Group Content */}
              <div className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <Image 
                    src={group.avatar} 
                    alt={group.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    width={64}
                    height={64}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {group.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{group.members}/{group.maxMembers || '∞'} membri</span>
                      {group.location && (
                        <>
                          <span>•</span>
                          <MapPin className="w-4 h-4" />
                          <span>{group.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {group.description}
                </p>

                {/* Group Stats */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{group.upcomingEvents} eventi</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{group.recentPosts} post recenti</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    Attività: {group.lastActivity}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {group.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      group.isJoined
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {group.isJoined ? 'Già Membro' : 'Unisciti'}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <Share2 className="w-4 h-4" />
                    </button>
                    {(group.isModerator || group.isOwner) && (
                      <button className="p-2 text-gray-500 hover:text-gray-700">
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun gruppo trovato</h3>
          <p className="text-gray-600">Prova a modificare i filtri o crea il primo gruppo!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityGroups;