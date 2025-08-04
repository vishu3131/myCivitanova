"use client";

import React from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

interface EventProps {
  title: string;
  date: string;
  location: string;
  attendees: number;
  image: string;
}

function Event({ title, date, location, attendees, image }: EventProps) {
  return (
    <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-dark-300/50 transition-colors cursor-pointer">
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <Image src={image} alt={title} className="w-full h-full object-cover" fill sizes="64px" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate">{title}</h3>
        <div className="flex items-center text-textSecondary text-xs mt-1">
          <Calendar size={12} className="mr-1" />
          <span className="truncate">{date}</span>
        </div>
        <div className="flex items-center text-textSecondary text-xs mt-1">
          <MapPin size={12} className="mr-1" />
          <span className="truncate">{location}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center text-textSecondary text-xs">
          <Users size={12} className="mr-1" />
          <span>{attendees}</span>
        </div>
      </div>
    </div>
  );
}

export function EventsWidget() {
  const events = [
    {
      title: "Festival del Mare",
      date: "15 Agosto, 18:00",
      location: "Porto turistico",
      attendees: 156,
      image: "https://source.unsplash.com/random/200x200/?festival,sea"
    },
    {
      title: "Mostra d'Arte Contemporanea",
      date: "20 Agosto - 5 Settembre",
      location: "Palazzo Comunale",
      attendees: 89,
      image: "https://source.unsplash.com/random/200x200/?art,exhibition"
    },
    {
      title: "Concerto in Piazza",
      date: "22 Agosto, 21:30",
      location: "Piazza XX Settembre",
      attendees: 210,
      image: "https://source.unsplash.com/random/200x200/?concert,square"
    }
  ];

  return (
    <div className="bg-dark-300 rounded-xl p-5 card-glow border border-dark-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-heading font-medium text-white">Eventi in programma</h2>
        <button className="text-accent text-sm font-medium flex items-center hover:underline">
          <span>Vedi tutti</span>
          <ArrowRight size={14} className="ml-1" />
        </button>
      </div>
      
      <div className="space-y-3">
        {events.map((event, index) => (
          <Event key={index} {...event} />
        ))}
      </div>
    </div>
  );
};