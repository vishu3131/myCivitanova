'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Euro, Tag } from 'lucide-react';
import { createListing, updateListing, fetchListingImages, ensureStorageBucket } from '@/services/marketplace';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import type { Listing, ListingImage } from '@/types/marketplace';
import ImageUpload from './ImageUpload';

interface ListingFormProps {
  listing?: Listing;
  onSuccess?: (listing: Listing) => void;
  onCancel?: () => void;
  className?: string;
}

interface FormData {
  type: 'sell' | 'buy' | 'exchange';
  title: string;
  description: string;
  price_amount: number;
  price_currency: string;
  price_type: 'fixed' | 'negotiable';
  category: string;
  tags: string[];
  location: string;
  latitude?: number;
  longitude?: number;
}

const CATEGORIES = [
  'Elettronica',
  'Abbigliamento',
  'Casa e Giardino',
  'Sport e Tempo Libero',
  'Veicoli',
  'Libri e Riviste',
  'Musica e Film',
  'Giocattoli',
  'Animali',
  'Servizi',
  'Altro'
];

export default function ListingForm({ 
  listing, 
  onSuccess, 
  onCancel, 
  className = '' 
}: ListingFormProps) {
  const [formData, setFormData] = useState<FormData>({
    type: 'sell',
    title: '',
    description: '',
    price_amount: 0,
    price_currency: 'EUR',
    price_type: 'fixed',
    category: '',
    tags: [],
    location: ''
  });
  
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // Ensure storage bucket exists
    ensureStorageBucket();
    
    if (listing) {
      setFormData({
        type: listing.type,
        title: listing.title,
        description: listing.description || '',
        price_amount: listing.price_amount,
        price_currency: listing.price_currency,
        price_type: listing.price_type,
        category: listing.category || '',
        tags: listing.tags || [],
        location: listing.location || '',
        latitude: listing.latitude,
        longitude: listing.longitude
      });
      
      // Load existing images
      if (listing.id) {
        loadListingImages(listing.id);
      }
    }
  }, [listing]);

  const loadListingImages = async (listingId: string) => {
    try {
      const listingImages = await fetchListingImages(listingId);
      setImages(listingImages);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (newImages: ListingImage[]) => {
    setImages(newImages);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Devi effettuare il login');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Il titolo è obbligatorio');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('La descrizione è obbligatoria');
      return;
    }

    if (formData.price_amount <= 0) {
      toast.error('Il prezzo deve essere maggiore di zero');
      return;
    }

    setLoading(true);
    try {
      let result: Listing;
      
      if (listing) {
        result = await updateListing(listing.id, formData);
        toast.success('Annuncio aggiornato con successo');
      } else {
        result = await createListing(formData);
        toast.success('Annuncio creato con successo');
      }
      
      onSuccess?.(result);
    } catch (error) {
      console.error('Error submitting listing:', error);
      toast.error('Errore durante il salvataggio dell\'annuncio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Tipo di annuncio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo di annuncio
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'sell', label: 'Vendo', color: 'green' },
            { value: 'buy', label: 'Cerco', color: 'blue' },
            { value: 'exchange', label: 'Scambio', color: 'purple' }
          ].map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleInputChange('type', value)}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${formData.type === value
                  ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Titolo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titolo *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Inserisci il titolo dell'annuncio"
          required
        />
      </div>

      {/* Descrizione */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrizione *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Descrivi il tuo annuncio in dettaglio"
          required
        />
      </div>

      {/* Prezzo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prezzo *
          </label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="number"
              value={formData.price_amount}
              onChange={(e) => handleInputChange('price_amount', parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo prezzo
          </label>
          <select
            value={formData.price_type}
            onChange={(e) => handleInputChange('price_type', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="fixed">Fisso</option>
            <option value="negotiable">Trattabile</option>
          </select>
        </div>
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoria
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Seleziona una categoria</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tag
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Aggiungi un tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Tag size={20} />
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Posizione */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Posizione
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Inserisci la posizione"
          />
        </div>
      </div>

      {/* Immagini */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Immagini
        </label>
        
        <ImageUpload
          listingId={listing?.id}
          images={images}
          onImagesChange={handleImagesChange}
          maxImages={10}
          disabled={loading}
        />
      </div>

      {/* Pulsanti */}
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Salvataggio...' : listing ? 'Aggiorna annuncio' : 'Pubblica annuncio'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Annulla
          </button>
        )}
      </div>
    </form>
  );
}