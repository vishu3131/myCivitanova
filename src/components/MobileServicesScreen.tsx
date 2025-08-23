"use client";

import React, { useState, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { BottomNavbar } from './BottomNavbar';
import { ArrowLeft, Search, FileText, CreditCard, Phone, MapPin, Clock, ChevronRight, AlertCircle, Navigation, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BusWidget from './BusWidget';

const serviceCategories = [
  { id: 'all', label: 'Tutti', count: 13 },
  { id: 'documents', label: 'Documenti', count: 5 },
  { id: 'payments', label: 'Pagamenti', count: 2 },
  { id: 'transport', label: 'Trasporti', count: 2 },
  { id: 'other', label: 'Altri', count: 4 },
  { id: 'other-numbers', label: 'Altri Numeri', count: 8 },
];

const services = [
  {
    id: 1,
    title: 'Certificato di Residenza',
    category: 'documents',
    icon: FileText,
    description: 'Richiedi il certificato di residenza online',
    status: 'coming_soon',
    time: '5 min',
    cost: '€ 0,00',
    color: 'from-blue-500 to-blue-600',
    url: 'https://www.comune.civitanova-marche.mc.it/servizi/anagrafe',
    badge: 'In arrivo'
  },
  {
    id: 2,
    title: 'Stato Civile',
    category: 'documents',
    icon: FileText,
    description: 'Servizi di stato civile e anagrafe',
    status: 'coming_soon',
    time: '10 min',
    cost: 'Variabile',
    color: 'from-purple-500 to-purple-600',
    url: 'https://www.comune.civitanova-marche.mc.it/servizi/stato-civile',
    badge: 'In arrivo'
  },
  {
    id: 3,
    title: 'Pagamento Multe',
    category: 'payments',
    icon: CreditCard,
    description: 'Paga le multe del traffico online',
    status: 'coming_soon',
    time: '3 min',
    cost: 'Variabile',
    color: 'from-red-500 to-red-600',
    url: 'https://www.comune.civitanova-marche.mc.it/servizi/multe',
    badge: 'In arrivo'
  },
  {
    id: 4,
    title: 'Pagamento Tasse',
    category: 'payments',
    icon: CreditCard,
    description: 'Paga IMU, TARI e altre tasse comunali',
    status: 'coming_soon',
    time: '5 min',
    cost: 'Variabile',
    color: 'from-green-500 to-green-600',
    url: 'https://www.comune.civitanova-marche.mc.it/servizi/tributi',
    badge: 'In arrivo'
  },
  {
    id: 5,
    title: 'Pratiche Edilizie',
    category: 'documents',
    icon: FileText,
    description: 'Gestisci pratiche edilizie e urbanistiche',
    status: 'coming_soon',
    time: '15 min',
    cost: 'Variabile',
    color: 'from-orange-500 to-orange-600',
    url: 'https://www.comune.civitanova-marche.mc.it/servizi/edilizia',
    badge: 'In arrivo'
  },
  {
    id: 6,
    title: 'Servizi Scolastici',
    category: 'other',
    icon: FileText,
    description: 'Iscrizioni e servizi per le scuole',
    status: 'coming_soon',
    time: '10 min',
    cost: 'Variabile',
    color: 'from-indigo-500 to-indigo-600',
    url: 'https://www.comune.civitanova-marche.mc.it/servizi/scuola',
    badge: 'In arrivo'
  },
  {
    id: 7,
    title: 'Segnalazione Guasti',
    category: 'other',
    icon: AlertCircle,
    description: 'Segnala guasti e problemi urbani',
    status: 'coming_soon',
    time: '2 min',
    cost: 'Gratuito',
    color: 'from-yellow-500 to-yellow-600',
    badge: 'In arrivo'
  },
  {
    id: 8,
    title: 'Prenotazione Appuntamenti',
    category: 'other',
    icon: Clock,
    description: 'Prenota un appuntamento negli uffici comunali',
    status: 'coming_soon',
    time: '3 min',
    cost: 'Gratuito',
    color: 'from-purple-500 to-purple-600',
    badge: 'In arrivo'
  },
  {
    id: 9,
    title: 'Ufficio Anagrafe',
    category: 'documents',
    icon: FileText,
    description: 'Servizi ANPR e certificati anagrafici',
    status: 'active',
    time: 'Immediato',
    cost: 'Gratuito',
    color: 'from-yellow-500 to-yellow-600',
    badge: 'Disponibile'
  },
  {
    id: 10,
    title: 'Parcheggi Pubblici',
    category: 'transport',
    icon: MapPin,
    description: 'Trova parcheggi pubblici e ZTL',
    status: 'coming_soon',
    time: 'Immediato',
    cost: 'Variabile',
    color: 'from-teal-500 to-teal-600',
    badge: 'In arrivo'
  },
  {
    id: 11,
    title: 'Autorizzazioni',
    category: 'documents',
    icon: FileText,
    description: 'Richiedi autorizzazioni e permessi',
    status: 'coming_soon',
    time: '10 min',
    cost: 'Variabile',
    color: 'from-cyan-500 to-cyan-600',
    url: 'https://www.comune.civitanova-marche.mc.it/servizi/autorizzazioni',
    badge: 'In arrivo'
  },
  {
    id: 12,
    title: 'Cultura e Eventi',
    category: 'other',
    icon: Calendar,
    description: 'Informazioni su eventi e attività culturali',
    status: 'coming_soon',
    time: 'Immediato',
    cost: 'Gratuito',
    color: 'from-pink-500 to-pink-600',
    url: 'https://www.comune.civitanova-marche.mc.it/cultura',
    badge: 'In arrivo'
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
  const [showAnagrafePopup, setShowAnagrafePopup] = useState(false);


  const otherNumbers = [
    { label: 'Emergenza Unica', numbers: ['112'] },
    { label: 'Carabinieri', numbers: ['+39 0733 825300'] },
    { label: 'Comune - Centralino', numbers: ['+39 0733 822111'] },
    { label: 'Anagrafe', numbers: ['+39 0733 822250'] },
    { label: 'Ufficio Tributi', numbers: ['+39 0733 822270'] },
    { label: 'Polizia locale', numbers: ['+39 0733 81376'] },
    { label: 'Servizi Sociali', numbers: ['+39 0733 822300'] },
    { label: 'Ufficio Tecnico', numbers: ['+39 0733 822280'] },
    { label: 'Protezione Civile', numbers: ['+39 0733 822333'] },
    { label: 'Ospedale', numbers: ['+39 0733 8231'] },
    { label: 'Guardia medica', numbers: ['+39 0733 823990'] },
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
    { label: 'IAT - Ufficio Turistico', numbers: ['+39 0733 813967'] },
    { label: 'ATAC Civitanova - Trasporti', numbers: ['+39 0733 812345'] },
    { label: 'Taxi Civitanova', numbers: ['+39 0733 817777'] },
    { label: 'Poste italiane - Via Duca degli Abruzzi, 14', numbers: ['+39 0733 783838'] },
    { label: 'Poste italiane - Via Silvio Pellico, 80/B', numbers: ['+39 0733 897034'] },
    { label: 'Poste italiane - Via Edmondo de Amicis, 15', numbers: ['+39 0733 816743'] },
    { label: 'Poste italiane - Via Ginocchi, 2', numbers: ['+39 0733 784344'] },
    { label: 'Poste italiane - Via Cristoforo Colombo, 422', numbers: ['+39 0733 70262'] },
    { label: 'Poste italiane - Via Roma, 63', numbers: ['+39 0733 893061'] },
    { label: 'Ufficio postale Consorzio', numbers: ['+39 0733 784489'] },
    { label: 'Soccorso Stradale Basso Aci', numbers: ['+39 0733 994250'] },
    { label: 'Soccorso Stradale Capozucca Snc', numbers: ['+39 0733 801097'] },
    { label: 'Numero Verde Rifiuti', numbers: ['800 123456'] },
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
    

    
    // Handle services with URLs
    if (service.url) {
      window.open(service.url, '_blank');
      return;
    }
    
    if (service.id === 9) { // ID for Ufficio Anagrafe
      setShowAnagrafePopup(true);
      return;
    }

    // Handle other service navigation
    console.log('Opening service:', service.title);
  };

  const handleQuickCall = (number: string) => {
    window.location.href = `tel:${number}`;
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
              className="flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 hover:bg-white/10 focus-within:bg-white/12"
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
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none text-base min-h-[24px] touch-manipulation"
                aria-label="Cerca servizi"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-3 mb-4 overflow-x-auto scrollbar-hide pb-2">
            {serviceCategories.map(cat => {
              if (cat.id === 'other-numbers') {
                return (
                  <button
                    key={cat.id}
                    className={`px-6 py-3 rounded-2xl font-bold shadow whitespace-nowrap min-w-fit touch-manipulation transition-all duration-200 ${activeCategory === cat.id ? 'bg-red-600 text-white scale-105' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 active:scale-95'}`}
                    onClick={() => setShowOtherNumbers(true)}
                    aria-pressed={activeCategory === cat.id}
                  >
                    {cat.label}
                  </button>
                );
              }
              
              const getActiveColor = () => {
                switch (cat.id) {
                  case 'transport': return 'bg-blue-600 text-white scale-105';
                  case 'payments': return 'bg-green-600 text-white scale-105';
                  case 'documents': return 'bg-purple-600 text-white scale-105';
                  case 'other': return 'bg-orange-600 text-white scale-105';
                  default: return 'bg-gray-600 text-white scale-105';
                }
              };
              
              return (
                <button
                  key={cat.id}
                  className={`px-6 py-3 rounded-2xl font-bold shadow whitespace-nowrap min-w-fit touch-manipulation transition-all duration-200 ${activeCategory === cat.id ? getActiveColor() : 'bg-gray-800 text-gray-300 hover:bg-gray-700 active:scale-95'}`}
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={activeCategory === cat.id}
                >
                  {cat.label} <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">{cat.count}</span>
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

        {/* Bus Widget */}
        <div className="px-6 mb-6 mt-32"> {/* Increased mt to lower the widget even further */}
          <BusWidget />
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
                  className="w-full group cursor-pointer transition-all duration-300 hover:scale-[1.02] touch-manipulation"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  disabled={service.status === 'maintenance' || service.status === 'coming_soon'}
                  role="button"
                  tabIndex={0}
                  aria-label={`Accedi al servizio ${service.title}`}
                >
                  <div
                    className={`rounded-2xl p-6 border flex items-center gap-4 ${
                      service.status === 'maintenance' || service.status === 'coming_soon' ? 'opacity-60' : ''
                    }`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      minHeight: '120px'
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
                      {service.status === 'coming_soon' && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                          In arrivo
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

      {/* Popup Ufficio Anagrafe */}
      {showAnagrafePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 shadow-2xl w-full max-w-md mx-auto relative flex flex-col max-h-[90vh] overflow-y-auto text-white">
            <button
              className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10 hover:bg-red-700 transition-colors"
              onClick={() => setShowAnagrafePopup(false)}
            >
              Chiudi
            </button>
            <h3 className="text-2xl font-extrabold text-center mb-4 text-yellow-400">UFFICIO ANAGRAFE 🌟</h3>
            <p className="text-lg font-semibold mb-3 text-blue-300">ANPR: L’Anagrafe Nazionale Unica per Tutti! 🌟</p>
            <p className="mb-4 text-sm leading-relaxed">
              L’Anagrafe Nazionale della Popolazione Residente (ANPR) è una piattaforma digitale centralizzata che semplifica i servizi demografici per i residenti in Italia e iscritti all’AIRE. Accedi online da casa, senza code agli sportelli, per gestire i tuoi dati in modo sicuro e autonomo.
            </p>
            <p className="mb-4 text-sm leading-relaxed">
              📅 <span className="font-bold text-green-400">Novità a Civitanova Marche:</span> Dal 15 novembre, tutti i cittadini possono usare ANPR per scaricare documenti anagrafici direttamente da PC o smartphone, evitando visite in Comune!
            </p>
            <p className="font-bold text-blue-300 mb-2">🔑 Come Accedere:</p>
            <ul className="list-disc list-inside mb-4 text-sm ml-4">
              <li>Entra su: <a href="https://www.anagrafenazionale.interno.it" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">www.anagrafenazionale.interno.it</a> o <a href="https://www.anagrafenazionale.gov.it" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">www.anagrafenazionale.gov.it</a></li>
              <li>Usa:
                <ul className="list-circle list-inside ml-4 mt-1">
                  <li>🇮🇹 SPID (Sistema Pubblico di Identità Digitale)</li>
                  <li>🆔 CIE (Carta d’Identità Elettronica)</li>
                  <li>💳 CNS (Carta Nazionale dei Servizi, come la tessera sanitaria abilitata)</li>
                </ul>
              </li>
            </ul>
            <p className="font-bold text-blue-300 mb-2">📄 Servizi Principali Disponibili:</p>
            <ul className="list-disc list-inside mb-4 text-sm ml-4">
              <li><span className="font-semibold">Autocertificazione 📝:</span> Genera subito sostitutivi di certificati anagrafici.</li>
              <li><span className="font-semibold">Certificati 🏅:</span> Scarica 14 tipi (per te o familiari), gratuiti e senza bollo! (Non tutti i documenti sono ancora online).</li>
              <li><span className="font-semibold">Rettifica Dati 🔧:</span> Correggi errori nella tua scheda anagrafica.</li>
              <li><span className="font-semibold">Cambio Residenza 🏠:</span> Invia dichiarazioni per trasferimenti o rimpatri.</li>
              <li><span className="font-semibold">Domicilio Digitale 📧:</span> Consulta la tua PEC per comunicazioni ufficiali.</li>
              <li><span className="font-semibold">Per Cittadini Europei 🇪🇺:</span> Trasferisci residenza, richiedi certificati di nascita o iscriviti alle liste elettorali.</li>
            </ul>
            <p className="font-bold text-blue-300 mb-2">💡 Vantaggi:</p>
            <ul className="list-disc list-inside mb-4 text-sm ml-4">
              <li>Banca dati unica e aggiornata per servizi rapidi e multilinguistici.</li>
              <li>Accesso 24/7, ovunque tu sia.</li>
              <li>Ultimo aggiornamento: 22 agosto 2025.</li>
            </ul>
            <p className="text-sm text-center text-gray-400">
              Scopri di più sull’area cittadino o tecnica sul sito ufficiale! 🚀
            </p>
          </div>
        </div>
      )}



      <BottomNavbar />
    </div>
  );
}
