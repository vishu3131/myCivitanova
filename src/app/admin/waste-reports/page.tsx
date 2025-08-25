'use client';

import { useState, useEffect } from 'react';
import { firebaseClient } from '@/utils/firebaseAuth';
import { 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Image as ImageIcon,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

interface WasteReport {
  id: string;
  issue_type: string;
  description: string;
  location: string;
  photo_url?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  reporter_id?: string;
  reporter_email?: string;
  reporter_phone?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

const statusConfig = {
  pending: { label: 'In Attesa', color: 'bg-yellow-500', icon: Clock },
  in_progress: { label: 'In Lavorazione', color: 'bg-blue-500', icon: RefreshCw },
  resolved: { label: 'Risolto', color: 'bg-green-500', icon: CheckCircle },
  rejected: { label: 'Rifiutato', color: 'bg-red-500', icon: XCircle }
};

const priorityConfig = {
  low: { label: 'Bassa', color: 'text-green-400' },
  medium: { label: 'Media', color: 'text-yellow-400' },
  high: { label: 'Alta', color: 'text-red-400' }
};

export default function WasteReportsPage() {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, skipping reports fetch');
        setReports([]);
        return;
      }
      
      let query = supabase
        .from('waste_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,issue_type.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Errore nel caricamento delle segnalazioni:', error);
        return;
      }

      setReports(data || []);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string, notes?: string) => {
    try {
      setUpdatingStatus(true);
      
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, cannot update report status');
        alert('Database non configurato. Impossibile aggiornare lo stato.');
        return;
      }
      
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.admin_notes = notes;
      }

      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('waste_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) {
        console.error('Errore aggiornamento stato:', error);
        alert('Errore durante l\'aggiornamento dello stato');
        return;
      }

      // Aggiorna la lista
      await fetchReports();
      
      // Chiudi il modal se aperto
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }

      alert('Stato aggiornato con successo!');
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'aggiornamento');
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, priorityFilter, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT');
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trash2 className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Segnalazioni Rifiuti</h1>
            <p className="text-gray-400">Gestisci le segnalazioni dei cittadini</p>
          </div>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Aggiorna</span>
        </button>
      </div>

      {/* Filtri */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center space-x-2 text-white font-medium">
          <Filter className="h-4 w-4" />
          <span>Filtri</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ricerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per descrizione, posizione o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro Stato */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">In Attesa</option>
            <option value="in_progress">In Lavorazione</option>
            <option value="resolved">Risolto</option>
            <option value="rejected">Rifiutato</option>
          </select>

          {/* Filtro Priorità */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tutte le priorità</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Bassa</option>
          </select>
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = reports.filter(r => r.status === status).length;
          const Icon = config.icon;
          return (
            <div key={status} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{config.label}</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista Segnalazioni */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Caricamento segnalazioni...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <Trash2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Nessuna segnalazione trovata</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Segnalazione</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Priorità</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">{report.issue_type}</p>
                          <p className="text-sm text-gray-400 truncate">{report.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <p className="text-xs text-gray-500">{report.location}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${statusConfig[report.status].color}`}>
                          {getStatusIcon(report.status)}
                        </div>
                        <span className="text-sm text-white">{statusConfig[report.status].label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${priorityConfig[report.priority].color}`}>
                        {priorityConfig[report.priority].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-400">{formatDate(report.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Dettagli</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dettagli */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Dettagli Segnalazione</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informazioni Principali */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tipo Problema</label>
                  <p className="text-white bg-gray-700 p-2 rounded">{selectedReport.issue_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Stato</label>
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded-full ${statusConfig[selectedReport.status].color}`}>
                      {getStatusIcon(selectedReport.status)}
                    </div>
                    <span className="text-white">{statusConfig[selectedReport.status].label}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descrizione</label>
                <p className="text-white bg-gray-700 p-3 rounded">{selectedReport.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Posizione</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-white">{selectedReport.location}</p>
                </div>
              </div>

              {/* Contatti */}
              {(selectedReport.reporter_email || selectedReport.reporter_phone) && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contatti Segnalatore</label>
                  <div className="space-y-2">
                    {selectedReport.reporter_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-white">{selectedReport.reporter_email}</p>
                      </div>
                    )}
                    {selectedReport.reporter_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-white">{selectedReport.reporter_phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Foto */}
              {selectedReport.photo_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Foto Allegata</label>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <img 
                      src={selectedReport.photo_url} 
                      alt="Foto segnalazione" 
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Note Admin */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Note Amministratore</label>
                <textarea
                  value={adminNotes || selectedReport.admin_notes || ''}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Aggiungi note per questa segnalazione..."
                />
              </div>

              {/* Azioni */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
                {selectedReport.status !== 'in_progress' && (
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'in_progress', adminNotes)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={updatingStatus}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Prendi in Carico</span>
                  </button>
                )}
                {selectedReport.status !== 'resolved' && (
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'resolved', adminNotes)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={updatingStatus}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Risolvi</span>
                  </button>
                )}
                {selectedReport.status !== 'rejected' && (
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'rejected', adminNotes)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    disabled={updatingStatus}
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Rifiuta</span>
                  </button>
                )}
              </div>

              {/* Info Temporali */}
              <div className="text-xs text-gray-400 space-y-1 pt-4 border-t border-gray-700">
                <p>Creata: {formatDate(selectedReport.created_at)}</p>
                <p>Aggiornata: {formatDate(selectedReport.updated_at)}</p>
                {selectedReport.resolved_at && (
                  <p>Risolta: {formatDate(selectedReport.resolved_at)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}