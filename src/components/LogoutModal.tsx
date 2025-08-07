"use client";

import React, { useState } from 'react';
import { X, LogOut, AlertTriangle, Download, Trash2 } from 'lucide-react';
import { StorageUtils } from '@/utils/profileStorage';

interface LogoutModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function LogoutModal({ user, isOpen, onClose, onLogout }: LogoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [clearingData, setClearingData] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setLoading(true);
    
    // Simula logout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Rimuovi dati di sessione ma mantieni i dati del profilo
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    
    onLogout();
    setLoading(false);
  };

  const handleExportData = async () => {
    try {
      setExportingData(true);
      
      const userData = await StorageUtils.exportUserData(user.id);
      
      // Crea e scarica il file JSON
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `mycivitanova_data_${user.id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Errore nell\'esportazione dei dati:', error);
    } finally {
      setExportingData(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Sei sicuro di voler eliminare tutti i tuoi dati? Questa operazione è irreversibile.')) {
      return;
    }

    try {
      setClearingData(true);
      
      // Elimina tutti i dati dell'utente
      StorageUtils.clearUserData(user.id);
      
      // Logout immediato
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
      
      onLogout();
      
    } catch (error) {
      console.error('Errore nell\'eliminazione dei dati:', error);
    } finally {
      setClearingData(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <LogOut className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Logout</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avviso */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-400 font-medium mb-1">Prima di uscire</h3>
                <p className="text-gray-300 text-sm">
                  I tuoi dati rimarranno salvati localmente. Puoi esportarli o eliminarli definitivamente.
                </p>
              </div>
            </div>
          </div>

          {/* Opzioni dati */}
          <div className="space-y-3">
            <h3 className="text-white font-medium">Gestione Dati</h3>
            
            <button
              onClick={handleExportData}
              disabled={exportingData}
              className="w-full flex items-center justify-between p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-blue-400 font-medium">Esporta i miei dati</p>
                  <p className="text-gray-400 text-xs">Scarica tutti i tuoi dati in formato JSON</p>
                </div>
              </div>
              {exportingData && (
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
            </button>

            <button
              onClick={handleClearData}
              disabled={clearingData}
              className="w-full flex items-center justify-between p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-red-400" />
                <div className="text-left">
                  <p className="text-red-400 font-medium">Elimina tutti i dati</p>
                  <p className="text-gray-400 text-xs">Rimuovi definitivamente tutti i tuoi dati</p>
                </div>
              </div>
              {clearingData && (
                <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          </div>

          {/* Azioni logout */}
          <div className="flex space-x-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  <span>Esci</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}