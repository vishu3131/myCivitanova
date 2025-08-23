'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Navigation } from 'lucide-react';

interface Poi {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  position?: [number, number]; // This is constructed on the fly
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  audio_url?: string;
  icon_3d_url?: string;
}

const PoiManagement = () => {
  const [pois, setPois] = useState<Poi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);

  useEffect(() => {
    fetchPois();
  }, []);

  const fetchPois = async () => {
    try {
      const response = await fetch('/api/pois');
      if (!response.ok) {
        throw new Error('Failed to fetch POIs');
      }
      const data = await response.json();
      setPois(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedPoi(null);
    setIsModalOpen(true);
  };

  const handleEdit = (poi: Poi) => {
    setSelectedPoi(poi);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this POI?')) {
      try {
        const response = await fetch('/api/pois', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete POI');
        }
        fetchPois(); // Refresh list
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleSave = async (formData: Omit<Poi, 'id' | 'position' | 'latitude' | 'longitude'> & { id?: string, latitude: number, longitude: number }) => {
    const { id, latitude, longitude, ...rest } = formData;
    const poiData = { ...rest, position: [latitude, longitude] as [number, number] };

    const url = id ? `/api/pois` : '/api/pois';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...poiData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save POI`);
      }
      
      fetchPois();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Elenco Punti di Interesse</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Aggiungi POI
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Nome</th>
              <th className="py-2 px-4 border-b">Categoria</th>
              <th className="py-2 px-4 border-b">Indirizzo</th>
              <th className="py-2 px-4 border-b">AR</th>
              <th className="py-2 px-4 border-b">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {pois.map(poi => (
              <tr key={poi.id}>
                <td className="py-2 px-4 border-b">{poi.name}</td>
                <td className="py-2 px-4 border-b">{poi.category}</td>
                <td className="py-2 px-4 border-b">{poi.address}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex space-x-1">
                    {poi.audio_url && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded" title="Audio disponibile">🎵</span>
                    )}
                    {poi.icon_3d_url && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded" title="Icona 3D disponibile">🎯</span>
                    )}
                    {!poi.audio_url && !poi.icon_3d_url && (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4 border-b">
                  <div className="flex space-x-2 items-center">
                    <button onClick={() => handleEdit(poi)} className="text-blue-500 hover:text-blue-700" title="Modifica">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(poi.id)} className="text-red-500 hover:text-red-700" title="Elimina">
                      <Trash2 size={18} />
                    </button>
                    {/* Apri direttamente sulla mappa */}
                    <a
                      href={`/mappa?focus=${encodeURIComponent(poi.latitude + ',' + poi.longitude)}&name=${encodeURIComponent(poi.name)}`}
                      className="text-green-600 hover:text-green-800"
                      title="Apri in Mappa"
                    >
                      <MapPin size={18} />
                    </a>
                    {/* Anteprima percorso da posizione utente (se consentito) */}
                    <a
                      href={`/mappa?route=${encodeURIComponent(poi.latitude + ',' + poi.longitude)}&name=${encodeURIComponent(poi.name)}`}
                      className="text-gray-700 hover:text-black"
                      title="Anteprima percorso"
                    >
                      <Navigation size={18} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <PoiFormModal
          poi={selectedPoi}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

interface PoiFormModalProps {
  poi: Poi | null;
  onClose: () => void;
  onSave: (formData: Omit<Poi, 'id' | 'position' | 'latitude' | 'longitude'> & { id?: string, latitude: number, longitude: number }) => void;
}

const PoiFormModal: React.FC<PoiFormModalProps> = ({ poi, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: poi?.name || '',
        category: poi?.category || '',
        description: poi?.description || '',
        address: poi?.address || '',
        phone: poi?.phone || '',
        website: poi?.website || '',
        imageUrl: poi?.imageUrl || '',
        audio_url: poi?.audio_url || '',
        icon_3d_url: poi?.icon_3d_url || '',
        latitude: poi?.latitude || 0,
        longitude: poi?.longitude || 0,
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: poi?.id, ...formData });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{poi ? 'Modifica POI' : 'Aggiungi POI'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome" className="w-full p-2 border rounded" required />
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Categoria" className="w-full p-2 border rounded" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descrizione" className="w-full p-2 border rounded" />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Indirizzo" className="w-full p-2 border rounded" />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Telefono" className="w-full p-2 border rounded" />
          <input name="website" value={formData.website} onChange={handleChange} placeholder="Sito Web" className="w-full p-2 border rounded" />
          <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="URL Immagine" className="w-full p-2 border rounded" />
          
          {/* Campi AR */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Configurazione AR</h3>
            <input name="audio_url" value={formData.audio_url} onChange={handleChange} placeholder="URL Audio per AR (opzionale)" className="w-full p-2 border rounded mb-2" />
            <input name="icon_3d_url" value={formData.icon_3d_url} onChange={handleChange} placeholder="URL Icona 3D per AR (opzionale)" className="w-full p-2 border rounded" />
            <p className="text-sm text-gray-500 mt-2">Questi campi sono utilizzati per l'esperienza AR. L'audio verrà riprodotto quando l'utente interagisce con il POI in AR.</p>
          </div>
          
          <div className="flex space-x-4">
            <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleNumberChange} placeholder="Latitudine" className="w-full p-2 border rounded" required />
            <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleNumberChange} placeholder="Longitudine" className="w-full p-2 border rounded" required />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Salva</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PoiManagement;
