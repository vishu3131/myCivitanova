'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavorite, checkIsFavorite } from '@/services/marketplace';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
  showCount?: boolean;
  favoritesCount?: number;
}

export default function FavoriteButton({ 
  listingId, 
  className = '', 
  showCount = false, 
  favoritesCount = 0 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const favorite = await checkIsFavorite(listingId);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }, [listingId]);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    } else {
      setIsFavorite(false);
    }
  }, [user, checkFavoriteStatus]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Devi effettuare il login per aggiungere ai preferiti');
      return;
    }

    setLoading(true);
    try {
      await toggleFavorite(listingId, isFavorite);
      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite 
          ? 'Rimosso dai preferiti' 
          : 'Aggiunto ai preferiti'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Errore durante l\'operazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`
        flex items-center gap-1 p-2 rounded-full transition-all duration-200
        ${isFavorite 
          ? 'text-red-500 bg-red-50 hover:bg-red-100' 
          : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-500'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
    >
      <Heart 
        size={18} 
        className={`transition-all duration-200 ${
          isFavorite ? 'fill-current' : ''
        }`}
      />
      {showCount && (
        <span className="text-sm font-medium">
          {favoritesCount}
        </span>
      )}
    </button>
  );
}