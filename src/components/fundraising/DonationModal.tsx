'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Euro, Users, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { FundraisingAPI } from '@/lib/fundraisingApi';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';
import { FundraisingCampaign } from '@/types/fundraising';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: FundraisingCampaign;
  onDonationSuccess?: () => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function DonationModal({ isOpen, onClose, campaign, onDonationSuccess }: DonationModalProps) {
  const { user } = useAuthWithRole();
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    } else {
      setAmount('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Devi essere loggato per fare una donazione');
      return;
    }

    if (!amount || amount <= 0) {
      setError('Inserisci un importo valido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create donation record (without real payment processing)
      await FundraisingAPI.createDonation({
        campaign_id: campaign.id,
        donor_id: user.id,
        amount: Number(amount),
        message: message.trim() || undefined,
        is_anonymous: isAnonymous,
        payment_status: 'completed' // Simulating successful payment
      });

      setShowSuccess(true);
      
      // Reset form
      setAmount('');
      setCustomAmount('');
      setMessage('');
      setIsAnonymous(false);
      
      // Call success callback after a delay
      setTimeout(() => {
        onDonationSuccess?.();
        onClose();
        setShowSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Errore durante la donazione:', error);
      setError('Errore durante la donazione. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = (campaign.goal_amount || 0) > 0 
    ? Math.min(((campaign.current_amount || 0) / (campaign.goal_amount || 0)) * 100, 100) 
    : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {showSuccess ? (
            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Donazione Completata!
              </h3>
              <p className="text-gray-600 mb-4">
                Grazie per il tuo supporto a <strong>{campaign.title}</strong>
              </p>
              <div className="text-2xl font-bold text-green-600">
                €{amount}
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Fai una Donazione</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Campaign Info */}
              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>€{(campaign.current_amount || 0).toLocaleString()} di €{(campaign.goal_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{campaign.donors_count} donatori</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Donation Form */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Amount Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Seleziona l'importo
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {PRESET_AMOUNTS.map((presetAmount) => (
                      <button
                        key={presetAmount}
                        type="button"
                        onClick={() => handlePresetAmount(presetAmount)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          amount === presetAmount
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        €{presetAmount}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="Importo personalizzato"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Messaggio (opzionale)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Scrivi un messaggio di supporto..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {message.length}/500 caratteri
                  </div>
                </div>

                {/* Anonymous Option */}
                <div className="mb-6">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Dona in modo anonimo
                    </span>
                  </label>
                </div>

                {/* Beta Notice */}
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">
                        Sistema in Beta
                      </h4>
                      <p className="text-xs text-yellow-700">
                        Questa è una simulazione. Non verrà effettuato alcun pagamento reale.
                        Il sistema di pagamento sarà implementato nelle prossime versioni.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!amount || amount <= 0 || isLoading || !user}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      {user ? `Dona €${amount || 0}` : 'Accedi per donare'}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}