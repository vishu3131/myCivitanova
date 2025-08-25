"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  fetchListingById, 
  fetchListingImages, 
  fetchListingReviews,
  createConversation,
  getConversation
} from "@/services/marketplace";
import { ListingExpanded, ListingReview, MarketplaceConversation } from "@/types/marketplace";
import FavoriteButton from "@/components/marketplace/FavoriteButton";
import ReviewSection from "@/components/marketplace/ReviewSection";

function SafeImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  if (error || !src) {
    return <div className={`bg-white/10 flex items-center justify-center ${className}`}>📷</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      onLoad={() => setLoading(false)}
    />
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const listingId = params.id as string;

  const [listing, setListing] = useState<ListingExpanded | null>(null);
  const [reviews, setReviews] = useState<ListingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (listingId) {
      loadListingData();
    }
  }, [listingId]);

  const loadListingData = async () => {
    try {
      setLoading(true);
      const [listingData, reviewsData] = await Promise.all([
        fetchListingById(listingId),
        fetchListingReviews(listingId)
      ]);
      
      setListing(listingData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading listing:', error);
      toast.error('Errore nel caricamento dell\'annuncio');
      router.push('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (listing: ListingExpanded) => {
    if (!listing.price_amount) return listing.price_type === 'free' ? 'Gratis' : 'Su richiesta';
    const currency = listing.price_currency === 'EUR' ? '€' : listing.price_currency || '€';
    const suffix = listing.price_type === 'hourly' ? '/h' : '';
    return `${listing.price_amount}${currency}${suffix}`;
  };

  const handleContactSeller = async () => {
    if (!user) {
      toast.error('Devi effettuare il login per contattare il venditore');
      return;
    }

    if (!listing) return;

    if (user.id === listing.user_id) {
      toast.error('Non puoi contattare te stesso');
      return;
    }

    try {
      setSendingMessage(true);
      
      // Check if conversation already exists
      let conversation: MarketplaceConversation;
      try {
        conversation = await getConversation(listing.id, user.id, listing.user_id);
      } catch {
        // Create new conversation
        conversation = await createConversation({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.user_id
        });
      }

      // Redirect to messages with conversation ID
      router.push(`/marketplace/messages/${conversation.id}?message=${encodeURIComponent(contactMessage)}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Errore nell\'invio del messaggio');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg">Caricamento annuncio...</div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg mb-4">Annuncio non trovato</div>
          <Link href="/marketplace" className="px-4 py-2 bg-accent/30 hover:bg-accent/40 rounded-lg">
            Torna al marketplace
          </Link>
        </div>
      </div>
    );
  }

  const images = listing.listing_images || [];
  const currentImage = images[selectedImageIndex];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold line-clamp-1">{listing.title}</h1>
            <div className="text-sm text-white/70">📍 {listing.location || 'Civitanova'}</div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton listingId={listing.id} />
            {listing.verified && (
              <span className="px-2 py-1 text-xs bg-blue-500/20 border border-blue-500/30 rounded-lg">
                🛡️ Verificato
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images and main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10">
                {currentImage ? (
                  <SafeImage 
                    src={currentImage.url} 
                    alt={listing.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-white/30">
                    📷
                  </div>
                )}
                
                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/20"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/20"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        index === selectedImageIndex ? 'border-accent' : 'border-white/20'
                      }`}
                    >
                      <SafeImage 
                        src={image.url} 
                        alt={`${listing.title} ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Descrizione</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-white/90 whitespace-pre-wrap">
                  {listing.description || 'Nessuna descrizione disponibile.'}
                </p>
              </div>
            </div>

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Tag</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection listingId={listing.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price and basic info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div className="text-3xl font-bold text-accent">
                {formatPrice(listing)}
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Categoria:</span>
                  <span>{listing.category || 'Non specificata'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Tipo:</span>
                  <span className="capitalize">{listing.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Disponibilità:</span>
                  <span className={listing.is_available ? 'text-green-400' : 'text-red-400'}>
                    {listing.is_available ? 'Disponibile' : 'Non disponibile'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Pubblicato:</span>
                  <span>{new Date(listing.created_at).toLocaleDateString('it-IT')}</span>
                </div>
                {listing.average_rating && (
                  <div className="flex justify-between">
                    <span className="text-white/70">Valutazione:</span>
                    <span>★ {listing.average_rating.toFixed(1)} ({listing.reviews_count} recensioni)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact seller */}
            {user && user.id !== listing.user_id && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold">Contatta il venditore</h3>
                
                {!showContactForm ? (
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full py-3 bg-accent/30 hover:bg-accent/40 border border-accent/30 rounded-lg font-medium"
                  >
                    <span role="img" aria-label="Chat bubble emoji">💬</span> Invia messaggio
                  </button>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Scrivi il tuo messaggio..."
                      className="w-full h-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg resize-none focus:outline-none focus:border-accent"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleContactSeller}
                        disabled={!contactMessage.trim() || sendingMessage}
                        className="flex-1 py-2 bg-accent/30 hover:bg-accent/40 border border-accent/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingMessage ? 'Invio...' : 'Invia'}
                      </button>
                      <button
                        onClick={() => setShowContactForm(false)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Seller info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">Informazioni venditore</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                  👤
                </div>
                <div>
                  <div className="font-medium">Utente #{listing.user_id.slice(-8)}</div>
                  <div className="text-sm text-white/70">Membro dal {new Date(listing.created_at).getFullYear()}</div>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">Condividi</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copiato negli appunti!');
                }}
                className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg"
              >
                📋 Copia link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}