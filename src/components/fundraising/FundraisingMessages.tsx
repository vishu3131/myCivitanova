'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, User, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { FundraisingAPI, FundraisingMessage } from '@/lib/fundraisingApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface FundraisingMessagesProps {
  campaignId: string;
  campaignTitle: string;
  isCreator?: boolean;
  className?: string;
}

export function FundraisingMessages({ 
  campaignId, 
  campaignTitle, 
  isCreator = false, 
  className = '' 
}: FundraisingMessagesProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<FundraisingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    isCreator ? 'all' : 'approved'
  );

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await FundraisingAPI.getCampaignMessages(
        campaignId, 
        statusFilter === 'all' ? undefined : statusFilter
      );
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Errore nel caricamento dei messaggi');
    } finally {
      setLoading(false);
    }
  }, [campaignId, statusFilter]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSendMessage = async () => {
    if (!user) {
      toast.error('Devi essere autenticato per inviare un messaggio');
      return;
    }

    if (!newMessage.trim()) {
      toast.error('Il messaggio non può essere vuoto');
      return;
    }

    try {
      setSending(true);
      await FundraisingAPI.createFundraisingMessage({
        campaign_id: campaignId,
        message: newMessage.trim(),
        is_anonymous: isAnonymous,
        sender_name: isAnonymous ? undefined : user.user_metadata?.full_name,
        sender_email: isAnonymous ? undefined : user.email
      });

      toast.success('Messaggio inviato! Sarà visibile dopo la moderazione.');
      setNewMessage('');
      setIsAnonymous(false);
      setShowMessageForm(false);
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Errore nell\'invio del messaggio');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateMessageStatus = async (messageId: string, status: 'approved' | 'rejected') => {
    try {
      await FundraisingAPI.updateFundraisingMessage(messageId, { status });
      toast.success(`Messaggio ${status === 'approved' ? 'approvato' : 'rifiutato'}`);
      loadMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error('Errore nell\'aggiornamento del messaggio');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo messaggio?')) {
      return;
    }

    try {
      await FundraisingAPI.deleteFundraisingMessage(messageId);
      toast.success('Messaggio eliminato');
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Errore nell\'eliminazione del messaggio');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approvato';
      case 'pending':
        return 'In attesa';
      case 'rejected':
        return 'Rifiutato';
      default:
        return 'Sconosciuto';
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Messaggi per la raccolta fondi
              </h3>
              <p className="text-sm text-white/60">{campaignTitle}</p>
            </div>
          </div>
          
          {user && (
            <button
              onClick={() => setShowMessageForm(!showMessageForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Scrivi messaggio
            </button>
          )}
        </div>

        {/* Status Filter for creators */}
        {isCreator && (
          <div className="mt-4 flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {status === 'all' ? 'Tutti' : getStatusText(status)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message Form */}
      {showMessageForm && user && (
        <div className="p-6 border-b border-white/10 bg-white/5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Il tuo messaggio
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi un messaggio di supporto o una domanda..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-xs text-white/50 mt-1">
                {newMessage.length}/500 caratteri
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="anonymous" className="text-sm text-white/70">
                Invia come anonimo
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? 'Invio...' : 'Invia messaggio'}
              </button>
              
              <button
                onClick={() => {
                  setShowMessageForm(false);
                  setNewMessage('');
                  setIsAnonymous(false);
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">
              {statusFilter === 'approved' 
                ? 'Nessun messaggio ancora pubblicato'
                : 'Nessun messaggio trovato'
              }
            </p>
            {!user && (
              <p className="text-white/40 text-sm mt-2">
                Accedi per inviare un messaggio di supporto
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {message.is_anonymous 
                            ? 'Utente anonimo' 
                            : message.sender?.full_name || message.sender_name || 'Utente'
                          }
                        </span>
                        {isCreator && (
                          <div className="flex items-center gap-1">
                            {getStatusIcon(message.status)}
                            <span className="text-xs text-white/60">
                              {getStatusText(message.status)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-white/50">
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: it
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {isCreator && message.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateMessageStatus(message.id, 'approved')}
                          className="p-1 text-green-400 hover:bg-green-400/20 rounded transition-colors"
                          title="Approva messaggio"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateMessageStatus(message.id, 'rejected')}
                          className="p-1 text-red-400 hover:bg-red-400/20 rounded transition-colors"
                          title="Rifiuta messaggio"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    {(user?.id === message.sender_id || isCreator) && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1 text-red-400 hover:bg-red-400/20 rounded transition-colors"
                        title="Elimina messaggio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-white/80 leading-relaxed">
                  {message.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}