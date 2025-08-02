"use client";

import React, { useState } from 'react';

export function ARTeaserSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-dark-200 to-accent/80 rounded-xl overflow-hidden relative card-glow border border-dark-100">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-20">
          <div className="w-full h-full bg-contain bg-no-repeat bg-right" style={{ backgroundImage: "url('https://cdn-icons-png.flaticon.com/512/2271/2271068.png')" }}></div>
        </div>
        
        <div className="p-6 md:p-8 relative z-10">
          <div className="inline-block bg-[#E76F51] text-white text-xs font-medium px-2 py-1 rounded-full mb-4">
            Coming Soon
          </div>
          
          <h2 className="text-white text-2xl md:text-3xl font-heading font-bold mb-2">
            Realtà Aumentata
          </h2>
          
          <p className="text-white/80 max-w-lg mb-6">
            Scopri Civitanova Marche attraverso la tua fotocamera. Punta il telefono verso monumenti, 
            luoghi d&apos;interesse e scopri informazioni, storia e curiosità in tempo reale.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              className="bg-accent text-black font-medium py-2.5 px-6 rounded-lg flex items-center hover:bg-opacity-90 transition-colors"
              onClick={openModal}
            >
              <span>Scopri di più</span>
              <span className="ml-2 text-lg">→</span>
            </button>
            
            <button className="bg-dark-200 backdrop-blur-sm text-white font-medium py-2.5 px-6 rounded-lg flex items-center hover:bg-dark-100 transition-colors">
              <span className="mr-2 text-lg">🔔</span>
              <span>Ricevi notifica al lancio</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[#264653] text-xl font-heading font-bold">
                  Realtà Aumentata - Anteprima
                </h3>
                <button 
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>
              
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                <img 
                  src="https://cdn.dribbble.com/users/1197989/screenshots/5585685/media/af6d6cedf4b7fb39eb454a5d5e6f8a4b.gif" 
                  alt="AR Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h4 className="text-[#264653] font-medium mb-2">Funzionalità in arrivo:</h4>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-[#2A9D8F] mr-2">✓</span>
                  <span>Riconoscimento automatico di monumenti e luoghi d&apos;interesse</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#2A9D8F] mr-2">✓</span>
                  <span>Informazioni storiche e culturali in tempo reale</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#2A9D8F] mr-2">✓</span>
                  <span>Tour guidati in realtà aumentata</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#2A9D8F] mr-2">✓</span>
                  <span>Caccia al tesoro e giochi interattivi nella città</span>
                </li>
              </ul>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="text-[#264653] font-medium mb-2">Timeline di rilascio:</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#2A9D8F] mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Fase Beta</p>
                      <p className="text-xs text-gray-500">Settembre 2023</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#F4A261] mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lancio Ufficiale</p>
                      <p className="text-xs text-gray-500">Dicembre 2023</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#E76F51] mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Funzionalità Avanzate</p>
                      <p className="text-xs text-gray-500">Primavera 2024</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  className="bg-[#0077BE] text-white font-medium py-2 px-4 rounded-lg"
                  onClick={closeModal}
                >
                  Ho capito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}