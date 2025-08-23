'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Camera, 
  MapPin, 
  AlertTriangle,
  Upload,
  CheckCircle
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: any) => void;
}

const ReportModal = ({ isOpen, onClose, onSubmit }: ReportModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    urgency: 'medium',
    photos: [] as File[],
    contactInfo: ''
  });

  const categories = [
    { id: 'infrastructure', label: 'Infrastrutture', icon: '🚧' },
    { id: 'safety', label: 'Sicurezza', icon: '🛡️' },
    { id: 'environment', label: 'Ambiente', icon: '🌱' },
    { id: 'transport', label: 'Trasporti', icon: '🚌' },
    { id: 'noise', label: 'Rumore', icon: '🔊' },
    { id: 'other', label: 'Altro', icon: '📝' }
  ];

  const urgencyLevels = [
    { id: 'low', label: 'Bassa', color: 'bg-green-100 text-green-800' },
    { id: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'high', label: 'Alta', color: 'bg-red-100 text-red-800' }
  ];

  const handleSubmit = async () => {
    try {
      // Invia la segnalazione
      onSubmit(formData);
      
      // Aggiungi XP per la segnalazione
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        
        try {
          // Prova ad aggiungere XP con il sistema semplificato
          await supabase.rpc('add_xp_simple', {
            p_user_id: user.id,
            p_activity_type: 'submit_report',
            p_xp_amount: 25,
            p_metadata: {
              category: formData.category,
              urgency: formData.urgency,
              timestamp: new Date().toISOString()
            }
          });
          
          // Mostra notifica XP
          showXPNotification(25);
        } catch (xpError) {
          console.log('Sistema XP non ancora attivo:', xpError instanceof Error ? xpError.message : xpError);
        }
      }
      
      // Reset form
      setStep(1);
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        urgency: 'medium',
        photos: [],
        contactInfo: ''
      });
      onClose();
    } catch (error) {
      console.error('Errore invio segnalazione:', error);
    }
  };

  const showXPNotification = (xp: number) => {
    // Crea notifica temporanea
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-accent text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
    notification.textContent = `+${xp} XP per la segnalazione!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-dark-300/90 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-semibold text-white">Segnala un Problema</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center p-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber 
                        ? 'bg-accent text-dark-400' 
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        step > stepNumber ? 'bg-accent' : 'bg-white/10'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Informazioni Base</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Titolo della Segnalazione
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Es. Buca pericolosa in Corso Umberto I"
                      className="w-full px-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Descrizione
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrivi il problema in dettaglio..."
                      rows={4}
                      className="w-full px-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Categoria
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            formData.category === category.id
                              ? 'border-accent bg-accent/20'
                              : 'border-white/10 hover:border-white/20 bg-dark-400/50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{category.icon}</span>
                            <span className="text-sm text-white">{category.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.title || !formData.description || !formData.category}
                    className="bg-accent text-dark-400 px-6 py-2 rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Avanti
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location and Urgency */}
            {step === 2 && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Posizione e Urgenza</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Indirizzo
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Es. Corso Umberto I, 45 - Civitanova Marche"
                        className="w-full pl-10 pr-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Livello di Urgenza
                    </label>
                    <div className="space-y-2">
                      {urgencyLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setFormData(prev => ({ ...prev, urgency: level.id }))}
                          className={`w-full p-3 rounded-lg border text-left transition-colors ${
                            formData.urgency === level.id
                              ? 'border-accent bg-accent/20'
                              : 'border-white/10 hover:border-white/20 bg-dark-400/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white">{level.label}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              level.id === 'low' ? 'bg-green-500/20 text-green-400' : 
                              level.id === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {level.id === 'low' ? 'Bassa' : level.id === 'medium' ? 'Media' : 'Alta'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-white/10 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  >
                    Indietro
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.location}
                    className="bg-accent text-dark-400 px-6 py-2 rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Avanti
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Photos and Contact */}
            {step === 3 && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Foto e Contatti</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Foto (opzionale)
                    </label>
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center bg-dark-400/30">
                      <Camera className="w-8 h-8 text-white/40 mx-auto mb-2" />
                      <p className="text-sm text-white/60 mb-2">
                        Aggiungi foto per aiutare a identificare il problema
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="bg-accent text-dark-400 px-4 py-2 rounded-lg hover:bg-accent/90 cursor-pointer font-medium"
                      >
                        Carica Foto
                      </label>
                    </div>
                    {formData.photos.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-white/60 mb-2">
                          Foto caricate: {formData.photos.length}
                        </p>
                        <div className="flex space-x-2">
                          {formData.photos.map((photo, index) => (
                            <div key={index} className="w-16 h-16 bg-dark-400/50 rounded-lg flex items-center justify-center border border-white/10">
                              <Upload className="w-6 h-6 text-white/40" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Contatti (opzionale)
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                      placeholder="Email o telefono per aggiornamenti"
                      className="w-full px-3 py-2 bg-dark-400/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-white/40"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-white/10 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  >
                    Indietro
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-accent text-dark-400 px-6 py-2 rounded-lg hover:bg-accent/90 flex items-center space-x-2 font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Invia Segnalazione</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;