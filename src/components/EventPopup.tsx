"use client";
import React from 'react';
import Image from 'next/image';
import { X, Calendar, MapPin, Users, Tag, Info, Ticket } from 'lucide-react';

const EventPopup = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-dark-300 rounded-2xl overflow-hidden shadow-lg max-w-md w-full border border-dark-100 animate-fade-in-up">
        <div className="relative">
          <Image src={event.image} alt={event.title} width={500} height={250} className="w-full h-48 object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2 font-heading">{event.title}</h2>
          
          <div className="flex items-center text-accent mb-4">
            <Tag size={16} className="mr-2" />
            <span className="font-medium">{event.category}</span>
          </div>

          <div className="space-y-3 text-textSecondary">
            <div className="flex items-start">
              <Calendar size={18} className="mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">{event.date}</p>
                <p className="text-sm">{event.time}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin size={18} className="mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">{typeof event.position === 'string' ? event.position : event.position.name}</p>
                {typeof event.position !== 'string' && <p className="text-sm">{event.position.address}</p>}
              </div>
            </div>
            <div className="flex items-center">
              <Users size={18} className="mr-3 flex-shrink-0" />
              <p><span className="text-white font-semibold">{event.participants}</span> iscritti</p>
            </div>
            <div className="flex items-center">
              <Ticket size={18} className="mr-3 flex-shrink-0" />
              <p className="text-white font-semibold">{event.price}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-dark-100 pt-4">
            <div className="flex items-center text-lg text-white mb-2">
              <Info size={20} className="mr-2 text-accent" />
              <h3 className="font-semibold">Descrizione</h3>
            </div>
            <p className="text-textSecondary text-sm leading-relaxed">{event.description}</p>
          </div>
        </div>
        <div className="bg-dark-200 px-6 py-4 flex justify-end">
            <button 
                onClick={onClose}
                className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-dark transition-transform transform hover:scale-105"
            >
                Chiudi
            </button>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;