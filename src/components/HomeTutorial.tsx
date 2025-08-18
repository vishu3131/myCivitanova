"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useXPSystem } from '@/hooks/useXPSystem';

export interface HomeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  userId?: string;
}

const TUTORIAL_KEY = "homeTutorialHiddenV1";

// Contenuti aggiornati delle slides
const slides = [
  {
    id: 'welcome',
    title: 'Ciao! Benvenuto a MyCivitanova! 👋',
    subtitle: 'La tua nuova app preferita per Civitanova Marche',
    description: 'Preparati a scoprire un\'app che non è solo bella da vedere, ma è anche incredibilmente potente e accessibile!',
    detailedText: `MyCivitanova non è la solita app comunale noiosa. Abbiamo creato un ecosistema digitale completo che combina design moderno e funzionalità innovative.

🌐 WebApp 3.0: Accessibile da qualsiasi dispositivo senza installazione
📱 Zero Memoria: Non occupa spazio sul tuo telefono, sempre aggiornata
🗺️ Mappe Complete: Le mappe più dettagliate e aggiornate di Civitanova
🎨 Design Moderno: Interfaccia elegante e intuitiva per tutti

Ogni dettaglio è stato curato per offrirti un'esperienza fluida e coinvolgente, accessibile ovunque tu sia!`,
    emoji: '🏛️',
    ctaText: 'Iniziamo il tour! 🚀',
    bg: 'from-blue-500/10 to-cyan-500/10',
    xpReward: 10
  },
  {
    id: 'xp_system',
    title: 'Guadagna XP come in un videogame! 🎮',
    subtitle: 'Sistema di gamification avanzato',
    description: 'Non è solo un\'app, è un\'avventura! Ogni azione che fai ti fa guadagnare punti esperienza.',
    detailedText: `Il nostro sistema XP trasforma l'uso dell'app in un'esperienza coinvolgente e gratificante!

🏆 Sistema Badge: Tanti badge diversi da sbloccare con rarità crescenti
📊 Leaderboard: Classifica in tempo reale con tutti gli utenti attivi
⚡ Attività XP: Molte attività diverse che ti fanno guadagnare punti
🔄 Login Giornaliero: Bonus quotidiani per chi usa l'app regolarmente

Ogni interazione con l'app ti avvicina al prossimo livello e sblocca nuovi riconoscimenti. È un modo divertente per esplorare tutte le funzionalità e rimanere connesso con la tua città!`,
    emoji: '🏆',
    ctaText: 'Voglio vedere i miei XP! ⚡',
    bg: 'from-amber-500/10 to-orange-500/10',
    xpReward: 15
  },
  {
    id: 'ar_exploration',
    title: 'Realtà Aumentata in Arrivo! 🔮',
    subtitle: 'Tecnologia AR in sviluppo',
    description: 'Stiamo lavorando su una funzionalità AR rivoluzionaria che cambierà il modo di esplorare Civitanova!',
    detailedText: `La funzionalità di Realtà Aumentata è attualmente in fase di sviluppo e promette di essere incredibile:

📱 Esplorazione Immersiva: Inquadra i luoghi e scopri informazioni in tempo reale
🎯 Punti di Interesse: Identifica monumenti, servizi e attrazioni intorno a te
🎨 Interfaccia Futuristica: Un'esperienza visiva coinvolgente e intuitiva
📍 Navigazione Assistita: Trova facilmente quello che cerchi nella città

Questa funzionalità sarà presto disponibile e renderà l'esplorazione di Civitanova un'esperienza unica e interattiva. Resta sintonizzato per gli aggiornamenti!`,
    emoji: '🗺️',
    ctaText: 'Non vedo l\'ora! 📸',
    bg: 'from-emerald-500/10 to-teal-500/10',
    xpReward: 20
  },
  {
    id: 'smart_services',
    title: 'Servizi Comunali Intelligenti! 🏢',
    subtitle: 'Semplificare la burocrazia',
    description: 'Stiamo digitalizzando tutti i servizi comunali per renderli più accessibili e facili da usare.',
    detailedText: `I servizi comunali del futuro sono in arrivo su MyCivitanova:

🚌 Trasporti: Orari autobus in tempo reale e pianificazione viaggi
💳 Pagamenti: Sistema integrato per pagare tasse e servizi online
📋 Documenti: Richiesta e gestione documenti direttamente dall'app
📞 Assistenza: Contatto diretto con gli uffici comunali

Questi servizi sono in fase di sviluppo e implementazione. L'obiettivo è eliminare le code agli sportelli e rendere ogni pratica burocratica semplice come un click. I cittadini potranno gestire tutto comodamente da casa!`,
    emoji: '🏢',
    ctaText: 'Fantastico! 🔍',
    bg: 'from-purple-500/10 to-violet-500/10',
    xpReward: 15
  },
  {
    id: 'community_power',
    title: 'Community che Cambia la Città! 👥',
    subtitle: 'Il potere è nelle tue mani',
    description: 'Non è solo un social, è una piattaforma per migliorare davvero la tua città insieme agli altri cittadini!',
    detailedText: `La community di MyCivitanova è progettata per l'engagement civico reale:

💬 Discussioni Costruttive: Dialoga con altri cittadini su temi importanti
🎯 Segnalazioni Efficaci: Riporta problemi e segui la loro risoluzione
🏆 Iniziative Collettive: Partecipa a progetti per migliorare la città
💰 Crowdfunding Civico: Sostieni progetti di interesse pubblico

Ogni voce conta e ogni contributo può fare la differenza. Insieme possiamo rendere Civitanova una città migliore per tutti, creando un dialogo costruttivo tra cittadini e amministrazione.`,
    emoji: '👥',
    ctaText: 'Voglio partecipare! 🤝',
    bg: 'from-rose-500/10 to-pink-500/10',
    xpReward: 20
  },
  {
    id: 'tech_excellence',
    title: 'Sei pronto per l\'avventura! 🚀',
    subtitle: 'Il futuro di Civitanova è qui',
    description: 'MyCivitanova rappresenta l\'evoluzione digitale della nostra città, progettata per i cittadini di oggi e domani.',
    detailedText: `MyCivitanova è molto più di una semplice app comunale:

🎨 Design Intuitivo: Interfaccia moderna e facile da usare per tutti
⚡ Sempre Aggiornata: Nuove funzionalità e miglioramenti continui
🔒 Sicura e Affidabile: I tuoi dati sono protetti e al sicuro
📱 Accessibile Ovunque: Funziona su qualsiasi dispositivo, sempre disponibile

L'app è in costante evoluzione, con nuove funzionalità che vengono aggiunte regolarmente per migliorare la vita dei cittadini. È il ponte digitale tra te e la tua città.

Ora conosci tutte le potenzialità di MyCivitanova. Inizia a esplorare e scoprire tutto quello che abbiamo preparato per rendere la tua esperienza cittadina più semplice e coinvolgente!`,
    emoji: '🎯',
    ctaText: 'Inizia la tua avventura! 🎯',
    bg: 'from-indigo-500/10 to-purple-500/10',
    xpReward: 25
  },
];

