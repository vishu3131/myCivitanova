'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageCircle, Edit2, Trash2 } from 'lucide-react';
import { fetchListingReviews, createReview, updateReview, deleteReview } from '@/services/marketplace';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { ListingReview } from '@/services/marketplace';

interface ReviewSectionProps {
  listingId: string;
  averageRating?: number;
  reviewsCount?: number;
  className?: string;
}

interface ReviewFormData {
  rating: number;
  comment: string;
}

export default function ReviewSection({ 
  listingId, 
  averageRating = 0, 
  reviewsCount = 0,
  className = '' 
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ListingReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: ''
  });
  const { user } = useAuth();

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const reviewsData = await fetchListingReviews(listingId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Errore nel caricamento delle recensioni');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Devi effettuare il login per lasciare una recensione');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Il commento è obbligatorio');
      return;
    }

    try {
      if (editingReview) {
        await updateReview(editingReview, formData.rating, formData.comment);
        toast.success('Recensione aggiornata con successo');
      } else {
        await createReview(listingId, formData.rating, formData.comment);
        toast.success('Recensione aggiunta con successo');
      }
      
      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
      setEditingReview(null);
      loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Errore durante l\'invio della recensione');
    }
  };

  const handleEditReview = (review: ListingReview) => {
    setFormData({
      rating: review.rating,
      comment: review.comment || ''
    });
    setEditingReview(review.id);
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa recensione?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      toast.success('Recensione eliminata con successo');
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Errore durante l\'eliminazione della recensione');
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 24 : 16}
            className={`
              ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}
            `}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con statistiche */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle size={20} />
            Recensioni ({reviewsCount})
          </h3>
          {averageRating > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(averageRating)}
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        {user && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingReview(null);
              setFormData({ rating: 5, comment: '' });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Scrivi recensione
          </button>
        )}
      </div>

      {/* Form per nuova recensione */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valutazione
            </label>
            {renderStars(
              formData.rating, 
              true, 
              (rating) => setFormData(prev => ({ ...prev, rating }))
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commento
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Scrivi la tua recensione..."
              required
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingReview ? 'Aggiorna' : 'Pubblica'} recensione
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingReview(null);
                setFormData({ rating: 5, comment: '' });
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>
      )}

      {/* Lista recensioni */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Caricamento recensioni...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nessuna recensione ancora</p>
            <p className="text-sm">Sii il primo a lasciare una recensione!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {review.reviewer_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.reviewer_name || 'Utente'}
                    </p>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {user?.id === review.reviewer_id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Modifica recensione"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Elimina recensione"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              {review.comment && (
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}