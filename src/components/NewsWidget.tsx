"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

interface NewsItemProps {
  title: string;
  time: string;
  category: string;
  categoryColor: string;
  image?: string;
}

function NewsItem({ title, time, category, categoryColor, image }: NewsItemProps) {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-dark-300/50 transition-colors cursor-pointer">
      {image && (
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <Image src={image} alt={title} className="w-full h-full object-cover" fill sizes="64px" />
        </div>
      )}
      <div className="flex-1">
        <div className={`text-xs font-medium ${categoryColor} mb-1 inline-block px-2 py-0.5 rounded-full bg-opacity-20`}>
          {category}
        </div>
        <h3 className="text-white font-medium leading-tight">{title}</h3>
        <div className="flex items-center text-textSecondary text-xs mt-1">
          <Clock size={12} className="mr-1" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

export function NewsWidget() {
  return (
    <div className="bg-dark-300 rounded-xl p-5 card-glow border border-dark-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-heading font-medium text-white">Ultime notizie</h2>
        <Link href="/news" className="text-accent text-sm font-medium flex items-center hover:underline">
          <span>Tutte le news</span>
          <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>
      
      <div className="space-y-3">
        <NewsItem 
          title="Nuova area pedonale inaugurata nel centro storico" 
          time="2 ore fa" 
          category="Urbanistica" 
          categoryColor="text-blue-400"
          image="https://source.unsplash.com/random/200x200/?pedestrian,area"
        />
        <NewsItem 
          title="Calendario eventi estivi: pubblicato il programma completo" 
          time="5 ore fa" 
          category="Eventi" 
          categoryColor="text-purple-400"
        />
        <NewsItem 
          title="Lavori in corso: chiusura temporanea di Via Roma" 
          time="1 giorno fa" 
          category="Viabilità" 
          categoryColor="text-yellow-400"
        />
        <NewsItem 
          title="Nuovi orari per gli uffici comunali a partire da Settembre" 
          time="2 giorni fa" 
          category="Servizi" 
          categoryColor="text-green-400"
        />
      </div>
    </div>
  );
};