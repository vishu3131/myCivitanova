"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import NeonTitle from './NeonTitle';

export function WelcomeWidget({ onReport }: { onReport?: () => void }) {
  const [shouldTriggerIntro, setShouldTriggerIntro] = useState(false);
  // Ottieni l'ora corrente per personalizzare il saluto
  const currentTime = new Date();
  const hours = currentTime.getHours();
  let greeting = "Buongiorno";
  
  if (hours >= 12 && hours < 18) {
    greeting = "Buon pomeriggio";
  } else if (hours >= 18) {
    greeting = "Buonasera";
  }
  
  // Formatta la data corrente in italiano
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = currentTime.toLocaleDateString('it-IT', options);

  // Callback chiamato quando l'animazione del NeonTitle è completata
  const handleAnimationComplete = useCallback(() => {
    // Always trigger intro when animation completes
    setShouldTriggerIntro(true);
  }, []);

  // Effetto per gestire l'autoplay dell'intro
  useEffect(() => {
    if (shouldTriggerIntro) {
      // Simula l'autoplay dell'intro rimuovendo la chiave dal localStorage
      // Questo farà sì che IntroOverlay mostri automaticamente il video
      try {
        localStorage.removeItem('introUnlockedV1');
        // Dispatch dell'evento personalizzato per triggerare l'intro
        window.dispatchEvent(new CustomEvent('triggerIntro'));
      } catch (error) {
        console.error('Errore durante l\'attivazione dell\'intro:', error);
      }
      setShouldTriggerIntro(false);
    }
  }, [shouldTriggerIntro]);}]}}}
  
  // Capitalizza la prima lettera della data
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <section className="relative h-[300px] md:h-[350px] lg:h-[400px] rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-accent to-dark-200 card-glow">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
          alt="Civitanova Marche"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/40 to-dark-200/60"></div>
      </div>
      
      <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
        {/* Data */}
        <div>
          <p className="text-white/90 text-sm md:text-base">{capitalizedDate}</p>
        </div>
        
        <div className="mt-auto max-w-3xl">
          {/* Saluto personalizzato */}
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-2">
            {greeting}, <span className="text-white/90">Mario</span>
          </h1>
          <div className="mb-4">
            <NeonTitle 
              text="MyCivitanova"
              fontSize="clamp(1.5rem, 5vw, 3rem)"
              onClick={() => console.log('MyCivitanova neon title clicked!')}
              onAnimationComplete={handleAnimationComplete}
            />
          </div>
          
          {/* City Description */}
          <p className="text-white/80 text-base md:text-lg max-w-2xl">
            Scopri eventi locali, connettiti con la comunità e vivi al meglio la tua città.
            Esplora le bellezze del territorio e resta aggiornato su tutto ciò che accade.
          </p>
          
          {/* Pulsante CTA */}
          <button className="mt-6 bg-white text-accent/80 font-medium py-2.5 px-6 rounded-lg flex items-center hover:bg-opacity-90 transition-colors">
            <span>Esplora la città</span>
            <span className="ml-2 text-lg">→</span>
          </button>
          {/* Pulsante Segnala Problema Urbano */}
          <div className="flex justify-end mt-4">
            <button
              className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center shadow hover:bg-purple-700 transition-all -mt-16"
              onClick={onReport}
              style={{alignSelf:'flex-end'}}
            >
              <span className="mr-2">⚠️</span>Segnala Problema Urbano
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}