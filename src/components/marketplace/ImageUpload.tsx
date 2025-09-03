'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { uploadListingImage, deleteListingImage } from '@/services/marketplace';
import type { ListingImage } from '@/types/marketplace';

interface ImageUploadProps {
  listingId?: string;
  images: ListingImage[];
  onImagesChange: (images: ListingImage[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
}

interface UploadProgress {
  file: File;
  progress: number;
  error?: string;
}

export default function ImageUpload({
  listingId,
  images,
  onImagesChange,
  maxImages = 10,
  maxSizeInMB = 5
}: ImageUploadProps) {
  const [uploading, setUploading] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Il file deve essere un\'immagine';
    }
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `Il file deve essere inferiore a ${maxSizeInMB}MB`;
    }
    return null;
  }, [maxSizeInMB]);

  const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      alert(`Puoi caricare massimo ${maxImages} immagini`);
      return;
    }

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Initialize upload progress
    const uploadProgressArray: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0
    }));
    setUploading(uploadProgressArray);

    const newImages: ListingImage[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      try {
        // Update progress
        setUploading(prev => prev.map((item, index) => 
          index === i ? { ...item, progress: 25 } : item
        ));

        // Compress image
        const compressedFile = await compressImage(file);
        
        setUploading(prev => prev.map((item, index) => 
          index === i ? { ...item, progress: 50 } : item
        ));

        if (listingId) {
          // Upload to server if listing exists
          const uploadedImage = await uploadListingImage(listingId, compressedFile);
          newImages.push(uploadedImage);
        } else {
          // Create temporary image object for preview
          const tempImage: ListingImage = {
            id: `temp-${Date.now()}-${i}`,
            listing_id: '',
            url: URL.createObjectURL(compressedFile),
            position: images.length + newImages.length,
            created_at: new Date().toISOString(),
            file: compressedFile // Store file for later upload
          };
          newImages.push(tempImage);
        }

        setUploading(prev => prev.map((item, index) => 
          index === i ? { ...item, progress: 100 } : item
        ));
      } catch (error) {
        console.error('Upload error:', error);
        setUploading(prev => prev.map((item, index) => 
          index === i ? { ...item, error: 'Errore durante il caricamento' } : item
        ));
      }
    }

    // Update images list
    onImagesChange([...images, ...newImages]);
    
    // Clear upload progress after a delay
    setTimeout(() => {
      setUploading([]);
    }, 2000);
  }, [images, listingId, maxImages, onImagesChange, validateFile]);

  const handleRemoveImage = async (imageId: string) => {
    try {
      if (imageId.startsWith('temp-')) {
        // Remove temporary image
        const updatedImages = images.filter(img => img.id !== imageId);
        onImagesChange(updatedImages);
      } else {
        // Delete from server
        await deleteListingImage(imageId);
        const updatedImages = images.filter(img => img.id !== imageId);
        onImagesChange(updatedImages);
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Errore durante la rimozione dell\'immagine');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input value
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Trascina le immagini qui o clicca per selezionare
        </p>
        <p className="text-sm text-gray-500">
          Massimo {maxImages} immagini, {maxSizeInMB}MB ciascuna
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Formati supportati: JPG, PNG, WebP
        </p>
      </div>

      {/* Upload Progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Caricamento in corso...</h4>
          {uploading.map((upload, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {upload.file.name}
                </span>
                {upload.error && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">{upload.error}</span>
                  </div>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    upload.error ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={image.url}
                    alt={`Immagine ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                    onError={(e) => {
                      // next/image non espone direttamente l'evento, ma manteniamo placeholder tramite fallback dei dati
                    }}
                    unoptimized
                  />
                </div>
              </div>
              
              {/* Remove button */}
              <button
                onClick={() => handleRemoveImage(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Rimuovi immagine"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Position indicator */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="text-sm text-gray-500">
        {images.length} di {maxImages} immagini caricate
      </div>
    </div>
  );
}