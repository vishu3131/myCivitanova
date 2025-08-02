'use client';


import { useState } from 'react';
import { Glasses, MapPin, Landmark, Info, Camera, Users } from 'lucide-react';



const features = [
  {
    icon: <MapPin className="w-6 h-6 text-fuchsia-400 mr-2" />,
    title: 'Mappa Interattiva',
    description: 'Visualizza i punti di interesse direttamente sulla mappa AR.',
    popup: 'La mappa interattiva ti guiderà tra monumenti, musei e attrazioni, mostrando informazioni contestuali in tempo reale.'
  },
  {
    icon: <Landmark className="w-6 h-6 text-indigo-300 mr-2" />,
    title: 'Monumenti e Storia',
    description: 'Scopri la storia dei luoghi mentre li osservi.',
    popup: 'Avvicinati ai monumenti e ricevi dettagli storici, curiosità e aneddoti direttamente sullo schermo.'
  },
  {
    icon: <Info className="w-6 h-6 text-purple-300 mr-2" />,
    title: 'Informazioni Utili',
    description: 'Orari, servizi e contatti sempre a portata di mano.',
    popup: 'Ottieni informazioni pratiche su orari di apertura, servizi disponibili e contatti utili per ogni punto di interesse.'
  },
  {
    icon: <Camera className="w-6 h-6 text-pink-300 mr-2" />,
    title: 'Foto e Ricordi',
    description: 'Scatta foto AR e condividi la tua esperienza.',
    popup: 'Cattura momenti unici con la fotocamera AR e condividi le tue avventure con amici e familiari.'
  },
  {
    icon: <Users className="w-6 h-6 text-yellow-300 mr-2" />,
    title: 'Tour di Gruppo',
    description: 'Partecipa a tour guidati virtuali con altri utenti.',
    popup: 'Unisciti a tour di gruppo, interagisci con altri visitatori e vivi esperienze condivise in realtà aumentata.'
  },
];


export const TourARWidget = () => {
  const [selected, setSelected] = useState<number|null>(null);

  return (
    <section className="relative p-4 md:p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 rounded-2xl shadow-xl border-gray-200 flex flex-col md:flex-row items-center justify-between overflow-hidden min-h-[220px] md:min-h-[180px] col-span-2 bg-dark-300/50 backdrop-blur-sm card-glow border-white/10">
      {/* Decorative AR Icon */}
      <div className="flex flex-col items-center md:items-start md:w-2/3 z-10">
        <div className="flex items-center mb-2">
          <Glasses className="w-10 h-10 text-white drop-shadow-lg mr-3" />
          <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-semibold tracking-wide">Coming Soon</span>
        </div>
        <h2 className="text-xl md:text-2xl font-heading font-bold mb-1 text-white drop-shadow">Augmented Reality Tourist Guide</h2>
        <p className="text-white/90 mb-2 text-base max-w-xl">
          Presto potrai esplorare Civitanova Marche con tour interattivi in realtà aumentata! Scopri monumenti, storie e curiosità direttamente dal tuo smartphone, per un&apos;esperienza immersiva e innovativa.
        </p>
        <ul className="w-full max-w-lg mb-2">
          {features.map((f, i) => (
            <li key={f.title} className="mb-1">
              <button
                className="w-full flex items-center bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 font-medium shadow transition-all text-sm"
                onClick={() => setSelected(i)}
              >
                {f.icon}
                <span className="flex-1 text-left">{f.title}</span>
                <span className="ml-2 text-xs text-white/70 hidden md:inline">{f.description}</span>
              </button>
            </li>
          ))}
        </ul>
        <button className="mt-1 px-4 py-2 bg-white text-indigo-700 font-semibold rounded-lg shadow hover:bg-indigo-50 transition-all text-sm">
          Scopri di più
        </button>
      </div>
      {/* AR Preview/Mockup */}
      <div className="hidden md:flex md:w-1/3 justify-center items-center">
        <div className="aspect-[4/3] w-32 bg-white/10 rounded-xl flex items-center justify-center border-2 border-white/30 shadow-inner">
          <span className="text-white/70 text-center text-sm px-2">Anteprima AR<br />Video demo e dettagli in arrivo</span>
        </div>
      </div>
      {/* Gradient overlay for premium look */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/10 pointer-events-none rounded-2xl" />

      {/* Popup */}
      {selected !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setSelected(null)}
              aria-label="Chiudi"
            >
              ×
            </button>
            <div className="flex items-center mb-3">
              {features[selected].icon}
              <h3 className="ml-2 text-lg font-heading font-bold text-indigo-700">{features[selected].title}</h3>
            </div>
            <p className="text-gray-700 mb-2 font-medium text-sm">{features[selected].popup}</p>
          </div>
        </div>
      )}
    </section>
  );
}
