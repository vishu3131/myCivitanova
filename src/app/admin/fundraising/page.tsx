'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import FundraisingManagement from '@/components/admin/FundraisingManagement';
import { Heart, Plus, TrendingUp, Users, Euro, Clock } from 'lucide-react';

export default function FundraisingAdminPage() {
  const [showManagement, setShowManagement] = useState(false);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Gestione Raccolta Fondi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestisci campagne di raccolta fondi, approva nuove proposte e monitora le donazioni
            </p>
          </div>
          <button
            onClick={() => setShowManagement(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Gestisci Campagne
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Campagne Totali</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">+2 questa settimana</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Attesa di Approvazione</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Richiede attenzione</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Totale Raccolto</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">€15,420</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Euro className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">+€1,200 questa settimana</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Donatori Attivi</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">89</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">+7 nuovi donatori</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attività Recente</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Nuova campagna "Parco Giochi Inclusivo" creata da Mario Rossi
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 ore fa</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs font-medium rounded-full">
                  In attesa
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Euro className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Donazione di €50 ricevuta per "Biblioteca Digitale"
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">4 ore fa</p>
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                  Completata
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Campagna "Pulizia Spiagge" ha raggiunto il 75% dell'obiettivo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">1 giorno fa</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                  Attiva
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Azioni Rapide</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowManagement(true)}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
              >
                <div className="text-center">
                  <Heart className="w-8 h-8 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Gestisci Campagne</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Approva, rifiuta e modifica campagne</p>
                </div>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors group">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-green-500 dark:group-hover:text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Visualizza Report</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Statistiche dettagliate e analytics</p>
                </div>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors group">
                <div className="text-center">
                  <Users className="w-8 h-8 text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Gestisci Donatori</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Visualizza e contatta i donatori</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fundraising Management Modal */}
      <FundraisingManagement
        isOpen={showManagement}
        onClose={() => setShowManagement(false)}
      />
    </AdminLayout>
  );
}