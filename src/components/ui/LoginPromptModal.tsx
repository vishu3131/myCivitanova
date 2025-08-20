'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn } from 'lucide-react';
import Link from 'next/link';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <LogIn className="w-5 h-5 text-blue-500" />
              Accesso Richiesto
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Per creare una campagna di raccolta fondi devi essere registrato e aver effettuato l'accesso.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Se non hai ancora un account, puoi registrarti gratuitamente.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center flex items-center justify-center gap-2"
              onClick={onClose}
            >
              <LogIn className="w-4 h-4" />
              Accedi
            </Link>
            <Link
              href="/register"
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
              onClick={onClose}
            >
              Registrati
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}