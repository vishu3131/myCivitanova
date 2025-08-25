"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  getConversation,
  fetchConversationMessages,
  sendMessage,
  markMessagesAsRead,
  fetchListingById
} from "@/services/marketplace";
import { MarketplaceConversation, MarketplaceMessage, ListingExpanded } from "@/types/marketplace";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const conversationId = params.id as string;
  const initialMessage = searchParams.get('message');
  
  const [conversation, setConversation] = useState<MarketplaceConversation | null>(null);
  const [listing, setListing] = useState<ListingExpanded | null>(null);
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [newMessage, setNewMessage] = useState(initialMessage || '');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (conversationId) {
      loadConversationData();
    }
  }, [conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when component mounts or messages change
    if (conversation && user && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => msg.sender_id !== user.id && !msg.read_at
      );
      if (unreadMessages.length > 0) {
        markMessagesAsRead(conversationId, user.id).catch(console.error);
      }
    }
  }, [messages, conversation, user, conversationId]);

  const loadConversationData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [conversationData, messagesData] = await Promise.all([
        getConversation(conversationId),
        fetchConversationMessages(conversationId)
      ]);
      
      // Check if user is part of this conversation
      if (conversationData.buyer_id !== user.id && conversationData.seller_id !== user.id) {
        toast.error('Non hai accesso a questa conversazione');
        router.push('/marketplace/messages');
        return;
      }
      
      setConversation(conversationData);
      setMessages(messagesData);
      
      // Load listing details
      try {
        const listingData = await fetchListingById(conversationData.listing_id);
        setListing(listingData);
      } catch (error) {
        console.error('Error loading listing:', error);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Errore nel caricamento della conversazione');
      router.push('/marketplace/messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversation || sending) return;
    
    try {
      setSending(true);
      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage.trim()
      };
      
      const sentMessage = await sendMessage(messageData);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Errore nell\'invio del messaggio');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + 
             ' ' + date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getOtherUserName = () => {
    if (!conversation || !user) return 'Utente';
    const otherUserId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;
    return `Utente #${otherUserId.slice(-8)}`;
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg">Caricamento conversazione...</div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg mb-4">Conversazione non trovata</div>
          <Link href="/marketplace/messages" className="px-4 py-2 bg-accent/30 hover:bg-accent/40 rounded-lg">
            Torna ai messaggi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/marketplace/messages"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
            >
              ←
            </Link>
            
            {/* Listing info */}
            {listing && (
              <Link
                href={`/marketplace/${listing.id}`}
                className="flex items-center gap-3 flex-1 min-w-0 hover:bg-white/5 rounded-lg p-2 -m-2"
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                  {listing.listing_images?.[0]?.url ? (
                    <img
                      src={listing.listing_images[0].url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center text-lg text-white/30">
                    📷
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium line-clamp-1">{listing.title}</div>
                  <div className="text-sm text-white/70">
                    <span role="img" aria-label="Chat bubble emoji">💬</span> con {getOtherUserName()}
                  </div>
                </div>
              </Link>
            )}
            
            {!listing && (
              <div className="flex-1">
                <div className="font-medium">Conversazione</div>
                <div className="text-sm text-white/70">
                  💬 con {getOtherUserName()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4" role="img" aria-label="Chat bubble emoji">💬</div>
            <p className="text-white/70">
              Inizia la conversazione inviando un messaggio!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.sender_id === user.id;
              const showTime = index === 0 || 
                new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 5 * 60 * 1000;
              
              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                    {showTime && (
                      <div className="text-xs text-white/50 text-center mb-2">
                        {formatMessageTime(message.created_at)}
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-accent/30 border border-accent/30 text-white'
                          : 'bg-white/10 border border-white/20 text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <div className={`text-xs mt-1 ${
                        isOwn ? 'text-white/70' : 'text-white/50'
                      }`}>
                        {formatMessageTime(message.created_at)}
                        {isOwn && message.read_at && (
                          <span className="ml-2">✓✓</span>
                        )}
                        {isOwn && !message.read_at && (
                          <span className="ml-2">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="sticky bottom-0 bg-black/80 backdrop-blur-md border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Scrivi un messaggio..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl resize-none focus:outline-none focus:border-accent min-h-[48px] max-h-32"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-3 bg-accent/30 hover:bg-accent/40 border border-accent/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sending ? '⏳' : '📤'}
            </button>
          </form>
          <div className="text-xs text-white/50 mt-2 text-center">
            Premi Invio per inviare, Shift+Invio per andare a capo
          </div>
        </div>
      </div>
    </div>
  );
}