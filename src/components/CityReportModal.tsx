'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Camera, 
  MapPin, 
  AlertTriangle,
  Upload,
  CheckCircle,
  Loader2,
  Phone,
  Mail
} from 'lucide-react';

interface CityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (report: any) => void;
}

interface ReportFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  photos: File[];
  contact_info: string;
  latitude?: number;
  longitude?: number;
}

const CityReportModal = ({ isOpen, onClose, onSubmit }: CityReportModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState<ReportFormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    urgency: 'medium',
    photos: [],
    contact_info: ''
  });

  const categories = [
    { id: 'infrastructure', label: 'Infrastrutture', icon: '🚧', description: 'Strade, marciapiedi, illuminazione' },
    { id: 'safety', label: 'Sicurezza', icon: '🛡️', description: 'Situazioni pericolose, vandalismo' },
    { id: 'environment', label: 'Ambiente', icon: '🌱', description: 'Rifiuti, inquinamento, verde pubblico' },
    { id: 'transport', label: 'Trasporti', icon: '🚌', description: 'Trasporto pubblico, parcheggi' },
    { id: 'noise', label: 'Rumore', icon: '🔊', description: 'Inquinamento acustico' },
    { id: 'other', label: 'Altro', icon: '📝', description: 'Altri problemi della città' }
  ];

  const urgencyLevels = [
    { id: 'low', label: 'Bassa', color: 'bg-green-100 text-green-800 border-green-200', description: 'Non urgente' },
    { id: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', description: 'Richiede attenzione' },
    { id: 'high', label: 'Alta', color: 'bg-red-100 text-red-800 border-red-200', description: 'Urgente' }
  ];

  useEffect(() => {
    if (isOpen) {
      // Carica i dati dell'utente corrente
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        // Pre-compila le informazioni di contatto se disponibili
        if (user.email || user.phone) {
          setFormData(prev => ({
            ...prev,
            contact_info: user.email || user.phone || ''
          }));
        }
      }
      
      // Prova a ottenere la posizione corrente
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData(prev => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }));
          },
          (error) => {
            console.log('Geolocalizzazione non disponibile:', error);
          }
        );
      }
    }
  }, [isOpen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.photos.length > 5) {
      alert('Puoi caricare massimo 5 foto');
      return;
    }
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      alert('Devi essere loggato per inviare una segnalazione');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    setLoading(true);
    
    try {
      // Prepara i dati per l'inserimento
      const reportData = {
        reporter_id: currentUser.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        urgency: formData.urgency,
        location: formData.location.trim() || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        contact_info: formData.contact_info.trim() || null,
        photos: [], // Per ora array vuoto, implementeremo l'upload foto dopo
        status: 'pending'
      };

      // Inserisci la segnalazione nel database
      const { data, error } = await supabase
        .from('city_reports')
        .insert([reportData])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      // Aggiungi XP per la segnalazione
      try {
        await supabase.rpc('add_xp_simple', {
          p_user_id: currentUser.id,
          p_activity_type: 'submit_city_report',
          p_xp_amount: 25,
          p_metadata: {
            category: formData.category,
            urgency: formData.urgency,
            report_id: data.id,
            timestamp: new Date().toISOString()
          }
        });
      } catch (xpError) {
        console.log('Sistema XP non ancora attivo:', xpError);
      }

      // Callback opzionale
      if (onSubmit) {
        onSubmit(data);
      }

      // Reset form e chiudi modal
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        urgency: 'medium',
        photos: [],
        contact_info: currentUser.email || currentUser.phone || ''
      });
      setStep(1);
      onClose();
      
      // Mostra messaggio di successo
      alert('Segnalazione inviata con successo! Riceverai aggiornamenti sullo stato.');
      
    } catch (error) {
      console.error('Errore invio segnalazione:', error);
      alert('Errore durante l\'invio della segnalazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.title.trim() || !formData.description.trim())) {
      alert('Compila titolo e descrizione per continuare');
      return;
    }
    if (step === 2 && !formData.category) {
      alert('Seleziona una categoria per continuare');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-dark-300 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Segnala un Problema</h2>
              <p className="text-sm text-white/60">Passo {step} di 4</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i <= step ? 'bg-accent' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Titolo e Descrizione */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Titolo della segnalazione *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Es. Buca pericolosa in Corso Umberto I"
                  className="w-full px-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white/40"
                  maxLength={100}
                />
                <p className="text-xs text-white/40 mt-1">{formData.title.length}/100 caratteri</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Descrizione dettagliata *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrivi il problema in dettaglio: dove si trova, quando l'hai notato, quanto è grave..."
                  rows={4}
                  className="w-full px-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white/40"
                  maxLength={500}
                />
                <p className="text-xs text-white/40 mt-1">{formData.description.length}/500 caratteri</p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Categoria */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Categoria del problema *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.category === category.id
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-white/10 bg-dark-400/30 text-white/80 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-sm text-white/60">{category.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Urgenza e Posizione */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Livello di urgenza *
                </label>
                <div className="space-y-2">
                  {urgencyLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setFormData(prev => ({ ...prev, urgency: level.id as any }))}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        formData.urgency === level.id
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-white/10 bg-dark-400/30 text-white/80 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-white/60">{level.description}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${level.color}`}>
                          {level.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Posizione (opzionale)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Es. Corso Umberto I, 123 - Civitanova Marche"
                  className="w-full px-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white/40"
                />
                {formData.latitude && formData.longitude && (
                  <p className="text-xs text-green-400 mt-1">
                    ✓ Posizione GPS rilevata automaticamente
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Contatti e Conferma */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Contatto per aggiornamenti (opzionale)
                </label>
                <input
                  type="text"
                  value={formData.contact_info}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                  placeholder="Email o telefono per ricevere aggiornamenti"
                  className="w-full px-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white/40"
                />
              </div>

              {/* Riepilogo */}
              <div className="bg-dark-400/30 rounded-lg p-4">
                <h3 className="font-medium text-white mb-3">Riepilogo segnalazione:</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-white/60">Titolo:</span> <span className="text-white">{formData.title}</span></div>
                  <div><span className="text-white/60">Categoria:</span> <span className="text-white">{categories.find(c => c.id === formData.category)?.label}</span></div>
                  <div><span className="text-white/60">Urgenza:</span> <span className="text-white">{urgencyLevels.find(u => u.id === formData.urgency)?.label}</span></div>
                  {formData.location && (
                    <div><span className="text-white/60">Posizione:</span> <span className="text-white">{formData.location}</span></div>
                  )}
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  La tua segnalazione sarà inviata agli uffici competenti di MyCivitanova. Riceverai aggiornamenti sullo stato di avanzamento.
                </p>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
            <button
              onClick={step === 1 ? onClose : prevStep}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              {step === 1 ? 'Annulla' : 'Indietro'}
            </button>
            
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors"
              >
                Avanti
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Invio...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Invia Segnalazione</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CityReportModal;