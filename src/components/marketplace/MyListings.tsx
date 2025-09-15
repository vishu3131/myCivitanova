'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, Heart, MessageCircle, Plus, Package } from 'lucide-react';
import { fetchUserListings, deleteListing } from '@/services/marketplace';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import type { Listing, ListingExpanded } from '@/types/marketplace';
import Link from 'next/link';
import Image from 'next/image';
import ListingForm from './ListingForm';

interface MyListingsProps {
  className?: string;
}

export default function MyListings({ className = '' }: MyListingsProps) {
  const [listings, setListings] = useState<ListingExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user]);

  const loadListings = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const listingsData = await fetchUserListings(user.id);
      setListings(listingsData as ListingExpanded[]);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Errore nel caricamento degli annunci');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo annuncio?')) {
      return;
    }

    try {
      await deleteListing(listingId);
      setListings(prev => prev.filter(listing => listing.id !== listingId));
      toast.success('Annuncio eliminato con successo');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Errore durante l\'eliminazione dell\'annuncio');
    }
  };

  const handleEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setShowForm(true);
  };

  const handleFormSuccess = (listing: Listing) => {
    if (editingListing) {
      setListings(prev => prev.map(l => l.id === listing.id ? listing : l));
    } else {
      setListings(prev => [listing, ...prev]);
    }
    setShowForm(false);
    setEditingListing(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingListing(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Attivo';
      case 'pending':
        return 'In attesa';
      case 'sold':
        return 'Venduto';
      case 'expired':
        return 'Scaduto';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Accedi per vedere i tuoi annunci
        </h3>
        <p className="text-gray-500">
          Effettua il login per gestire i tuoi annunci
        </p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingListing ? 'Modifica annuncio' : 'Nuovo annuncio'}
          </h2>
        </div>
        
        <ListingForm
          listing={editingListing || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={24} />
            I tuoi annunci ({listings.length})
          </h2>
          <p className="text-gray-600 mt-1">
            Gestisci tutti i tuoi annunci
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nuovo annuncio
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nessun annuncio ancora
          </h3>
          <p className="text-gray-500 mb-6">
            Inizia a vendere i tuoi oggetti o cerca quello che ti serve
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Crea il tuo primo annuncio
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex gap-4">
                  {/* Immagine */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {listing.listing_images && listing.listing_images.length > 0 ? (
                      <Image
                        src={listing.listing_images[0].url}
                        alt={listing.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={32} />
                      </div>
                    )}
                  </div>
                  
                  {/* Contenuto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {listing.title}
                        </h3>
                        <p className="text-blue-600 font-medium">
                          {formatPrice(listing.price_amount, listing.price_currency, listing.price_type)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(listing.status)}`}>
                          {getStatusLabel(listing.status)}
                        </span>
                        
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${listing.type === 'beni' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                          }
                        `}>
                          {listing.type === 'beni' ? 'Beni' : 'Servizi'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {listing.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Pubblicato il {formatDate(listing.created_at)}</span>
                        
                        <div className="flex items-center gap-3">
                          {listing.favorites_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Heart size={14} />
                              {listing.favorites_count}
                            </span>
                          )}
                          {listing.reviews_count > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageCircle size={14} />
                              {listing.reviews_count}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/marketplace/${listing.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Visualizza annuncio"
                        >
                          <Eye size={18} />
                        </Link>
                        
                        <button
                          onClick={() => handleEditListing(listing)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Modifica annuncio"
                        >
                          <Edit2 size={18} />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Elimina annuncio"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}