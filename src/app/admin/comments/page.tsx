"use client";

import React, { useState } from 'react';
import AppLayout from "@/components/admin/AppLayout";
import { useAuthWithRole } from "@/hooks/useAuthWithRole";
import { Shield, MessageSquare, Check, X, Eye, Flag, Search, Filter } from 'lucide-react';

export default function CommentsPage() {
  const { user, role, loading } = useAuthWithRole();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'reported'>('pending');

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Caricamento...</span>
        </div>
      </AppLayout>
    );
  }

  if (!user || !['admin', 'moderator'].includes(role)) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Accesso Negato</h2>
          <p className="text-gray-400">Non hai i permessi per accedere a questa sezione</p>
        </div>
      </AppLayout>
    );
  }

  // Mock comments data
  const mockComments = {
    pending: [
      {
        id: 1,
        author: "Mario Rossi",
        content: "Ottima iniziativa! Spero che l'evento si svolga come previsto.",
        article: "Festa del Paese 2024",
        date: "2024-03-15 14:30",
        avatar: "MR"
      },
      {
        id: 2,
        author: "Giulia Bianchi",
        content: "Quando inizieranno i lavori di ristrutturazione della piazza?",
        article: "Lavori Pubblici - Aggiornamenti",
        date: "2024-03-15 12:15",
        avatar: "GB"
      }
    ],
    approved: [
      {
        id: 3,
        author: "Luca Verdi",
        content: "Grazie per l'informazione, molto utile!",
        article: "Orari Uffici Comunali",
        date: "2024-03-14 16:45",
        avatar: "LV"
      }
    ],
    rejected: [
      {
        id: 4,
        author: "Utente Anonimo",
        content: "Contenuto inappropriato rimosso",
        article: "News Generale",
        date: "2024-03-14 10:20",
        avatar: "UA"
      }
    ],
    reported: [
      {
        id: 5,
        author: "Franco Neri",
        content: "Questo commento è stato segnalato per linguaggio inappropriato",
        article: "Discussione Pubblica",
        date: "2024-03-13 18:30",
        avatar: "FN",
        reports: 3
      }
    ]
  };

  const tabs = [
    { id: 'pending', label: 'In Attesa', count: mockComments.pending.length, color: 'yellow' },
    { id: 'approved', label: 'Approvati', count: mockComments.approved.length, color: 'green' },
    { id: 'rejected', label: 'Rifiutati', count: mockComments.rejected.length, color: 'red' },
    { id: 'reported', label: 'Segnalati', count: mockComments.reported.length, color: 'orange' }
  ];

  const getTabColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      yellow: isActive ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' : 'text-yellow-400 hover:bg-yellow-500/10',
      green: isActive ? 'bg-green-500/20 text-green-400 border-green-500' : 'text-green-400 hover:bg-green-500/10',
      red: isActive ? 'bg-red-500/20 text-red-400 border-red-500' : 'text-red-400 hover:bg-red-500/10',
      orange: isActive ? 'bg-orange-500/20 text-orange-400 border-orange-500' : 'text-orange-400 hover:bg-orange-500/10'
    };
    return colors[color as keyof typeof colors];
  };

  const currentComments = mockComments[activeTab];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Moderazione Commenti</h1>
            <p className="text-gray-400">Gestisci e modera i commenti degli utenti</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? `border ${getTabColorClasses(tab.color, true)}`
                  : getTabColorClasses(tab.color, false)
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-current/20' : 'bg-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca commenti..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            Filtri
          </button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {currentComments.length > 0 ? (
            currentComments.map((comment) => (
              <div key={comment.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {comment.avatar}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{comment.author}</h3>
                      <span className="text-gray-400 text-sm">•</span>
                      <span className="text-gray-400 text-sm">{comment.date}</span>
                      {'reports' in comment && (
                        <>
                          <span className="text-gray-400 text-sm">•</span>
                          <span className="text-orange-400 text-sm flex items-center gap-1">
                            <Flag className="w-3 h-3" />
                            {comment.reports} segnalazioni
                          </span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-gray-300 mb-3">{comment.content}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                      <MessageSquare className="w-4 h-4" />
                      <span>Articolo: {comment.article}</span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {activeTab === 'pending' && (
                        <>
                          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                            <Check className="w-4 h-4" />
                            Approva
                          </button>
                          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                            <X className="w-4 h-4" />
                            Rifiuta
                          </button>
                        </>
                      )}
                      
                      {activeTab === 'reported' && (
                        <>
                          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                            <Check className="w-4 h-4" />
                            Mantieni
                          </button>
                          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                            <X className="w-4 h-4" />
                            Rimuovi
                          </button>
                        </>
                      )}
                      
                      <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        <Eye className="w-4 h-4" />
                        Visualizza Articolo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nessun Commento</h3>
              <p className="text-gray-400">
                Non ci sono commenti {activeTab === 'pending' ? 'in attesa di moderazione' : 
                activeTab === 'approved' ? 'approvati' : 
                activeTab === 'rejected' ? 'rifiutati' : 'segnalati'}.
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {mockComments.pending.length}
            </div>
            <div className="text-sm text-gray-400">In Attesa</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {mockComments.approved.length}
            </div>
            <div className="text-sm text-gray-400">Approvati</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {mockComments.rejected.length}
            </div>
            <div className="text-sm text-gray-400">Rifiutati</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {mockComments.reported.length}
            </div>
            <div className="text-sm text-gray-400">Segnalati</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}