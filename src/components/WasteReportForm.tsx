import React, { useState } from 'react';
import { AlertCircle, Camera, MapPin, FileText, Trash2, X, Loader2 } from 'lucide-react';

export interface WasteReportData {
  issueType: string;
  description: string;
  location: string;
  photo?: File | null;
  reporterEmail?: string;
  reporterPhone?: string;
}

interface WasteReportFormProps {
  onClose: () => void;
  onSubmit: (data: WasteReportData) => Promise<void>;
}

const WasteReportForm: React.FC<WasteReportFormProps> = ({ onClose, onSubmit }) => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!issueType.trim()) {
      newErrors.issueType = 'Seleziona un tipo di problema';
    }

    if (!description.trim()) {
      newErrors.description = 'La descrizione è obbligatoria';
    } else if (description.trim().length < 10) {
      newErrors.description = 'La descrizione deve essere di almeno 10 caratteri';
    }

    if (!location.trim()) {
      newErrors.location = 'La posizione è obbligatoria';
    }

    if (reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail)) {
      newErrors.reporterEmail = 'Inserisci un indirizzo email valido';
    }

    if (reporterPhone && !/^[\d\s\+\-\(\)]{8,}$/.test(reporterPhone)) {
      newErrors.reporterPhone = 'Inserisci un numero di telefono valido';
    }

    if (photo && photo.size > 5 * 1024 * 1024) {
      newErrors.photo = 'La foto non può superare i 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ 
        issueType, 
        description, 
        location, 
        photo,
        reporterEmail: reporterEmail || undefined,
        reporterPhone: reporterPhone || undefined
      });
      onClose();
    } catch (error) {
      console.error('Errore durante l\'invio:', error);
      setErrors({ submit: 'Errore durante l\'invio della segnalazione. Riprova.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setErrors(prev => ({ ...prev, photo: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[99999]">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Trash2 className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">Segnala Problema Rifiuti</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-red-300 text-sm">{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo di Problema */}
          <div>
            <label htmlFor="issueType" className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span>Tipo di Problema *</span>
            </label>
            <select
              id="issueType"
              value={issueType}
              onChange={(e) => {
                setIssueType(e.target.value);
                setErrors(prev => ({ ...prev, issueType: '' }));
              }}
              className={`w-full p-3 border rounded-lg shadow-sm bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.issueType ? 'border-red-500' : 'border-gray-600'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Seleziona un tipo</option>
              <option value="Abbandono">Abbandono di rifiuti</option>
              <option value="Mancata Raccolta">Mancata raccolta</option>
              <option value="Contenitore Danneggiato">Contenitore danneggiato</option>
              <option value="Altro">Altro</option>
            </select>
            {errors.issueType && (
              <p className="mt-1 text-sm text-red-400">{errors.issueType}</p>
            )}
          </div>

          {/* Descrizione */}
          <div>
            <label htmlFor="description" className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <FileText className="h-4 w-4" />
              <span>Descrizione *</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors(prev => ({ ...prev, description: '' }));
              }}
              rows={4}
              className={`w-full p-3 border rounded-lg shadow-sm bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Descrivi il problema in dettaglio (minimo 10 caratteri)..."
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-1">
              {errors.description && (
                <p className="text-sm text-red-400">{errors.description}</p>
              )}
              <p className="text-xs text-gray-400 ml-auto">{description.length}/500</p>
            </div>
          </div>

          {/* Posizione */}
          <div>
            <label htmlFor="location" className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <MapPin className="h-4 w-4" />
              <span>Posizione *</span>
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setErrors(prev => ({ ...prev, location: '' }));
              }}
              className={`w-full p-3 border rounded-lg shadow-sm bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.location ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Es: Via Roma, 10 - Civitanova Marche"
              disabled={isSubmitting}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-400">{errors.location}</p>
            )}
          </div>

          {/* Contatti Opzionali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reporterEmail" className="block text-sm font-medium text-gray-300 mb-2">
                Email (opzionale)
              </label>
              <input
                type="email"
                id="reporterEmail"
                value={reporterEmail}
                onChange={(e) => {
                  setReporterEmail(e.target.value);
                  setErrors(prev => ({ ...prev, reporterEmail: '' }));
                }}
                className={`w-full p-3 border rounded-lg shadow-sm bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.reporterEmail ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="tua@email.com"
                disabled={isSubmitting}
              />
              {errors.reporterEmail && (
                <p className="mt-1 text-sm text-red-400">{errors.reporterEmail}</p>
              )}
            </div>
            <div>
              <label htmlFor="reporterPhone" className="block text-sm font-medium text-gray-300 mb-2">
                Telefono (opzionale)
              </label>
              <input
                type="tel"
                id="reporterPhone"
                value={reporterPhone}
                onChange={(e) => {
                  setReporterPhone(e.target.value);
                  setErrors(prev => ({ ...prev, reporterPhone: '' }));
                }}
                className={`w-full p-3 border rounded-lg shadow-sm bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.reporterPhone ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="+39 123 456 7890"
                disabled={isSubmitting}
              />
              {errors.reporterPhone && (
                <p className="mt-1 text-sm text-red-400">{errors.reporterPhone}</p>
              )}
            </div>
          </div>

          {/* Upload Foto */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <Camera className="h-4 w-4" />
              <span>Allega Foto (opzionale)</span>
            </label>
            {!photo ? (
              <div className="relative">
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPhoto(file);
                    setErrors(prev => ({ ...prev, photo: '' }));
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isSubmitting}
                />
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  errors.photo ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                }`}>
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Clicca per selezionare una foto</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG fino a 5MB</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center space-x-3">
                  <Camera className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-white">{photo.name}</p>
                    <p className="text-xs text-gray-400">{(photo.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {errors.photo && (
              <p className="mt-1 text-sm text-red-400">{errors.photo}</p>
            )}
          </div>

          {/* Pulsanti */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Invio...</span>
                </>
              ) : (
                <span>Invia Segnalazione</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WasteReportForm;