export default function HomeTutorial({ isOpen, onClose, onComplete, userId }: HomeTutorialProps) {
  const [index, setIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [slideStartTime, setSlideStartTime] = useState(Date.now());
  const [totalInteractions, setTotalInteractions] = useState(0);
  const [viewedSlides, setViewedSlides] = useState<number[]>([]);
  
  const { addXP } = useXPSystem(userId);

  // Reset index quando si apre
  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      setSlideStartTime(Date.now());
      setViewedSlides([0]);
    }
  }, [isOpen]);

  // Track slide view
  useEffect(() => {
    if (isOpen && !viewedSlides.includes(index)) {
      setViewedSlides(prev => [...prev, index]);
    }
  }, [index, isOpen]);

  const trackInteraction = useCallback(() => {
    setTotalInteractions(prev => prev + 1);
  }, []);

  const handleSlideChange = async (newIndex: number) => {
    trackInteraction();
    
    // XP per visualizzazione slide
    if (userId && slides[index].xpReward) {
      await addXP('tutorial_slide_viewed', slides[index].xpReward, {
        slide_id: slides[index].id,
        slide_index: index,
        source: 'home_tutorial'
      });
    }

    setIndex(newIndex);
    setSlideStartTime(Date.now());
  };

  const handleClose = () => {
    if (dontShowAgain) {
      try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch {}
    }
    onClose();
  };

  const handleComplete = async () => {
    trackInteraction();
    
    // Calcola statistiche sessione
    const sessionDuration = Date.now() - sessionStartTime;
    const completionRate = (viewedSlides.length / slides.length) * 100;
    
    // XP per completamento tutorial
    if (userId) {
      await addXP('tutorial_completed', 100, {
        session_duration: sessionDuration,
        completion_rate: completionRate,
        total_interactions: totalInteractions,
        slides_viewed: viewedSlides.length,
        source: 'home_tutorial'
      });

      // Badge speciale per completamento
      await addXP('badge_earned', 50, {
        badge_id: 'tutorial_master',
        source: 'home_tutorial'
      });
    }

    if (dontShowAgain) {
      try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch {}
    }

    // Marca come completato nel widget
    if ((window as any).markTutorialCompleted) {
      (window as any).markTutorialCompleted();
    }

    onComplete?.();
    onClose();
  };

  if (!isOpen) return null;

  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const progress = ((index + 1) / slides.length) * 100;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-start justify-center p-0 sm:p-6" 
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
    >
      <div className="w-full sm:max-w-lg bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Header con Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">🎓</span>
              </div>
              <div>
                <div className="text-white/90 text-sm font-semibold">Tutorial MyCivitanova</div>
                <div className="text-white/60 text-xs">
                  Slide {index + 1} di {slides.length}
                </div>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Chiudi
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out" 
               style={{ width: `${progress}%` }} />
        </div>

        {/* Slide Content */}
        <div className={`px-6 py-8 bg-gradient-to-br ${slide.bg} min-h-[400px] flex flex-col`}>
          {/* Slide Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              {slide.emoji}
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-xl leading-tight mb-2">
                {slide.title}
              </h2>
              <p className="text-white/80 text-sm font-medium mb-3">
                {slide.subtitle}
              </p>
              <p className="text-white/70 text-sm leading-relaxed">
                {slide.description}
              </p>
            </div>
          </div>

          {/* Detailed Content */}
          <div className="flex-1 bg-black/20 rounded-xl p-4 mb-6 border border-white/10">
            <div className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
              {slide.detailedText}
            </div>
          </div>

          {/* XP Reward Badge */}
          {slide.xpReward && (
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-amber-400 to-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                +{slide.xpReward} XP per questa slide!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-gray-900/50">
          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => handleSlideChange(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === index 
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg' 
                    : viewedSlides.includes(i)
                    ? 'bg-white/40 hover:bg-white/60'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                aria-label={`Vai alla slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-white/70">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="accent-violet-500"
              />
              Non mostrare più
            </label>

            <div className="flex items-center gap-3">
              {index > 0 && (
                <button 
                  onClick={() => handleSlideChange(index - 1)} 
                  className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Indietro
                </button>
              )}
              
              {!isLast ? (
                <button 
                  onClick={() => handleSlideChange(index + 1)} 
                  className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium transition-all shadow-lg"
                >
                  {slide.ctaText || 'Avanti'}
                </button>
              ) : (
                <button 
                  onClick={handleComplete} 
                  className="px-6 py-2 text-sm rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold transition-all shadow-lg"
                >
                  {slide.ctaText || 'Completa Tutorial!'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper per controllare se il tutorial è nascosto
export function isHomeTutorialHidden(): boolean {
  try { 
    return localStorage.getItem(TUTORIAL_KEY) === '1'; 
  } catch { 
    return false; 
  }
}