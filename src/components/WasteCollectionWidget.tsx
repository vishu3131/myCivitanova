import { useState } from 'react';
import ReactDOM from 'react-dom';
import WasteReportForm from './WasteReportForm';

export function WasteCollectionWidget() {
  const [showReportForm, setShowReportForm] = useState(false);

  const handleReportSubmit = (data) => {
    console.log('Dati segnalazione:', data);
    alert('Segnalazione inviata con successo!');
  };

  return (
    <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-4 card-glow border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Gestione Rifiuti</h3>
        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
          <span className="text-xs text-blue-400">🗑️</span>
        </div>
      </div>
      <p className="text-white/70 text-xs mb-3">Segnala problemi o consulta il calendario della raccolta differenziata.</p>
      <div className="flex flex-row space-x-1 mt-3 flex-nowrap">
        <button
          onClick={() => window.open('https://cosmariambiente.it/wp-content/uploads/2025/03/cosmari-calendario-2025-civitanova-marche.pdf', '_blank')}
          className="flex items-center justify-center py-1 bg-blue-600/30 rounded-full text-blue-300 hover:bg-blue-600/50 transition-colors shadow-lg flex-grow"
        >
          <span className="text-[10px] mr-0.5">🗓️</span>
               <span className="text-[6px] font-medium whitespace-nowrap">Calendario</span>
        </button>
        <button
          onClick={() => setShowReportForm(true)}
          className="flex items-center justify-center py-1 bg-red-600/30 rounded-full text-red-300 hover:bg-red-600/50 transition-colors shadow-lg flex-grow"
        >
          <span className="text-[10px] mr-0.5">🚨</span>
               <span className="text-[6px] font-medium whitespace-nowrap">Segnala</span>
        </button>
      </div>

      {showReportForm && ReactDOM.createPortal(
        <WasteReportForm
          onClose={() => setShowReportForm(false)}
          onSubmit={handleReportSubmit}
        />,
        document.body
      )}
    </div>
  );
}