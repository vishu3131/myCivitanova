import React, { useState } from 'react';

interface WasteReportFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const WasteReportForm: React.FC<WasteReportFormProps> = ({ onClose, onSubmit }) => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ issueType, description, location, photo });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[99999]">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Segnala un Problema Rifiuti</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="issueType" className="block text-sm font-medium text-gray-300">Tipo di Problema</label>
            <select
              id="issueType"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleziona un tipo</option>
              <option value="Abbandono">Abbandono di rifiuti</option>
              <option value="Mancata Raccolta">Mancata raccolta</option>
              <option value="Contenitore Danneggiato">Contenitore danneggiato</option>
              <option value="Altro">Altro</option>
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Descrizione</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descrivi il problema in dettaglio..."
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300">Posizione</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Es: Via Roma, 10"
              required
            />
          </div>
          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-300">Allega Foto (Opzionale)</label>
            <input
              type="file"
              id="photo"
              onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Invia Segnalazione
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WasteReportForm;