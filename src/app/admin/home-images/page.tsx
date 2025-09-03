"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { PlusCircle, Trash2, Image as ImageIcon, Link as LinkIcon, UploadCloud } from 'lucide-react';

interface HomeImage {
  id: number;
  url: string;
  source: string;
  isInCarousel: boolean;
  duration: number;
}

const HomeImageManagementPage = () => {
  const [images, setImages] = useState<HomeImage[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch('/api/home-images');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const addImage = useCallback(async (url: string, source: 'link' | 'upload') => {
    try {
      await fetch('/api/home-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, source }),
      });
      fetchImages();
    } catch (error) {
      console.error("Error adding image:", error);
    }
  }, [fetchImages]);

  const updateImage = async (id: number, updates: Partial<Omit<HomeImage, 'id' | 'url' | 'source'>>) => {
    try {
      await fetch('/api/home-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      fetchImages();
    } catch (error) {
      console.error("Error updating image:", error);
    }
  };

  const deleteImage = async (id: number) => {
    try {
      await fetch(`/api/home-images?id=${id}`, { method: 'DELETE' });
      fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    addImage(imageUrl, 'link');
    setImageUrl('');
  };

  const handleFileDrop = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    
    // Simula l'upload e ottiene un URL. In un'app reale, useresti un servizio di storage.
    const uploadedUrl = `/uploads/simulated/${Date.now()}-${file.name}`;
    
    // Qui dovresti implementare la logica di upload effettiva
    // Esempio:
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch('/api/upload', { method: 'POST', body: formData });
    // const { url: uploadedUrl } = await response.json();

    addImage(uploadedUrl, 'upload');
    setIsUploading(false);
  }, [addImage]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileDrop(e.dataTransfer.files);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestione Immagini Home</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Colonna per Aggiungere Immagini */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Aggiungi Nuova Immagine</h2>
          
          {/* Aggiungi da URL */}
          <form onSubmit={handleUrlSubmit} className="flex items-center gap-2 mb-6">
            <LinkIcon className="text-gray-400" />
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input input-bordered w-full dark:bg-gray-700 dark:text-white"
              placeholder="Incolla URL immagine..."
            />
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={18} /> Aggiungi
            </button>
          </form>

          {/* Upload con Drag & Drop */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}
          >
            <input 
              type="file" 
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => e.target.files && handleFileDrop(e.target.files)}
              accept="image/*"
            />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-primary">Trascina un&apos;immagine</span> o clicca per caricarla
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF fino a 10MB</p>
            {isUploading && <p className="text-sm text-primary mt-2">Caricamento...</p>}
          </div>
        </div>
      </div>

      {/* Griglia Immagini Caricate */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Immagini Caricate</h2>
        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div key={image.id} className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-transform hover:scale-105">
                <figure className="relative h-48">
                  <Image src={image.url} alt={`Immagine ${image.id}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
                  <div className="absolute top-2 right-2 badge badge-primary">{image.source}</div>
                </figure>
                <div className="card-body p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Nel carosello?</span>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={image.isInCarousel}
                      onChange={(e) => updateImage(image.id, { isInCarousel: e.target.checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor={`duration-${image.id}`} className="font-semibold text-sm text-gray-700 dark:text-gray-300">Durata (sec)</label>
                    <input
                      id={`duration-${image.id}`}
                      type="number"
                      min="1"
                      value={image.duration}
                      onChange={(e) => updateImage(image.id, { duration: parseInt(e.target.value, 10) || 1 })}
                      className="input input-bordered input-sm w-20 text-center dark:bg-gray-700"
                      disabled={!image.isInCarousel}
                    />
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <button onClick={() => deleteImage(image.id)} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50">
                      <Trash2 size={16} /> Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <ImageIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Nessuna immagine trovata</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Inizia aggiungendo un URL o caricando un file.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeImageManagementPage;