"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  fetchUserConversations,
  fetchListingById
} from "@/services/marketplace";
import { MarketplaceConversation, ListingExpanded } from "@/types/marketplace";

interface ConversationWithListing extends MarketplaceConversation {
  listing?: ListingExpanded;
  otherUserName?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithListing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = React.useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const conversationsData = await fetchUserConversations(user.id);
      
      // Load listing details for each conversation
      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (conversation) => {
          try {
            const listing = await fetchListingById(conversation.listing_id);
            const otherUserId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;
            
            return {
              ...conversation,
              listing,
              otherUserName: listing?.author?.full_name || 'Utente Sconosciuto',
            };
          } catch (error) {
            console.error(`Failed to load details for conversation ${conversation.id}`, error);
            return { 
              ...conversation, 
              listing: undefined,
              otherUserName: 'Dati non disponibili' 
            };
          }
        })
      );
      
      setConversations(conversationsWithDetails);
    } catch (error) {
      toast.error("Errore nel caricamento delle conversazioni.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadConversations();
  }, [user, router, loadConversations]);



  const handleConversationClick = (conversationId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const conversationsData = await fetchUserConversations(user.id);
      
      // Load listing details for each conversation
      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (conversation) => {
          try {
            const listing = await fetchListingById(conversation.listing_id);
            const otherUserId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;
            
            return {
              ...conversation,
              listing,
              otherUserName: `Utente #${otherUserId.slice(-8)}`
            };
          } catch (error) {
            console.error('Error loading listing for conversation:', error);
            return {
              ...conversation,
              otherUserName: 'Utente sconosciuto'
            };
          }
        })
      );
      
      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Errore nel caricamento delle conversazioni');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('it-IT', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <div className="text-lg mb-4">Accesso richiesto</div>
          <Link href="/auth/login" className="px-4 py-2 bg-accent/30 hover:bg-accent/40 rounded-lg">
            Effettua il login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link
              href="/marketplace"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
            >
              ←
            </Link>
            <h1 className="text-lg font-semibold">I tuoi messaggi</h1>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-lg">Caricamento conversazioni...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/marketplace"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold">I tuoi messaggi</h1>
          <div className="ml-auto text-sm text-white/70">
            {conversations.length} conversazioni
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4" role="img" aria-label="Chat bubble emoji">💬</div>
            <h2 className="text-xl font-semibold mb-2">Nessuna conversazione</h2>
            <p className="text-white/70 mb-6">
              Non hai ancora iniziato nessuna conversazione.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/30 hover:bg-accent/40 border border-accent/30 rounded-lg"
            >
              🛍️ Esplora il marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/marketplace/messages/${conversation.id}`}
                className="block p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Listing image */}
                  <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                    {conversation.listing?.listing_images?.[0]?.url ? (
                      <Image
                        src={conversation.listing.listing_images[0].url}
                        alt={conversation.listing.title || 'Immagine annuncio'}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const nextEl = target.nextElementSibling;
                          if(nextEl) nextEl.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center text-2xl text-white/30">
                      📷
                    </div>
                  </div>
                  
                  {/* Conversation info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium line-clamp-1">
                        {conversation.listing?.title || 'Annuncio eliminato'}
                      </h3>
                      <span className="text-sm text-white/70 flex-shrink-0">
                        {formatDate(conversation.updated_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-white/70">
                        <span role="img" aria-label="Chat bubble emoji">💬</span> con {conversation.otherUserName}
                      </span>
                      {conversation.buyer_id === user.id && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full">
                          Acquirente
                        </span>
                      )}
                      {conversation.seller_id === user.id && (
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full">
                          Venditore
                        </span>
                      )}
                    </div>
                    
                    {conversation.last_message && (
                      <p className="text-sm text-white/70 line-clamp-1">
                        {conversation.last_message}
                      </p>
                    )}
                    
                    {conversation.listing && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
                        <span>📍 {conversation.listing.location || 'Civitanova'}</span>
                        {conversation.listing.price_amount && (
                          <span>• {conversation.listing.price_amount}€</span>
                        )}
                        <span>• {conversation.listing.category}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Unread indicator */}
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}