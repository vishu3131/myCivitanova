"use client";

import React, { useState } from 'react';
import { StatusBar } from './StatusBar';
import { BottomNavbar } from './BottomNavbar';
import { BusScheduleWidget } from './BusScheduleWidget';
import { ArrowLeft, Search, FileText, CreditCard, Phone, MapPin, Clock, ChevronRight, AlertCircle, Bus, Navigation, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

const serviceCategories = [
  { id: 'all', label: 'Tutti', count: 20 },
  { id: 'documents', label: 'Documenti', count: 6 },
  { id: 'payments', label: 'Pagamenti', count: 4 },
  { id: 'transport', label: 'Trasporti', count: 2 },
  { id: 'other-numbers', label: 'Altri Numeri', count: 8 },
];

const services = [
  {
    id: 1,
    title: 'Certificato di Residenza',
    category: 'documents',
    icon: FileText,
    description: 'Richiedi online il certificato di residenza',
    status: 'available',
    time: '2-3 giorni',
    cost: '€2.50',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    title: 'Pagamento Tasse',
    category: 'payments',
    icon: CreditCard,
    description: 'Paga le tasse comunali online',
    status: 'available',
    time: 'Immediato',
    cost: 'Variabile',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    title: 'Numero Verde',
    category: 'emergency',
    icon: Phone,
    description: 'Assistenza telefonica 24/7',
    status: 'available',
    time: 'Immediato',
    cost: 'Gratuito',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 4,
    title: 'Segnalazione Guasti',
    category: 'emergency',
    icon: AlertCircle,
    description: 'Segnala problemi su strade e illuminazione',
    status: 'available',
    time: '1-2 giorni',
    cost: 'Gratuito',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 5,
    title: 'Prenotazione Appuntamenti',
    category: 'documents',
    icon: Clock,
    description: 'Prenota un appuntamento agli uffici comunali',
    status: 'maintenance',
    time: 'Variabile',
    cost: 'Gratuito',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 6,
    title: 'Mappa Uffici',
    category: 'documents',
    icon: MapPin,
    description: 'Trova gli uffici comunali più vicini',
    status: 'available',
    time: 'Immediato',
    cost: 'Gratuito',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 7,
    title: 'Orari Autobus',
    category: 'transport',
    icon: Bus,
    description: 'Consulta gli orari e le fermate degli autobus urbani',
    status: 'available',
    time: 'Tempo reale',
    cost: 'Gratuito',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 8,
    title: 'Parcheggi Pubblici',
    category: 'transport',
    icon: MapPin,
    description: 'Trova parcheggi disponibili in città',
    status: 'available',
    time: 'Immediato',
    cost: 'Variabile',
    color: 'from-indigo-500 to-indigo-600'
  }
];

const quickActions = [
  { id: 1, title: 'Emergenza', icon: Phone, color: 'bg-red-500', number: '112' },
  { id: 2, title: 'Polizia Locale', icon: Phone, color: 'bg-blue-500', number: '0733 123456' },
  { id: 3, title: 'Vigili del Fuoco', icon: Phone, color: 'bg-orange-500', number: '115' },
  { id: 4, title: 'Guardia Medica', icon: Phone, color: 'bg-green-500', number: '0733 654321' },
];

export function MobileServicesScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOtherNumbers, setShowOtherNumbers] = useState(false);
  const [showBusSchedules, setShowBusSchedules] = useState(false);

  const otherNumbers = [
    { label: 'Carabinieri', numbers: ['+39 0733 825300'] },
    { label: 'Farmacia Angelini', numbers: ['+39 0733 812516', '+39 0733 777897'] },
    { label: 'Farmacia Comunale N.1', numbers: ['+39 0733 812946'] },
    { label: 'Farmacia Comunale N.2', numbers: ['+39 0733 814207'] },
    { label: 'Farmacia Comunale N.3', numbers: ['+39 0733 812413'] },
    { label: 'Farmacia Comunale N.5', numbers: ['+39 0733 816488'] },
    { label: 'Farmacia Comunale N.6', numbers: ['+39 0733 829014'] },
    { label: 'Farmacia De Giovanni', numbers: ['+39 0733 890120'] },
    { label: 'Farmacia Fontespina', numbers: ['+39 0733 812775'] },
    { label: 'Farmacia Foresi', numbers: ['+39 0733 812525', '+39 0733 811278'] },
    { label: 'Farmacia Marcelli', numbers: ['+39 0733 770177'] },
    { label: 'Guardia medica', numbers: ['+39 0733 823990'] },
    { label: 'IAT', numbers: ['+39 0733 813967'] },
    { label: 'Ospedale', numbers: ['+39 0733 8231'] },
    { label: 'Polizia locale', numbers: ['+39 0733 81376'] },
    { label: 'Poste italiane - Via Duca degli Abruzzi, 14', numbers: ['+39 0733 783838'] },
    { label: 'Poste italiane - Via Silvio Pellico, 80/B', numbers: ['+39 0733 897034'] },
    { label: 'Poste italiane - Via Edmondo de Amicis, 15', numbers: ['+39 0733 816743'] },
    { label: 'Poste italiane - Via Ginocchi, 2', numbers: ['+39 0733 784344'] },
    { label: 'Poste italiane - Via Cristoforo Colombo, 422', numbers: ['+39 0733 70262'] },
    { label: 'Poste italiane - Via Roma, 63', numbers: ['+39 0733 893061'] },
    { label: 'Soccorso Stradale Basso Aci', numbers: ['+39 0733 994250'] },
    { label: 'Soccorso Stradale Capozucca Snc', numbers: ['+39 0733 801097'] },
    { label: 'Ufficio postale Consorzio', numbers: ['+39 0733 784489'] },
  ];

  const filteredServices = services.filter(service => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleServiceClick = (service: any) => {
    if (service.status === 'maintenance') {
      alert('Servizio temporaneamente non disponibile');
      return;
    }
    
    // Handle specific services
    if (service.id === 7) { // Orari Autobus service
      setShowBusSchedules(true);
      return;
    }
    
    // Handle other service navigation
    console.log('Opening service:', service.title);
  };

  const handleQuickCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleBusAction = (action: string) => {
    switch (action) {
      case 'stops':
        console.log('Opening bus stops map');
        // TODO: Navigate to bus stops page
        break;
      case 'routes':
        console.log('Opening bus routes');
        // TODO: Navigate to bus routes page
        break;
      case 'alerts':
        console.log('Opening bus alerts');
        // TODO: Navigate to bus alerts page
        break;
      case 'schedules':
        setShowBusSchedules(true);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      <StatusBar />
      <div className="content-with-navbar">
        {/* Header */}
        <div className="relative px-6 pt-16 pb-6">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <h1 className="text-white text-xl font-bold">Servizi</h1>
            
            <div className="w-10 h-10" />
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div 
              className="flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <Search className="w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Cerca servizi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none text-sm"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
            {serviceCategories.map(cat => {
              if (cat.id === 'other-numbers') {
                return (
                  <button
                    key={cat.id}
                    className={`px-4 py-2 rounded-full font-bold shadow whitespace-nowrap ${activeCategory === cat.id ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                    onClick={() => setShowOtherNumbers(true)}
                  >
                    {cat.label}
                  </button>
                );
              }
              
              const getActiveColor = () => {
                switch (cat.id) {
                  case 'transport': return 'bg-blue-600 text-white';
                  case 'payments': return 'bg-green-600 text-white';
                  case 'documents': return 'bg-purple-600 text-white';
                  default: return 'bg-gray-600 text-white';
                }
              };
              
              return (
                <button
                  key={cat.id}
                  className={`px-4 py-2 rounded-full font-bold shadow whitespace-nowrap ${activeCategory === cat.id ? getActiveColor() : 'bg-gray-800 text-gray-300'}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label} <span className="ml-1 text-xs bg-black/30 px-2 py-1 rounded-full">{cat.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Emergency Actions */}
        <div className="px-6 mb-6">
          <h2 className="text-white text-lg font-bold mb-4">Numeri Utili</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickCall(action.number)}
                  className="group p-4 rounded-2xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white text-sm font-bold mb-1">{action.title}</h3>
                  <p className="text-white/60 text-xs">{action.number}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bus Schedules Section */}
        <div className="px-6 mb-6 animate-bus-slide-in bus-section-mobile">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-bold flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-400 bus-icon-animated" />
              Orari Autobus
            </h2>
            <button
              onClick={() => setShowBusSchedules(true)}
              className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors duration-200"
            >
              Vedi tutti
            </button>
          </div>
          
          <div 
            className="rounded-2xl p-5 border"
            style={{
              background: 'rgba(59, 130, 246, 0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)',
            }}
          >
            {/* Quick Route Cards */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              {/* Route Card Template - Empty for now */}
              <button
                onClick={() => setShowBusSchedules(true)}
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left w-full bus-card-interactive group bus-card-mobile"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Bus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Linee Principali</h3>
                      <p className="text-white/60 text-xs">Centro - Stazione - Mare</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors duration-200" />
                </div>
                
                <div className="flex items-center gap-4 text-xs text-white/70">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Prossimo: --:--</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    <span>In tempo reale</span>
                  </div>
                </div>
              </button>

              {/* Weekend/Holiday Schedule Card */}
              <button
                onClick={() => setShowBusSchedules(true)}
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left w-full bus-card-interactive group bus-card-mobile"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Orari Festivi</h3>
                      <p className="text-white/60 text-xs">Weekend e giorni festivi</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors duration-200" />
                </div>
                
                <div className="flex items-center gap-4 text-xs text-white/70">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Orario ridotto</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Actions for Bus Services */}
            <div className="grid grid-cols-3 gap-2 bus-actions-mobile">
              <button 
                onClick={() => handleBusAction('stops')}
                className="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 border border-white/10 hover:scale-105 active:scale-95"
              >
                <MapPin className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <span className="text-white text-xs font-medium">Fermate</span>
              </button>
              
              <button 
                onClick={() => handleBusAction('routes')}
                className="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 border border-white/10 hover:scale-105 active:scale-95"
              >
                <Navigation className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <span className="text-white text-xs font-medium">Percorsi</span>
              </button>
              
              <button 
                onClick={() => handleBusAction('alerts')}
                className="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-all duration-200 border border-white/10 hover:scale-105 active:scale-95"
              >
                <AlertCircle className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <span className="text-white text-xs font-medium">Avvisi</span>
              </button>
            </div>

            {/* Info Message */}
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-300 text-xs text-center">
                📍 Gli orari degli autobus verranno aggiornati a breve con informazioni in tempo reale
              </p>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="px-6">
          <h2 className="text-white text-lg font-bold mb-4">Tutti i Servizi</h2>
          <div className="space-y-3">
            {filteredServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="w-full group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  disabled={service.status === 'maintenance'}
                >
                  <div
                    className={`rounded-2xl p-4 border flex items-center gap-4 ${
                      service.status === 'maintenance' ? 'opacity-60' : ''
                    }`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {/* Icon */}
                    <div className="relative">
                      <div 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${service.color} group-hover:scale-110 transition-transform duration-200`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      {service.status === 'maintenance' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left">
                      <h3 className="text-white text-sm font-bold mb-1 group-hover:text-accent transition-colors duration-200">
                        {service.title}
                      </h3>
                      <p className="text-white/70 text-xs mb-2 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-4 text-white/60 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{service.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          <span>{service.cost}</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors duration-200" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-8" />
      </div>

      {/* Popup Altri Numeri */}
      {showOtherNumbers && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-4 shadow-2xl w-full max-w-sm mx-2 relative flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full z-10"
              onClick={() => setShowOtherNumbers(false)}
            >
              Chiudi
            </button>
            <h3 className="text-white text-lg font-bold mb-4 text-center">Altri Numeri Utili</h3>
            <div className="divide-y divide-gray-800">
              {otherNumbers.map((service, idx) => (
                <div key={idx} className="py-3 flex flex-col">
                  <span className="font-semibold text-blue-300 mb-1 text-sm">{service.label}</span>
                  <div className="flex flex-wrap gap-2">
                    {service.numbers.map((num, i) => (
                      <a key={i} href={`tel:${num.replace(/\s+/g, '')}`} className="text-blue-400 underline text-xs bg-gray-800 px-2 py-1 rounded">
                        {num}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bus Schedule Widget */}
      <BusScheduleWidget
        isOpen={showBusSchedules}
        onClose={() => setShowBusSchedules(false)}
      />

      <BottomNavbar />
    </div>
  );
}