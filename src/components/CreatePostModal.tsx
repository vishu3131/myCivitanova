'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Image as ImageIcon, 
  MapPin, 
  Smile, 
  Hash, 
  Globe, 
  Users, 
  Lock,
  AlertTriangle,
  MessageCircle,
  Calendar,
  UserPlus,
  Camera,
  Video,
  FileText,
  Send
} from 'lucide-react';
import { CreatePostData } from '@/hooks/useCommunity';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: CreatePostData) => Promise<void>;
  currentUser: any;
}

const postTypes = [
  { id: 'discussion', label: 'Discussione', icon: MessageCircle, color: 'text-blue-400', description: 'Avvia una conversazione' },
  { id: 'report', label: 'Segnalazione', icon: AlertTriangle, color: 'text-red-400', description: 'Segnala un problema' },
  { id: 'event', label: 'Evento', icon: Calendar, color: 'text-green-400', description: 'Organizza un evento' },
  { id: 'group', label: 'Gruppo', icon: UserPlus, color: 'text-purple-400', description: 'Crea un gruppo' }
];

const visibilityOptions = [
  { id: 'public', label: 'Pubblico', icon: Globe, description: 'Visibile a tutti' },
  { id: 'friends', label: 'Amici', icon: Users, description: 'Solo i tuoi amici' },
  { id: 'private', label: 'Privato', icon: Lock, description: 'Solo tu' }
];

const categories = [
  'Generale',
  'Trasporti',
  'Ambiente',
  'Sicurezza',
  'Eventi',
  'Servizi',
  'Turismo',
  'Sport',
  'Cultura',
  'Altro'
];

export function CreatePostModal({ isOpen, onClose, onSubmit, currentUser }: CreatePostModalProps) {
  const [formData, setFormData] = useState<CreatePostData>({
    type: 'discussion',
    title: '',
    content: '',
    category: '',
    location: '',
    tags: [],
    images: [],
    visibility: 'public'
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (field: keyof CreatePostData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !(formData.tags || []).includes(tagInput.trim())) {
      handleInputChange('tags', [...(formData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', (formData.tags || []).filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setImagePreview(prev => [...prev, imageUrl]);
        handleInputChange('images', [...(formData.images || []), imageUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    handleInputChange('images', (formData.images || []).filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Errore nella creazione del post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'discussion',
      title: '',
      content: '',
      category: '',
      location: '',
      tags: [],
      images: [],
      visibility: 'public'
    });
    setCurrentStep(1);
    setTagInput('');
    setImagePreview([]);
    onClose();
  };

  const canProceedToStep2 = formData.type && formData.title.trim();
  const canSubmit = formData.title.trim() && formData.content.trim();

  const selectedType = postTypes.find(type => type.id === formData.type);
  const selectedVisibility = visibilityOptions.find(vis => vis.id === formData.visibility);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-dark-400 rounded-xl shadow-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center">
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.display_name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-accent font-semibold text-sm">
                    {currentUser?.display_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-white font-semibold">Crea un nuovo post</h2>
                <p className="text-white/60 text-sm">{currentUser?.display_name}</p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="px-4 py-2 bg-dark-300/50">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-accent' : 'bg-white/20'}`} />
              <div className={`flex-1 h-1 rounded ${currentStep >= 2 ? 'bg-accent' : 'bg-white/20'}`} />
              <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-accent' : 'bg-white/20'}`} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-white/60">Tipo e Titolo</span>
              <span className="text-xs text-white/60">Contenuto e Dettagli</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {currentStep === 1 ? (
              <div className="space-y-6">
                {/* Tipo di Post */}
                <div>
                  <label className="block text-white font-medium mb-3">Tipo di post</label>
                  <div className="grid grid-cols-2 gap-3">
                    {postTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => handleInputChange('type', type.id)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.type === type.id
                              ? 'border-accent bg-accent/10'
                              : 'border-white/10 hover:border-white/20 bg-dark-300/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <IconComponent className={`w-5 h-5 ${type.color}`} />
                            <span className="text-white font-medium">{type.label}</span>
                          </div>
                          <p className="text-white/60 text-sm">{type.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Titolo */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Titolo <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Scrivi un titolo accattivante..."
                    className="w-full bg-dark-300/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-accent focus:border-transparent"
                    maxLength={100}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-white/40">Massimo 100 caratteri</span>
                    <span className="text-xs text-white/40">{formData.title.length}/100</span>
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-white font-medium mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full bg-dark-300/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="">Seleziona una categoria</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Riepilogo Step 1 */}
                <div className="bg-dark-300/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    {selectedType && <selectedType.icon className={`w-5 h-5 ${selectedType.color}`} />}
                    <span className="text-white font-medium">{selectedType?.label}</span>
                    {formData.category && (
                      <>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60">{formData.category}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-white font-semibold">{formData.title}</h3>
                </div>

                {/* Contenuto */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Contenuto <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    ref={contentInputRef}
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Cosa vuoi condividere?"
                    className="w-full bg-dark-300/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                    rows={6}
                    maxLength={2000}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-white/40">Massimo 2000 caratteri</span>
                    <span className="text-xs text-white/40">{formData.content.length}/2000</span>
                  </div>
                </div>

                {/* Immagini */}
                <div>
                  <label className="block text-white font-medium mb-2">Immagini</label>
                  <div className="space-y-3">
                    {imagePreview.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {imagePreview.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-4 border-2 border-dashed border-white/20 rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-all flex items-center justify-center space-x-2 text-white/60 hover:text-accent"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span>Aggiungi immagini</span>
                    </button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Posizione */}
                <div>
                  <label className="block text-white font-medium mb-2">Posizione</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Aggiungi una posizione..."
                      className="w-full bg-dark-300/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-white font-medium mb-2">Tag</label>
                  <div className="space-y-3">
                    {(formData.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(formData.tags || []).map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm flex items-center space-x-2"
                          >
                            <span>#{tag}</span>
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="text-accent/60 hover:text-accent"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Aggiungi un tag..."
                          className="w-full bg-dark-300/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handleAddTag}
                        disabled={!tagInput.trim()}
                        className="px-4 py-2 bg-accent text-dark-400 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Aggiungi
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visibilità */}
                <div>
                  <label className="block text-white font-medium mb-2">Visibilità</label>
                  <div className="space-y-2">
                    {visibilityOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleInputChange('visibility', option.id)}
                          className={`w-full p-3 rounded-lg border transition-all text-left flex items-center space-x-3 ${
                            formData.visibility === option.id
                              ? 'border-accent bg-accent/10'
                              : 'border-white/10 hover:border-white/20 bg-dark-300/30'
                          }`}
                        >
                          <IconComponent className="w-5 h-5 text-white/60" />
                          <div>
                            <div className="text-white font-medium">{option.label}</div>
                            <div className="text-white/60 text-sm">{option.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-dark-300/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {currentStep === 2 && (
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Indietro
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Annulla
                </button>
                
                {currentStep === 1 ? (
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedToStep2}
                    className="px-6 py-2 bg-accent text-dark-400 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>Continua</span>
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="px-6 py-2 bg-accent text-dark-400 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-dark-400/30 border-t-dark-400 rounded-full animate-spin" />
                        <span>Pubblicando...</span>
                      </>
                    ) : (
                      <>
                        <span>Pubblica</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}