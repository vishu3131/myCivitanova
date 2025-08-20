import { useState } from 'react';
import ReactDOM from 'react-dom';
import { createClient } from '@supabase/supabase-js';
import WasteReportForm, { WasteReportData } from './WasteReportForm';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function WasteCollectionWidget() {
  const [showReportForm, setShowReportForm] = useState(false);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `waste-reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Errore upload foto:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Errore durante l\'upload:', error);
      return null;
    }
  };

  const handleReportSubmit = async (data: WasteReportData): Promise<void> => {
    try {
      let photoUrl: string | null = null;
      
      // Upload foto se presente
      if (data.photo) {
        photoUrl = await uploadPhoto(data.photo);
      }

      // Ottieni l'utente corrente
      const { data: { user } } = await supabase.auth.getUser();

      // Inserisci la segnalazione nel database
      const { error } = await supabase
        .from('waste_reports')
        .insert({
          issue_type: data.issueType,
          description: data.description,
          location: data.location,
          photo_url: photoUrl,
          reporter_id: user?.id || null,
          reporter_email: data.reporterEmail,
          reporter_phone: data.reporterPhone,
          status: 'pending',
          priority: 'medium'
        });

      if (error) {
        console.error('Errore inserimento segnalazione:', error);
        throw new Error('Errore durante il salvataggio della segnalazione');
      }

      // Mostra messaggio di successo
      alert('Segnalazione inviata con successo! Riceverai aggiornamenti sullo stato.');
    } catch (error) {
      console.error('Errore durante l\'invio:', error);
      throw error; // Rilancia l'errore per gestirlo nel form
    }
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