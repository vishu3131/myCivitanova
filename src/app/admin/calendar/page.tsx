"use client";

import React, { useState } from 'react';
import AppLayout from "@/components/admin/AppLayout";
import { useAuthWithRole } from "@/hooks/useAuthWithRole";
import { Shield, Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CalendarPage() {
  const { user, role, loading } = useAuthWithRole();
  const [currentDate, setCurrentDate] = useState(new Date());

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Caricamento...</span>
        </div>
      </AppLayout>
    );
  }

  if (!user || !['admin', 'moderator'].includes(role)) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Accesso Negato</h2>
          <p className="text-gray-400">Non hai i permessi per accedere a questa sezione</p>
        </div>
      </AppLayout>
    );
  }

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const daysOfWeek = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust for Monday start

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);

  // Mock events
  const events = {
    5: [{ title: "Consiglio Comunale", time: "18:00", type: "meeting" }],
    12: [{ title: "Festa del Paese", time: "10:00", type: "event" }],
    18: [{ title: "Mercato Settimanale", time: "08:00", type: "market" }],
    25: [{ title: "Concerto in Piazza", time: "21:00", type: "event" }],
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Calendario Eventi</h1>
            <p className="text-gray-400">Visualizza e gestisci il calendario degli eventi</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Nuovo Evento
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <h2 className="text-xl font-semibold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 border border-gray-700 rounded-lg ${
                  day ? 'bg-gray-900 hover:bg-gray-700 cursor-pointer' : 'bg-gray-800'
                } transition-colors`}
              >
                {day && (
                  <>
                    <div className="text-white font-medium mb-1">{day}</div>
                    {events[day as keyof typeof events] && (
                      <div className="space-y-1">
                        {events[day as keyof typeof events].map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className={`text-xs p-1 rounded text-white ${
                              event.type === 'meeting' ? 'bg-blue-500/20 border border-blue-500/30' :
                              event.type === 'event' ? 'bg-purple-500/20 border border-purple-500/30' :
                              'bg-green-500/20 border border-green-500/30'
                            }`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-gray-300">{event.time}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Legenda</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/30 rounded"></div>
              <span className="text-sm text-gray-400">Riunioni</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/30 rounded"></div>
              <span className="text-sm text-gray-400">Eventi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/20 border border-green-500/30 rounded"></div>
              <span className="text-sm text-gray-400">Mercati</span>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Prossimi Eventi</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <div className="text-white font-medium">Consiglio Comunale</div>
                <div className="text-sm text-gray-400">5 Marzo 2024 - 18:00</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="flex-1">
                <div className="text-white font-medium">Festa del Paese</div>
                <div className="text-sm text-gray-400">12 Marzo 2024 - 10:00</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <div className="text-white font-medium">Mercato Settimanale</div>
                <div className="text-sm text-gray-400">18 Marzo 2024 - 08:00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}