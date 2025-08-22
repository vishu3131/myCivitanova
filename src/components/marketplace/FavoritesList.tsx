'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Euro, Calendar } from 'lucide-react';
import { fetchUserFavorites, toggleFavorite } from '@/services/marketplace';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Listing } from '@/services/marketplace';
import Link from 'next/link';
import Image from 'next/image';

interface FavoritesListProps {
  className?: string;
}

export default function FavoritesList({ className = '' }: FavoritesListProps) {
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favoritesData = await fetchUserFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Errore nel caricamento dei preferiti');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (listingId: string) => {
    try {
      await toggleFavorite(listingId, true); // true = remove from favorites
      setFavorites(prev => prev.filter(listing => listing.id !== listingId));
      toast.success('Rimosso dai preferiti');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Errore durante la rimozione');
    }
  };

  const formatPrice = (amount: number, currency: string, type: string) => {
    const formattedAmount = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(amount);
    
    return type === 'negotiable' ? `${formattedAmount} (trattabile)` : formattedAmount;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Heart size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Accedi per vedere i tuoi preferiti
        </h3>
        <p className="text-gray-500">
          Effettua il login per salvare e visualizzare i tuoi annunci preferiti
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Heart size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Nessun preferito ancora
        </h3>
        <p className="text-gray-500 mb-6">
          Inizia a esplorare il marketplace e salva i tuoi annunci preferiti
        </p>
        <Link 
          href="/marketplace"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Esplora Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="text-red-500" size={24} />
          I tuoi preferiti ({favorites.length})
        </h2>
        <p className="text-gray-600 mt-1">
          Tutti gli annunci che hai salvato
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <Link href={`/marketplace/${listing.id}`}>
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {listing.images && listing.images.length > 0 ? (
                    <Image
                      src={listing.images[0].url}
                      alt={listing.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400 text-sm">Nessuna immagine</span>
                    </div>
                  )}
                </div>
              </Link>
              
              <button
                onClick={() => handleRemoveFavorite(listing.id)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-white hover:text-red-600 transition-all shadow-sm"
                title="Rimuovi dai preferiti"
              >
                <Heart size={18} className="fill-current" />
              </button>
              
              {listing.verified && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                  Verificato
                </div>
              )}
            </div>
            
            <div className="p-4">
              <Link href={`/marketplace/${listing.id}`}>
                <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                  {listing.title}
                </h3>
              </Link>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Euro size={14} />
                  <span className="font-medium text-blue-600">
                    {formatPrice(listing.price_amount, listing.price_currency, listing.price_type)}
                  </span>
                </div>
                
                {listing.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{listing.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{formatDate(listing.created_at)}</span>
                </div>
              </div>
              
              {listing.description && (
                <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                  {listing.description}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className={`
                  px-2 py-1 text-xs rounded-full
                  ${listing.type === 'sell' 
                    ? 'bg-green-100 text-green-800' 
                    : listing.type === 'buy'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                  }
                `}>
                  {listing.type === 'sell' ? 'Vendo' : listing.type === 'buy' ? 'Cerco' : 'Scambio'}
                </span>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {listing.favorites_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart size={12} />
                      {listing.favorites_count}
                    </span>
                  )}
                  {listing.reviews_count > 0 && (
                    <span>
                      {listing.reviews_count} recensioni
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}