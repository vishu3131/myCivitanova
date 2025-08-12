"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Image, Film, PlusSquare, Trash2, Edit, Loader } from 'lucide-react';
import { SiteImage, SiteImageSection } from '@/lib/database';

interface SiteImageSectionWithImages extends SiteImageSection {
  images: SiteImage[];
}

const SiteImageManagementPage = () => {
  const [sections, setSections] = useState<SiteImageSectionWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImageSections = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/site-images');
      if (!response.ok) {
        throw new Error('Failed to fetch image sections');
      }
      const data = await response.json();
      setSections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImageSections();
  }, [fetchImageSections]);

  const handleAddImage = async (sectionId: string) => {
    // Implementare la logica per aggiungere un'immagine, probabilmente con un modale
    console.log("Aggiungi immagine alla sezione:", sectionId);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa immagine?')) return;

    try {
      const response = await fetch(`/api/site-images?id=${imageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      fetchImageSections(); // Ricarica i dati
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-red-500 text-center">
          Errore: {error}. Assicurati che le tabelle del database `site_image_sections` e `site_images` esistano.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestione Immagini Sito</h1>
          <button className="btn btn-primary">
            <PlusSquare className="mr-2" /> Aggiungi Sezione
          </button>
        </header>

        <div className="space-y-12">
          {sections.map(section => (
            <section key={section.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{section.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`badge ${section.type === 'carousel' ? 'badge-info' : 'badge-success'}`}>
                    {section.type === 'carousel' ? <Film size={14} className="mr-1" /> : <Image size={14} className="mr-1" />}
                    {section.type}
                  </span>
                  <button className="btn btn-sm btn-ghost"><Edit size={14} /></button>
                </div>
              </div>
              
              <div className={`grid gap-4 ${section.type === 'carousel' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
                {section.images.map(image => (
                  <div key={image.id} className="relative group">
                    <img src={image.image_url} alt={image.alt_text || ''} className="w-full h-48 object-cover rounded-md" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="btn btn-sm btn-outline text-white"><Edit size={14} /> Cambia</button>
                      <button onClick={() => handleDeleteImage(image.id)} className="btn btn-sm btn-error"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                 <div onClick={() => handleAddImage(section.id)} className="flex items-center justify-center border-2 border-dashed rounded-md h-48 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="text-center">
                        <PlusSquare className="mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500">Aggiungi</p>
                    </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SiteImageManagementPage;