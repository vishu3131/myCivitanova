'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  X,
  Upload,
  Calendar,
  Euro,
  Target,
  FileText,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { FundraisingAPI } from '@/lib/fundraisingApi';

interface CreateCampaignFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentUser?: any;
}

interface FormData {
  title: string;
  short_description: string;
  description: string;
  goal_amount: number;
  category: 'community' | 'environment' | 'culture' | 'sport' | 'education' | 'health' | 'infrastructure' | 'other';
  start_date: string;
  end_date: string;
  image_url?: string;
}

interface FormErrors {
  [key: string]: string;
}

export function CreateCampaignForm({ isOpen, onClose, onSuccess, currentUser }: CreateCampaignFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    short_description: '',
    description: '',
    goal_amount: 0,
    category: 'community',
    start_date: '',
    end_date: '',
    image_url: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const categories = [
    { value: 'community', label: 'Comunità', icon: Users, description: 'Progetti per la comunità locale' },
    { value: 'environment', label: 'Ambiente', icon: Target, description: 'Sostenibilità e tutela ambientale' },
    { value: 'culture', label: 'Cultura', icon: FileText, description: 'Arte, cultura e tradizioni' },
    { value: 'sport', label: 'Sport', icon: Target, description: 'Attività sportive e ricreative' },
    { value: 'education', label: 'Educazione', icon: Users, description: 'Formazione e istruzione' },
    { value: 'health', label: 'Salute', icon: Heart, description: 'Benessere e assistenza sanitaria' },
    { value: 'infrastructure', label: 'Infrastrutture', icon: Target, description: 'Miglioramenti urbani e infrastrutturali' },
    { value: 'other', label: 'Altro', icon: FileText, description: 'Altri progetti di interesse pubblico' }
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Il titolo deve essere di almeno 10 caratteri';
    }

    if (!formData.short_description.trim()) {
      newErrors.short_description = 'La descrizione breve è obbligatoria';
    } else if (formData.short_description.length < 20) {
      newErrors.short_description = 'La descrizione breve deve essere di almeno 20 caratteri';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descrizione completa è obbligatoria';
    } else if (formData.description.length < 100) {
      newErrors.description = 'La descrizione completa deve essere di almeno 100 caratteri';
    }

    if (!formData.goal_amount || formData.goal_amount <= 0) {
      newErrors.goal_amount = 'L\'obiettivo di raccolta deve essere maggiore di 0';
    } else if (formData.goal_amount < 100) {
      newErrors.goal_amount = 'L\'obiettivo minimo è di €100';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'La data di inizio è obbligatoria';
    } else {
      const startDate = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        newErrors.start_date = 'La data di inizio non può essere nel passato';
      }
    }

    if (!formData.end_date) {
      newErrors.end_date = 'La data di fine è obbligatoria';
    } else if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        newErrors.end_date = 'La data di fine deve essere successiva alla data di inizio';
      }
      
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        newErrors.end_date = 'La campagna deve durare almeno 7 giorni';
      }
      if (diffDays > 365) {
        newErrors.end_date = 'La campagna non può durare più di 1 anno';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!currentUser?.id) {
      setErrors({ general: 'Devi essere loggato per creare una campagna' });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      await FundraisingAPI.createCampaign({
        ...formData,
        creator_id: currentUser.id
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 2000);
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      setErrors({ general: error.message || 'Errore durante la creazione della campagna' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      short_description: '',
      description: '',
      goal_amount: 0,
      category: 'community',
      start_date: '',
      end_date: '',
      image_url: ''
    });
    setErrors({});
    setSuccess(false);
    setStep(1);
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate basic info
      const basicErrors: FormErrors = {};
      if (!formData.title.trim()) basicErrors.title = 'Il titolo è obbligatorio';
      if (!formData.short_description.trim()) basicErrors.short_description = 'La descrizione breve è obbligatoria';
      if (!formData.category) basicErrors.category = 'La categoria è obbligatoria';
      
      if (Object.keys(basicErrors).length > 0) {
        setErrors(basicErrors);
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {success ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Campagna Creata con Successo!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                La tua campagna è stata inviata per la revisione. Riceverai una notifica quando sarà approvata.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Heart className="w-6 h-6 text-red-500" />
                    Crea Nuova Campagna
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Passo {step} di 3 - {step === 1 ? 'Informazioni Base' : step === 2 ? 'Dettagli' : 'Obiettivi e Date'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progresso</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{Math.round((step / 3) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6">
                  {/* Step 1: Basic Information */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Titolo della Campagna *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Es: Nuovo Parco Giochi per il Centro di Civitanova Marche"
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                            errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          maxLength={100}
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.title}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formData.title.length}/100 caratteri
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Descrizione Breve *
                        </label>
                        <textarea
                          value={formData.short_description}
                          onChange={(e) => handleInputChange('short_description', e.target.value)}
                          placeholder="Una breve descrizione che catturi l'attenzione..."
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none ${
                            errors.short_description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          rows={3}
                          maxLength={200}
                        />
                        {errors.short_description && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.short_description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formData.short_description.length}/200 caratteri
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Categoria *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categories.map((category) => {
                            const IconComponent = category.icon;
                            return (
                              <button
                                key={category.value}
                                type="button"
                                onClick={() => handleInputChange('category', category.value)}
                                className={`p-4 border-2 rounded-lg text-left transition-all ${
                                  formData.category === category.value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <IconComponent className={`w-5 h-5 ${
                                    formData.category === category.value
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-400'
                                  }`} />
                                  <div>
                                    <p className={`font-medium ${
                                      formData.category === category.value
                                        ? 'text-blue-900 dark:text-blue-100'
                                        : 'text-gray-900 dark:text-white'
                                    }`}>
                                      {category.label}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {category.description}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {errors.category && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.category}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Detailed Description */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Descrizione Completa *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Descrivi dettagliatamente il tuo progetto, i suoi obiettivi, come verranno utilizzati i fondi raccolti e l'impatto che avrà sulla comunità..."
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none ${
                            errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          rows={8}
                          maxLength={2000}
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formData.description.length}/2000 caratteri
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          URL Immagine (opzionale)
                        </label>
                        <input
                          type="url"
                          value={formData.image_url}
                          onChange={(e) => handleInputChange('image_url', e.target.value)}
                          placeholder="https://esempio.com/immagine.jpg"
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Aggiungi un'immagine rappresentativa per la tua campagna
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Goals and Dates */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Obiettivo di Raccolta *
                        </label>
                        <div className="relative">
                          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={formData.goal_amount || ''}
                            onChange={(e) => handleInputChange('goal_amount', parseInt(e.target.value) || 0)}
                            placeholder="1000"
                            min="100"
                            max="100000"
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                              errors.goal_amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        </div>
                        {errors.goal_amount && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.goal_amount}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Importo minimo: €100 - Importo massimo: €100,000
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data di Inizio *
                          </label>
                          <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => handleInputChange('start_date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                              errors.start_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          {errors.start_date && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.start_date}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data di Fine *
                          </label>
                          <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => handleInputChange('end_date', e.target.value)}
                            min={formData.start_date || new Date().toISOString().split('T')[0]}
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                              errors.end_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          {errors.end_date && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.end_date}
                            </p>
                          )}
                        </div>
                      </div>

                      {formData.start_date && formData.end_date && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-blue-900 dark:text-blue-100">Riepilogo Campagna</span>
                          </div>
                          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <p>Durata: {Math.ceil((new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) / (1000 * 60 * 60 * 24))} giorni</p>
                            <p>Obiettivo: €{(formData.goal_amount || 0).toLocaleString()}</p>
                            <p>Categoria: {categories.find(c => c.value === formData.category)?.label}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* General Error */}
                  {errors.general && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.general}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-3">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        Indietro
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Annulla
                    </button>
                    
                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                      >
                        Continua
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creazione...
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4" />
                            Crea Campagna
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CreateCampaignForm;