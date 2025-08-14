"use client";

import React from 'react';
import { ShoppingActivityCard } from '@/components/ShoppingActivityCard';
import HeliotropeCard from '@/components/explore/HeliotropeCard';

const mockShoppingActivities = [
  {
    id: 1,
    name: 'Boutique Eleganza',
    category: 'shopping',
    subcategory: 'shopping',
    image: '/images/boutique-eleganza.jpg',
    rating: 4.8,
    reviews: 120,
    distance: '2.5 km',
    time: '10-20 min',
    description: 'Abbigliamento di alta moda e accessori esclusivi.',
    address: 'Via Roma, 10',
    openingHours: 'Lun-Sab: 10:00-19:00',
    tags: ['moda', 'lusso', 'accessori'],
    priceRange: '€€€',
    phone: '+39 0733 123456',
    website: 'www.boutiqueeleganza.it',
    features: ['Wi-Fi gratuito', 'Parcheggio', 'Accesso disabili', 'Camerini ampi'],
  },
];

export default function ShoppingPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Shopping & Attività</h1>
      
      <h2 className="text-2xl font-bold mb-4 text-center">In Evidenza</h2>
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-sm">
          <HeliotropeCard />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center">Altre Attività</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockShoppingActivities.map((activity) => (
          <ShoppingActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}
