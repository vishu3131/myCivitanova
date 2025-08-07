export interface QuartiereEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image?: string;
  category: 'cultura' | 'sport' | 'musica' | 'arte' | 'gastronomia';
}

export interface QuartierePark {
  id: number;
  name: string;
  address: string;
  description: string;
  image: string;
  facilities: string[];
  openingHours: string;
  coordinates?: { lat: number; lng: number };
}

export interface Quartiere {
  id: number;
  name: string;
  image: string;
  description: string;
  gallery: string[];
  events: QuartiereEvent[];
  parks: QuartierePark[];
  highlights: string[];
  coordinates?: { lat: number; lng: number };
  color: string; // Colore tema per il quartiere
}

export const quartieriData: Quartiere[] = [
  {
    id: 1,
    name: "Centro Storico",
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop",
    description: "Il cuore pulsante di Civitanova, dove storia e modernità si incontrano in un perfetto equilibrio. Strade acciottolate, palazzi storici e boutique eleganti creano un'atmosfera unica.",
    color: "blue",
    highlights: ["Architettura storica", "Shopping", "Ristoranti tipici", "Vita notturna"],
    coordinates: { lat: 43.3059, lng: 13.7264 },
    gallery: [
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=800&h=600&fit=crop"
    ],
    events: [
      {
        id: 1,
        title: "Festival della Musica Antica",
        date: "2024-07-15",
        time: "21:00",
        location: "Piazza del Comune",
        description: "Una serata magica dedicata alla musica medievale e rinascimentale, con ensemble di fama internazionale che si esibiscono nel suggestivo scenario del centro storico.",
        category: "musica",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"
      },
      {
        id: 2,
        title: "Mostra d'Arte Contemporanea",
        date: "2024-08-01",
        time: "18:00",
        location: "Palazzo Comunale",
        description: "Esposizione di opere di artisti locali e internazionali, con focus sull'arte digitale e le installazioni interattive.",
        category: "arte"
      },
      {
        id: 3,
        title: "Sagra del Brodetto",
        date: "2024-08-20",
        time: "19:30",
        location: "Via del Corso",
        description: "Degustazione del piatto tipico marchigiano preparato secondo le ricette tradizionali, accompagnato da vini locali.",
        category: "gastronomia"
      }
    ],
    parks: [
      {
        id: 1,
        name: "Giardini del Municipio",
        address: "Via del Comune, 1",
        description: "Un'oasi verde nel cuore del centro storico, perfetta per una pausa rilassante tra una visita e l'altra.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
        facilities: ["panchine", "fontana", "area giochi", "illuminazione", "wifi"],
        openingHours: "24h",
        coordinates: { lat: 43.3061, lng: 13.7266 }
      }
    ]
  },
  {
    id: 2,
    name: "Lungomare",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    description: "La passeggiata più bella della città, dove il mare incontra l'eleganza. Chilometri di spiagge dorate, stabilimenti balneari e locali alla moda.",
    color: "cyan",
    highlights: ["Spiagge", "Stabilimenti balneari", "Aperitivi vista mare", "Sport acquatici"],
    coordinates: { lat: 43.3045, lng: 13.7289 },
    gallery: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"
    ],
    events: [
      {
        id: 4,
        title: "Torneo di Beach Volley",
        date: "2024-07-25",
        time: "09:00",
        location: "Spiaggia Centrale",
        description: "Competizione nazionale di beach volley con la partecipazione di squadre professioniste e amatoriali.",
        category: "sport",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
      },
      {
        id: 5,
        title: "Concerto all'Alba",
        date: "2024-08-15",
        time: "06:00",
        location: "Molo Sud",
        description: "Un'esperienza unica: musica jazz e blues mentre sorge il sole sul mare Adriatico.",
        category: "musica"
      }
    ],
    parks: [
      {
        id: 2,
        name: "Parco del Lungomare",
        address: "Lungomare Piermanni",
        description: "Area verde attrezzata lungo la costa, ideale per jogging, passeggiate e attività all'aria aperta.",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
        facilities: ["pista ciclabile", "percorso fitness", "area picnic", "bagni pubblici", "parcheggio"],
        openingHours: "05:00 - 24:00",
        coordinates: { lat: 43.3042, lng: 13.7295 }
      }
    ]
  },
  {
    id: 3,
    name: "Zona Industriale",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
    description: "Il motore economico della città, dove tradizione artigianale e innovazione tecnologica convivono. Sede di importanti aziende e centri commerciali.",
    color: "orange",
    highlights: ["Centri commerciali", "Aziende", "Outlet", "Servizi"],
    coordinates: { lat: 43.3089, lng: 13.7156 },
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop"
    ],
    events: [
      {
        id: 6,
        title: "Fiera dell'Innovazione",
        date: "2024-09-10",
        time: "10:00",
        location: "Centro Fieristico",
        description: "Esposizione delle ultime novità tecnologiche e startup innovative del territorio marchigiano.",
        category: "cultura"
      }
    ],
    parks: [
      {
        id: 3,
        name: "Parco Tecnologico",
        address: "Via dell'Industria, 50",
        description: "Spazio verde moderno con aree relax per i lavoratori della zona industriale.",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
        facilities: ["panchine", "area fitness", "wifi", "parcheggio"],
        openingHours: "06:00 - 22:00"
      }
    ]
  },
  {
    id: 4,
    name: "Quartiere Residenziale",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
    description: "La zona più tranquilla e familiare della città, con ville eleganti, parchi giochi e servizi per le famiglie. Un'oasi di pace a due passi dal centro.",
    color: "green",
    highlights: ["Ville", "Parchi giochi", "Scuole", "Tranquillità"],
    coordinates: { lat: 43.3078, lng: 13.7234 },
    gallery: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"
    ],
    events: [
      {
        id: 7,
        title: "Festa di Quartiere",
        date: "2024-09-01",
        time: "16:00",
        location: "Parco delle Famiglie",
        description: "Pomeriggio di giochi, musica e divertimento per tutta la famiglia, con stand gastronomici e attività per bambini.",
        category: "cultura"
      }
    ],
    parks: [
      {
        id: 4,
        name: "Parco delle Famiglie",
        address: "Via dei Tigli, 15",
        description: "Grande parco attrezzato con aree giochi per bambini di tutte le età e spazi per lo sport.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
        facilities: ["area giochi", "campo basket", "campo calcio", "area picnic", "bagni pubblici", "parcheggio"],
        openingHours: "07:00 - 21:00",
        coordinates: { lat: 43.3076, lng: 13.7238 }
      },
      {
        id: 5,
        name: "Giardini di Via Roma",
        address: "Via Roma, 45",
        description: "Piccolo parco di quartiere perfetto per passeggiate rilassanti e momenti di relax.",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
        facilities: ["panchine", "fontana", "illuminazione", "area cani"],
        openingHours: "24h"
      }
    ]
  }
];
