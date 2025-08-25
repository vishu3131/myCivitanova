'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient.ts';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react';

interface CityReport {
  id: string;
  created_at: string;
  updated_at: string;
  reporter_id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  photos: string[];
  contact_info: string | null;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  assigned_to: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  // Dati del reporter (join)
  reporter?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

const AdminReportsPage = () => {
  const [reports, setReports] = useState<CityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CityReport | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    urgency: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0
  });

  const categories = {
    infrastructure: { label: 'Infrastrutture', icon: '🚧', color: 'bg-orange-100 text-orange-800' },
    safety: { label: 'Sicurezza', icon: '🛡️', color: 'bg-red-100 text-red-800' },
    environment: { label: 'Ambiente', icon: '🌱', color: 'bg-green-100 text-green-800' },
    transport: { label: 'Trasporti', icon: '🚌', color: 'bg-blue-100 text-blue-800' },
    noise: { label: 'Rumore', icon: '🔊', color: 'bg-purple-100 text-purple-800' },
    other: { label: 'Altro', icon: '📝', color: 'bg-gray-100 text-gray-800' }
  };

  const urgencyConfig = {
    low: { label: 'Bassa', color: 'bg-green-100 text-green-800 border-green-200' },
    medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    high: { label: 'Alta', color: 'bg-red-100 text-red-800 border-red-200' }
  };

  const statusConfig = {
    pending: { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    in_progress: { label: 'In Lavorazione', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
    resolved: { label: 'Risolto', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rifiutato', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
  };

  useEffect(() => {
    loadReports();
    loadStats();
  }, [filters]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('city_reports')
        .select(`
          *,
          reporter:profiles!city_reports_reporter_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      // Applica filtri
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.urgency !== 'all') {
        query = query.eq('urgency', filters.urgency);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Errore caricamento segnalazioni:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('city_reports')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        in_progress: data?.filter(r => r.status === 'in_progress').length || 0,
        resolved: data?.filter(r => r.status === 'resolved').length || 0,
        rejected: data?.filter(r => r.status === 'rejected').length || 0
      };

      setStats(stats);
    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string, notes?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin' // TODO: sostituire con ID admin corrente
      };

      if (notes) {
        updateData.resolution_notes = notes;
      }

      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('city_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      // Ricarica i dati
      loadReports();
      loadStats();
      setSelectedReport(null);

      alert('Stato aggiornato con successo!');
    } catch (error) {
      console.error('Errore aggiornamento stato:', error);
      alert('Errore durante l\'aggiornamento dello stato');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportReports = () => {
    const csvContent = [
      ['ID', 'Data', 'Titolo', 'Categoria', 'Urgenza', 'Stato', 'Reporter', 'Posizione'].join(','),
      ...reports.map(report => [
        report.id,
        formatDate(report.created_at),
        `"${report.title}"`,
        categories[report.category as keyof typeof categories]?.label || report.category,
        urgencyConfig[report.urgency].label,
        statusConfig[report.status].label,
        report.reporter?.full_name || 'N/A',
        `"${report.location || 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `segnalazioni_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-dark-400 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gestione Segnalazioni Cittadine</h1>
          <p className="text-white/60">Monitora e gestisci le segnalazioni dei problemi della città</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-dark-300 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-white/60">Totali</div>
          </div>
          <div className="bg-dark-300 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-white/60">In Attesa</div>
          </div>
          <div className="bg-dark-300 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.in_progress}</div>
            <div className="text-sm text-white/60">In Lavorazione</div>
          </div>
          <div className="bg-dark-300 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
            <div className="text-sm text-white/60">Risolte</div>
          </div>
          <div className="bg-dark-300 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-sm text-white/60">Rifiutate</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-300 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Cerca</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Cerca per titolo, descrizione o posizione..."
                  className="w-full pl-10 pr-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Stato</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">In Attesa</option>
                <option value="in_progress">In Lavorazione</option>
                <option value="resolved">Risolto</option>
                <option value="rejected">Rifiutato</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Categoria</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
              >
                <option value="all">Tutte le categorie</option>
                {Object.entries(categories).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Urgenza</label>
              <select
                value={filters.urgency}
                onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white"
              >
                <option value="all">Tutte le urgenze</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Bassa</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
            <button
              onClick={loadReports}
              className="flex items-center space-x-2 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Aggiorna</span>
            </button>
            
            <button
              onClick={exportReports}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Esporta CSV</span>
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-dark-300 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
              <p className="text-white/60">Caricamento segnalazioni...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-8 h-8 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Nessuna segnalazione trovata</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-400/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Segnalazione</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Reporter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Urgenza</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Stato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {reports.map((report) => {
                    const StatusIcon = statusConfig[report.status].icon;
                    const categoryInfo = categories[report.category as keyof typeof categories];
                    
                    return (
                      <tr key={report.id} className="hover:bg-dark-400/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">{report.title}</div>
                            <div className="text-sm text-white/60 truncate max-w-xs">{report.description}</div>
                            {report.location && (
                              <div className="text-xs text-white/40 flex items-center mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {report.location}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{report.reporter?.full_name || 'N/A'}</div>
                            <div className="text-xs text-white/60">{report.reporter?.email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                            <span className="mr-1">{categoryInfo?.icon}</span>
                            {categoryInfo?.label || report.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${urgencyConfig[report.urgency].color}`}>
                            {urgencyConfig[report.urgency].label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[report.status].color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[report.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">
                          {formatDate(report.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-accent hover:text-accent/80 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-300 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Dettagli Segnalazione</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informazioni principali */}
              <div>
                <h3 className="font-semibold text-white mb-3">Informazioni Segnalazione</h3>
                <div className="bg-dark-400/30 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-white/60">Titolo:</span>
                    <div className="text-white font-medium">{selectedReport.title}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Descrizione:</span>
                    <div className="text-white">{selectedReport.description}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-white/60">Categoria:</span>
                      <div className="text-white">{categories[selectedReport.category as keyof typeof categories]?.label}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Urgenza:</span>
                      <div className="text-white">{urgencyConfig[selectedReport.urgency].label}</div>
                    </div>
                  </div>
                  {selectedReport.location && (
                    <div>
                      <span className="text-white/60">Posizione:</span>
                      <div className="text-white flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {selectedReport.location}
                        {selectedReport.latitude && selectedReport.longitude && (
                          <a
                            href={`https://maps.google.com/?q=${selectedReport.latitude},${selectedReport.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-accent hover:text-accent/80"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informazioni reporter */}
              <div>
                <h3 className="font-semibold text-white mb-3">Informazioni Reporter</h3>
                <div className="bg-dark-400/30 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-white/60">Nome:</span>
                    <div className="text-white">{selectedReport.reporter?.full_name || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-white/60">Email:</span>
                      <div className="text-white">{selectedReport.reporter?.email || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Telefono:</span>
                      <div className="text-white">{selectedReport.reporter?.phone || 'N/A'}</div>
                    </div>
                  </div>
                  {selectedReport.contact_info && (
                    <div>
                      <span className="text-white/60">Contatto preferito:</span>
                      <div className="text-white">{selectedReport.contact_info}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stato e gestione */}
              <div>
                <h3 className="font-semibold text-white mb-3">Gestione Segnalazione</h3>
                <div className="bg-dark-400/30 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-white/60">Stato attuale:</span>
                      <div className="text-white">{statusConfig[selectedReport.status].label}</div>
                    </div>
                    <div>
                      <span className="text-white/60">Data creazione:</span>
                      <div className="text-white">{formatDate(selectedReport.created_at)}</div>
                    </div>
                  </div>
                  
                  {selectedReport.reviewed_at && (
                    <div>
                      <span className="text-white/60">Ultima revisione:</span>
                      <div className="text-white">{formatDate(selectedReport.reviewed_at)}</div>
                    </div>
                  )}
                  
                  {selectedReport.resolution_notes && (
                    <div>
                      <span className="text-white/60">Note di risoluzione:</span>
                      <div className="text-white">{selectedReport.resolution_notes}</div>
                    </div>
                  )}

                  {/* Azioni rapide */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                    {selectedReport.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateReportStatus(selectedReport.id, 'in_progress')}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        >
                          Prendi in carico
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Note di rifiuto (opzionale):');
                            updateReportStatus(selectedReport.id, 'rejected', notes || undefined);
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          Rifiuta
                        </button>
                      </>
                    )}
                    
                    {selectedReport.status === 'in_progress' && (
                      <button
                        onClick={() => {
                          const notes = prompt('Note di risoluzione (opzionale):');
                          updateReportStatus(selectedReport.id, 'resolved', notes || undefined);
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                      >
                        Segna come risolto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;