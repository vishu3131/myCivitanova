"use client";

import React from 'react';
import { NeonButton } from '@/components/NeonButton';
import { NeonButtonSimple } from '@/components/NeonButtonSimple';
import PureNeonButton from '@/components/PureNeonButton';
import PureNeonWidget from '@/components/PureNeonWidget';
import PureNeonMobileWidget from '@/components/PureNeonMobileWidget';

export default function NeonDemoPage() {
  const handleButtonClick = () => {
    console.log('Pulsante neon cliccato!');
    // Qui puoi aggiungere la logica che vuoi
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Versione CSS Pura - Replica esatta dell'HTML */}
      <section className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold text-green-400 mb-8">
            Effetto Neon CSS Puro
          </h2>
          <PureNeonButton 
            text="MyCivitanova.it" 
            onClick={handleButtonClick}
            fontSize="3em"
          />
          <p className="text-gray-400 text-sm max-w-md">
            Questo è l&apos;effetto neon identico al tuo codice HTML, 
            convertito in componente React con ottimizzazioni mobile.
          </p>
        </div>
      </section>

      {/* Versione completa con centratura */}
      <section className="h-screen">
        <NeonButton 
          text="MyCivitanova.it" 
          onClick={handleButtonClick}
        />
      </section>

      {/* Widget CSS Puri */}
      <section className="p-8 space-y-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8 text-green-400">
            Widget CSS Puri
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PureNeonWidget 
              title="Desktop Widget"
              description="Versione desktop del widget CSS puro"
              buttonText="Desktop"
              onButtonClick={() => console.log('Desktop widget clicked')}
            />
            <PureNeonMobileWidget 
              title="Mobile Widget"
              description="Versione mobile ottimizzata"
              buttonText="Mobile"
              onButtonClick={() => console.log('Mobile widget clicked')}
            />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-green-400">
            Esempi NeonButtonSimple
          </h2>
        </div>

        {/* Diverse dimensioni */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-xl mb-4 text-gray-300">Dimensione Small</h3>
            <NeonButtonSimple 
              text="Piccolo" 
              size="sm"
              onClick={() => console.log('Small clicked')}
            />
          </div>

          <div className="text-center">
            <h3 className="text-xl mb-4 text-gray-300">Dimensione Medium (default)</h3>
            <NeonButtonSimple 
              text="Medio" 
              size="md"
              onClick={() => console.log('Medium clicked')}
            />
          </div>

          <div className="text-center">
            <h3 className="text-xl mb-4 text-gray-300">Dimensione Large</h3>
            <NeonButtonSimple 
              text="Grande" 
              size="lg"
              onClick={() => console.log('Large clicked')}
            />
          </div>

          <div className="text-center">
            <h3 className="text-xl mb-4 text-gray-300">Dimensione Extra Large</h3>
            <NeonButtonSimple 
              text="Enorme" 
              size="xl"
              onClick={() => console.log('XL clicked')}
            />
          </div>
        </div>

        {/* Esempi con testi diversi */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-xl mb-4 text-gray-300">Testi Personalizzati</h3>
            <div className="space-y-4">
              <NeonButtonSimple 
                text="Esplora" 
                size="md"
                onClick={() => console.log('Esplora clicked')}
              />
              <NeonButtonSimple 
                text="Eventi" 
                size="md"
                onClick={() => console.log('Eventi clicked')}
              />
              <NeonButtonSimple 
                text="Contatti" 
                size="md"
                onClick={() => console.log('Contatti clicked')}
              />
            </div>
          </div>
        </div>

        {/* Layout orizzontale per mobile */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-xl mb-4 text-gray-300">Layout Mobile</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <NeonButtonSimple 
                text="Home" 
                size="sm"
                onClick={() => console.log('Home clicked')}
              />
              <NeonButtonSimple 
                text="Menu" 
                size="sm"
                onClick={() => console.log('Menu clicked')}
              />
              <NeonButtonSimple 
                text="Info" 
                size="sm"
                onClick={() => console.log('Info clicked')}
              />
            </div>
          </div>
        </div>

        {/* Pulsante disabilitato */}
        <div className="text-center">
          <h3 className="text-xl mb-4 text-gray-300">Pulsante Disabilitato</h3>
          <NeonButtonSimple 
            text="Disabilitato" 
            size="md"
            disabled={true}
            onClick={() => console.log('Non dovrebbe funzionare')}
          />
        </div>
      </section>

      {/* Istruzioni per l'uso */}
      <section className="p-8 bg-gray-800 m-8 rounded-lg">
        <h3 className="text-2xl font-bold mb-4 text-green-400">
          Come Usare i Componenti
        </h3>
        <div className="space-y-4 text-gray-300">
          <div>
            <h4 className="text-lg font-semibold text-white">NeonButton (versione completa):</h4>
            <p>Usa questo per pagine dedicate o sezioni hero. Include il wrapper di centratura.</p>
            <code className="block bg-gray-900 p-2 rounded mt-2 text-green-400">
              {`<NeonButton text="Il tuo testo" onClick={handleClick} />`}
            </code>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">NeonButtonSimple:</h4>
            <p>Usa questo per integrare il pulsante in layout esistenti. Più flessibile.</p>
            <code className="block bg-gray-900 p-2 rounded mt-2 text-green-400">
              {`<NeonButtonSimple text="Testo" size="md" onClick={handleClick} />`}
            </code>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Caratteristiche Mobile:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Effetti touch ottimizzati</li>
              <li>Vibrazione tattile (se supportata)</li>
              <li>Feedback visivo prolungato dopo il touch</li>
              <li>Particelle di energia al tocco</li>
              <li>Dimensioni responsive</li>
              <li>Prevenzione del tap highlight</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}