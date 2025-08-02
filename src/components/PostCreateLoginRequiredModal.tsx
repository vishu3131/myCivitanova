'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, Lock, MessageCircle } from 'lucide-react';

interface PostCreateLoginRequiredModalProps {
  onClose: () => void;
}

const PostCreateLoginRequiredModal = ({ onClose }: PostCreateLoginRequiredModalProps) => {
  const handleLoginClick = () => {
    // Qui potresti aprire il modal di login o reindirizzare alla pagina di login
    // Per ora chiudiamo semplicemente il modal
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-dark-400 rounded-xl shadow-2xl border border-white/10 w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Login Richiesto</h2>
                <p className="text-white/60 text-sm">Accedi per continuare</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-white/90 text-xl font-semibold mb-2">
                Devi effettuare il login
              </h3>
              <p className="text-white/70 text-base mb-2">
                Per creare un nuovo post nella community di Civitanova Marche è necessario essere registrati.
              </p>
              <p className="text-white/60 text-sm">
                Accedi al tuo account o registrati per partecipare attivamente alla community e condividere i tuoi contenuti.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleLoginClick}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-accent text-dark-400 rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Accedi o Registrati</span>
              </button>
              
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-dark-300/50 border border-white/10 text-white/80 rounded-lg font-medium hover:bg-white/10 hover:border-white/20 transition-colors"
              >
                Annulla
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-4 p-3 bg-dark-300/30 rounded-lg">
              <p className="text-white/60 text-xs text-center">
                💡 <strong>Suggerimento:</strong> Una volta effettuato il login, potrai creare post, commentare, mettere like e partecipare a tutte le attività della community.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostCreateLoginRequiredModal;