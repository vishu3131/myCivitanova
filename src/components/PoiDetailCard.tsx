'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Phone, Globe } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Define the type for a POI
interface Poi {
  id: number;
  name: string;
  category: string;
  position: [number, number];
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
}

interface PoiDetailCardProps {
  poi: Poi | null;
  onClose: () => void;
  onNavigate?: (poi: Poi) => void;
}

const PoiDetailCard: React.FC<PoiDetailCardProps> = ({ poi, onClose, onNavigate }) => {
  const [cardSize, setCardSize] = useState<'small' | 'large'>('small');
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0.2]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reset to small view when the POI changes
    if (poi) {
      setCardSize('small');
    }
  }, [poi]);

  const toggleSize = () => {
    setCardSize(prev => prev === 'small' ? 'large' : 'small');
  };

  const cardHeight = {
    small: '45vh',
    large: '85vh'
  };

  return (
    <AnimatePresence>
      {poi && (
        <motion.div
          className="fixed inset-0 z-[1001]"
          style={{ opacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

          {/* Card */}
          <motion.div
            ref={containerRef}
            className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl rounded-t-3xl shadow-2xl"
            style={{ height: cardHeight[cardSize], y }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 300 }}
            dragElastic={{ top: 0.05, bottom: 0.2 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 500 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          >
            {/* Grabber Handle */}
            <div className="w-full flex justify-center pt-3 cursor-pointer" onClick={toggleSize}>
              <div className="w-12 h-1.5 bg-gray-400 rounded-full"></div>
            </div>

            {/* Content */}
            <div className="p-5 h-full overflow-y-auto">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-2xl font-bold text-gray-900">{poi?.name}</h2>
                <button onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full text-gray-700 hover:bg-gray-200/60">
                  <X size={24} />
                </button>
              </div>

              {poi?.imageUrl && (
                <div className="my-4 rounded-xl overflow-hidden shadow-lg">
                  <Image src={poi.imageUrl} alt={poi.name} width={800} height={400} className="w-full h-48 object-cover" />
                </div>
              )}

              <div className="space-y-4 text-gray-700">
                <p>{poi?.description}</p>

                {poi?.address && (
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-3 text-gray-500 flex-shrink-0" />
                    <span>{poi.address}</span>
                  </div>
                )}

                {poi?.phone && (
                  <div className="flex items-center">
                    <Phone size={18} className="mr-3 text-gray-500 flex-shrink-0" />
                    <a href={`tel:${poi.phone}`} className="text-blue-600 hover:underline">{poi.phone}</a>
                  </div>
                )}

                {poi?.website && (
                  <div className="flex items-center">
                    <Globe size={18} className="mr-3 text-gray-500 flex-shrink-0" />
                    <a href={poi.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Visita il sito web</a>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-gray-300/80">
                <h3 className="font-semibold text-gray-800 mb-3">Indicazioni</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="w-full bg-black text-white font-bold py-3 px-4 rounded-xl hover:bg-black/90 transition-all shadow-md"
                    onClick={() => onNavigate?.(poi!)}
                  >
                    Anteprima percorso
                  </button>
                  <button 
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all shadow-md"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${poi?.position[0]},${poi?.position[1]}`, '_blank')}
                  >
                    Apri in Maps
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PoiDetailCard;
