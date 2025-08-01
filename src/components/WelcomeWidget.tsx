"use client";

import React from 'react';

export function WelcomeWidget({ onReport }: { onReport?: () => void }) {
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
  
  // Capitalizza la prima lettera della data
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <section className="relative h-[300px] md:h-[350px] lg:h-[400px] rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-accent to-dark-200 card-glow">
      <div className="absolute inset-0">
        <img
          src="https://source.unsplash.com/random/1200x600/?civitanova,marche,seafront"
          alt="Civitanova Marche"
          className="w-full h-full object-cover opacity-30"
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
          <p className="text-white/90 text-lg md:text-xl mb-4">
            Benvenuto a Civitanova Marche
          </p>
          
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