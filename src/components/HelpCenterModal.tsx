"use client";

import React, { useState } from 'react';
import { X, HelpCircle, Search, ChevronDown, ChevronRight, Send, MessageCircle, Book, Phone, Mail } from 'lucide-react';
import { SupportStorage } from '@/utils/profileStorage';

interface HelpCenterModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export function HelpCenterModal({ user, isOpen, onClose }: HelpCenterModalProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const helpArticles = [
    {
      id: '1',
      title: 'Come creare un account?',
      content: 'Per creare un account, clicca sul pulsante "Registrati" nella schermata di login. Inserisci i tuoi dati personali e segui le istruzioni per completare la registrazione.',
      category: 'account'
    },
    {
      id: '2',
      title: 'Come modificare il mio profilo?',
      content: 'Vai nella sezione Profilo, clicca su "Modifica Profilo" e aggiorna le informazioni che desideri cambiare. Non dimenticare di salvare le modifiche.',
      category: 'account'
    },
    {
      id: '3',
      title: 'Come funzionano le notifiche?',
      content: 'Le notifiche ti informano su eventi, aggiornamenti e attività importanti. Puoi gestire le tue preferenze di notifica nelle impostazioni.',
      category: 'notifications'
    }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      await SupportStorage.createTicket(user.id, contactForm);
      
      setSubmitSuccess(true);
      setContactForm({ subject: '', message: '', category: 'general', priority: 'medium' });
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('faq');
      }, 3000);
      
    } catch (error: any) {
      console.error('Errore invio ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Centro Assistenza</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'faq'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Book className="w-5 h-5" />
              <span>FAQ</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'contact'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Contattaci</span>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'faq' ? (
            <div className="p-6">
              <div className="space-y-3">
                {helpArticles.map((article) => (
                  <div key={article.id} className="border border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedArticle(
                        expandedArticle === article.id ? null : article.id
                      )}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-white font-medium text-left">{article.title}</span>
                      {expandedArticle === article.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedArticle === article.id && (
                      <div className="px-4 pb-4 border-t border-gray-700">
                        <p className="text-gray-300 leading-relaxed">{article.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Messaggio Inviato!</h3>
                  <p className="text-gray-400">Ti risponderemo il prima possibile.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-medium">Email</span>
                      </div>
                      <p className="text-gray-400 text-sm">support@mycivitanova.it</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Phone className="w-5 h-5 text-green-400" />
                        <span className="text-white font-medium">Telefono</span>
                      </div>
                      <p className="text-gray-400 text-sm">+39 0733 123456</p>
                    </div>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Categoria</label>
                        <select
                          value={contactForm.category}
                          onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                        >
                          <option value="general">Generale</option>
                          <option value="technical">Problema Tecnico</option>
                          <option value="account">Account</option>
                          <option value="feature">Richiesta Funzionalità</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Priorità</label>
                        <select
                          value={contactForm.priority}
                          onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                        >
                          <option value="low">Bassa</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                          <option value="urgent">Urgente</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Oggetto</label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        placeholder="Descrivi brevemente il problema..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Messaggio</label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
                        placeholder="Descrivi il problema in dettaglio..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Invia Messaggio</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}