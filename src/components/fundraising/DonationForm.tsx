"use client";

import React, { useState } from 'react';
import { Heart, CreditCard, User, Mail, MessageSquare } from 'lucide-react';
import { createDonation, simulatePayment } from '@/lib/donationsApi';
import { toast } from 'react-hot-toast';

interface DonationFormProps {
  campaignId: string;
  campaignTitle: string;
  onDonationComplete?: () => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

export default function DonationForm({ 
  campaignId, 
  campaignTitle, 
  onDonationComplete 
}: DonationFormProps) {
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<'amount' | 'details' | 'payment'>('amount');

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value) {
      setAmount(0);
    }
  };

  const handleNextStep = () => {
    if (step === 'amount') {
      if (finalAmount < 5) {
        toast.error('L\'importo minimo è €5');
        return;
      }
      setStep('details');
    } else if (step === 'details') {
      if (!isAnonymous && (!donorName.trim() || !donorEmail.trim())) {
        toast.error('Nome e email sono obbligatori per donazioni non anonime');
        return;
      }
      setStep('payment');
    }
  };

  const handleSubmitDonation = async () => {
    setIsLoading(true);
    
    try {
      // Crea la donazione
      const donation = await createDonation({
        campaign_id: campaignId,
        amount: finalAmount,
        donor_name: isAnonymous ? undefined : donorName,
        donor_email: isAnonymous ? undefined : donorEmail,
        is_anonymous: isAnonymous,
        message: message.trim() || undefined,
        payment_method: 'card'
      });

      // Simula il pagamento (in un'app reale, qui integreresti Stripe/PayPal)
      await simulatePayment(donation.id, true);

      toast.success('Donazione completata con successo!');
      
      if (onDonationComplete) {
        onDonationComplete();
      }

      // Reset form
      setStep('amount');
      setAmount(25);
      setCustomAmount('');
      setDonorName('');
      setDonorEmail('');
      setMessage('');
      setIsAnonymous(false);
      
    } catch (error) {
      console.error('Error processing donation:', error);
      toast.error('Errore durante il processamento della donazione');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Scegli l'importo</h3>
        <p className="text-white/70">Quanto vuoi donare per {campaignTitle}?</p>
      </div>

      {/* Importi predefiniti */}
      <div className="grid grid-cols-3 gap-3">
        {PRESET_AMOUNTS.map((presetAmount) => (
          <button
            key={presetAmount}
            onClick={() => handleAmountSelect(presetAmount)}
            className={`p-3 rounded-lg border-2 transition-all ${
              amount === presetAmount && !customAmount
                ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                : 'border-white/20 bg-white/5 text-white hover:border-white/40'
            }`}
          >
            €{presetAmount}
          </button>
        ))}
      </div>

      {/* Importo personalizzato */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Importo personalizzato
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">€</span>
          <input
            type="number"
            min="5"
            step="0.01"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      <div className="text-center">
        <div className="text-2xl font-bold text-emerald-300 mb-2">
          €{finalAmount.toFixed(2)}
        </div>
        <p className="text-sm text-white/60">
          Commissione: €{(finalAmount * 0.03).toFixed(2)} • 
          Netto: €{(finalAmount * 0.97).toFixed(2)}
        </p>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">I tuoi dati</h3>
        <p className="text-white/70">Donazione di €{finalAmount.toFixed(2)}</p>
      </div>

      {/* Toggle anonimo */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-white/60" />
          <span className="text-white">Donazione anonima</span>
        </div>
        <button
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`w-12 h-6 rounded-full transition-colors ${
            isAnonymous ? 'bg-emerald-500' : 'bg-white/20'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
            isAnonymous ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {!isAnonymous && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Nome completo *
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Il tuo nome"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              placeholder="la-tua-email@civitanova.it"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Messaggio (opzionale)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Lascia un messaggio di supporto..."
          rows={3}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 resize-none"
        />
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Conferma donazione</h3>
        <p className="text-white/70">Stai per donare €{finalAmount.toFixed(2)}</p>
      </div>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white/70">Importo:</span>
            <span className="text-white font-medium">€{finalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Commissione:</span>
            <span className="text-white/60">€{(finalAmount * 0.03).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2">
            <span className="text-white font-medium">Totale:</span>
            <span className="text-emerald-300 font-bold">€{finalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {!isAnonymous && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="space-y-1">
            <div className="text-white font-medium">{donorName}</div>
            <div className="text-white/60">{donorEmail}</div>
            {message && (
              <div className="text-white/70 text-sm mt-2 italic">"{message}"</div>
            )}
          </div>
        </div>
      )}

      <div className="text-center text-sm text-white/60">
        <CreditCard className="w-4 h-4 inline mr-1" />
        Pagamento sicuro simulato per demo
      </div>
    </div>
  );

  return (
    <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          {['amount', 'details', 'payment'].map((stepName, index) => (
            <React.Fragment key={stepName}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepName
                  ? 'bg-emerald-500 text-white'
                  : index < ['amount', 'details', 'payment'].indexOf(step)
                  ? 'bg-emerald-500/50 text-emerald-300'
                  : 'bg-white/10 text-white/40'
              }`}>
                {index + 1}
              </div>
              {index < 2 && (
                <div className={`w-8 h-0.5 ${
                  index < ['amount', 'details', 'payment'].indexOf(step)
                    ? 'bg-emerald-500/50'
                    : 'bg-white/10'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step content */}
      {step === 'amount' && renderAmountStep()}
      {step === 'details' && renderDetailsStep()}
      {step === 'payment' && renderPaymentStep()}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8">
        {step !== 'amount' && (
          <button
            onClick={() => {
              if (step === 'details') setStep('amount');
              if (step === 'payment') setStep('details');
            }}
            className="flex-1 py-3 px-4 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
          >
            Indietro
          </button>
        )}
        
        <button
          onClick={step === 'payment' ? handleSubmitDonation : handleNextStep}
          disabled={isLoading || (step === 'amount' && finalAmount < 5)}
          className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {step === 'payment' ? (
                <>
                  <Heart className="w-4 h-4" />
                  Dona ora
                </>
              ) : (
                'Continua'
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}