'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Heart,
  Share2,
  Plus,
  Search,
  Filter,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  organizer: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
    coordinates?: [number, number];
  };
  category: string;
  attendees: number;
  maxAttendees?: number;
  isFree: boolean;
  price?: number;
  tags: string[];
  image?: string;
  isLiked: boolean;
  isAttending: boolean;
  isPast: boolean;
}

const CommunityEvents = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const categories = [
    { id: 'all', label: 'Tutti gli Eventi', count: 45 },
    { id: 'social', label: 'Social', count: 12 },
    { id: 'sports', label: 'Sport', count: 8 },
    { id: 'culture', label: 'Cultura', count: 15 },
    { id: 'environment', label: 'Ambiente', count: 5 },
    { id: 'business', label: 'Business', count: 5 }
  ];

  const mockEvents: CommunityEvent[] = [
    {
      id: '1',
      title: 'Pulizia Spiaggia Comunitaria',
      description: 'Organizziamo una giornata di pulizia della spiaggia per mantenere il nostro litorale pulito e accogliente. Tutti sono benvenuti!',
      organizer: {
        name: 'Associazione Mare Pulito',
        avatar: '/avatars/associazione.jpg',
        verified: true
      },
      date: '2024-02-15',
      time: '09:00 - 12:00',
      location: {
        name: 'Lido Cluana',
        address: 'Via del Mare, Civitanova Marche'
      },
      category: 'environment',
      attendees: 25,
      maxAttendees: 50,
      isFree: true,
      tags: ['ambiente', 'spiaggia', 'volontariato'],
      isLiked: false,
      isAttending: false,
      isPast: false
    },
    {
      id: '2',
      title: 'Mercatino dell\'Artigianato Locale',
      description: 'Scopri i prodotti artigianali della nostra zona. Un\'occasione per sostenere gli artigiani locali e trovare pezzi unici.',
      organizer: {
        name: 'Comitato Artigiani',
        avatar: '/avatars/artigiani.jpg',
        verified: true
      },
      date: '2024-02-20',
      time: '10:00 - 18:00',
      location: {
        name: 'Piazza XX Settembre',
        address: 'Centro Storico, Civitanova Marche'
      },
      category: 'culture',
      attendees: 120,
      maxAttendees: 200,
      isFree: true,
      tags: ['artigianato', 'commercio', 'cultura'],
      isLiked: true,
      isAttending: true,
      isPast: false
    },
    {
      id: '3',
      title: 'Corsa Non Competitiva Lungomare',
      description: 'Una corsa amatoriale di 5km lungo il lungomare. Perfetta per tutti i livelli, dai principianti agli esperti.',
      organizer: {
        name: 'Running Club Civitanova',
        avatar: '/avatars/running.jpg',
        verified: false
      },
      date: '2024-02-25',
      time: '08:00 - 10:00',
      location: {
        name: 'Lungomare Nord',
        address: 'Lungomare Nord, Civitanova Marche'
      },
      category: 'sports',
      attendees: 45,
      maxAttendees: 100,
      isFree: false,
      price: 5,
      tags: ['sport', 'corsa', 'salute'],
      isLiked: false,
      isAttending: false,
      isPast: false
    },
    {
      id: '4',
      title: 'Serata Networking Giovani Imprenditori',
      description: 'Un\'occasione per conoscere altri giovani imprenditori della zona e creare nuove collaborazioni.',
      organizer: {
        name: 'Giovani Imprenditori Marche',
        avatar: '/avatars/imprenditori.jpg',
        verified: true
      },
      date: '2024-02-18',
      time: '19:00 - 22:00',
      location: {
        name: 'Hotel Cluana',
        address: 'Via del Mare, 123, Civitanova Marche'
      },
      category: 'business',
      attendees: 18,
      maxAttendees: 30,
      isFree: false,
      price: 15,
      tags: ['business', 'networking', 'imprenditoria'],
      isLiked: false,
      isAttending: false,
      isPast: false
    }
  ];

  const filteredEvents = mockEvents.filter(event => {
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTimeFilter = showPastEvents || !event.isPast;
    return matchesCategory && matchesSearch && matchesTimeFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social': return '👥';
      case 'sports': return '⚽';
      case 'culture': return '🎭';
      case 'environment': return '🌱';
      case 'business': return '💼';
      default: return '📅';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Eventi Community</h2>
            <p className="text-gray-600">Scopri e organizza eventi nella tua città</p>
          </div>
          <button
            onClick={() => setShowCreateEvent(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crea Evento</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca eventi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowPastEvents(!showPastEvents)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showPastEvents
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Eventi Passati
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

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Event Image */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
              {event.image ? (
                <Image 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                  fill
                  sizes="100vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-white opacity-50" />
                </div>
              )}
              
              {/* Event Status */}
              {event.isPast && (
                <div className="absolute top-3 right-3 bg-gray-800 text-white px-2 py-1 rounded-full text-xs">
                  Passato
                </div>
              )}
              
              {/* Like Button */}
              <button className="absolute top-3 left-3 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100">
                <Heart className={`w-4 h-4 ${event.isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Event Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {event.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.date)}</span>
                    <span>•</span>
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {event.isFree ? 'Gratuito' : `€${event.price}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.attendees}/{event.maxAttendees || '∞'} partecipanti
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{event.location.name}</span>
              </div>

              {/* Organizer */}
              <div className="flex items-center space-x-2 mb-4">
                <Image 
                  src={event.organizer.avatar} 
                  alt={event.organizer.name}
                  className="w-6 h-6 rounded-full"
                  width={24}
                  height={24}
                />
                <span className="text-sm text-gray-700">{event.organizer.name}</span>
                {event.organizer.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {event.tags.map((tag) => (
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
                    event.isAttending
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {event.isAttending ? 'Parteciperò' : 'Partecipa'}
                </button>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Star className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun evento trovato</h3>
          <p className="text-gray-600">Prova a modificare i filtri o crea il primo evento!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityEvents;