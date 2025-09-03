export interface ArtworkData {
  id: number;
  title: string;
  artist: string;
  year: string;
  location: string;
  description: string;
  image: string;
  category: 'murale' | 'scultura' | 'installazione' | 'pittura';
  likes: number;
  views: number;
  coordinates?: [number, number];
  tags: string[];
}

export const artworks: ArtworkData[] = [
  {
    id: 1,
    title: "Murale del Mare",
    artist: "Marco Rossi",
    year: "2023",
    location: "Lungomare Sud",
    description: "Un'opera che celebra la bellezza del mare Adriatico e la tradizione marinara di Civitanova Marche. I colori blu e azzurri si fondono in onde che sembrano muoversi sulla parete.",
    image: "/murales/mural-1.jpg",
    category: "murale",
    likes: 45,
    views: 320,
    coordinates: [43.3058, 13.7286],
    tags: ["mare", "tradizione", "blu", "onde"]
  },
  {
    id: 2,
    title: "Civitanova Moderna",
    artist: "Elena Bianchi",
    year: "2022",
    location: "Centro Storico",
    description: "Una rappresentazione artistica della Civitanova contemporanea, dove passato e futuro si incontrano in un dialogo di forme e colori vivaci.",
    image: "/murales/mural-2.jpg",
    category: "murale",
    likes: 38,
    views: 275,
    coordinates: [43.3089, 13.7234],
    tags: ["moderno", "città", "futuro", "colorato"]
  },
  {
    id: 3,
    title: "La Danza delle Stagioni",
    artist: "Giuseppe Verdi",
    year: "2023",
    location: "Parco del Sole",
    description: "Un murale che rappresenta il ciclo delle stagioni attraverso figure danzanti che si trasformano seguendo i ritmi della natura.",
    image: "/murales/mural-3.jpg",
    category: "murale",
    likes: 52,
    views: 410,
    coordinates: [43.3045, 13.7298],
    tags: ["stagioni", "danza", "natura", "ciclo"]
  },
  {
    id: 4,
    title: "Memoria Urbana",
    artist: "Francesca Neri",
    year: "2021",
    location: "Via Roma",
    description: "Un'opera che racconta la storia di Civitanova attraverso simboli e immagini che evocano la memoria collettiva della città.",
    image: "/murales/mural-4.jpg",
    category: "murale",
    likes: 41,
    views: 298,
    coordinates: [43.3076, 13.7245],
    tags: ["storia", "memoria", "simboli", "tradizione"]
  },
  {
    id: 5,
    title: "Armonia Geometrica",
    artist: "Andrea Blu",
    year: "2023",
    location: "Quartiere Fontespina",
    description: "Forme geometriche che si intrecciano creando un'armonia visiva che rappresenta l'equilibrio tra ordine e creatività.",
    image: "/murales/mural-5.jpg",
    category: "murale",
    likes: 33,
    views: 245,
    coordinates: [43.3012, 13.7312],
    tags: ["geometria", "armonia", "equilibrio", "forme"]
  },
  {
    id: 6,
    title: "Riflessi d'Acqua",
    artist: "Silvia Azzurra",
    year: "2022",
    location: "Porto Civitanova",
    description: "Un murale ispirato ai riflessi dell'acqua del porto, con giochi di luce che cambiano durante le diverse ore del giorno.",
    image: "/murales/mural-6.jpg",
    category: "murale",
    likes: 47,
    views: 356,
    coordinates: [43.3098, 13.7189],
    tags: ["acqua", "riflessi", "porto", "luce"]
  },
  {
    id: 7,
    title: "Energia Vitale",
    artist: "Roberto Rosso",
    year: "2023",
    location: "Zona Industriale",
    description: "Un'esplosione di colori caldi che rappresenta l'energia e la vitalità della comunità civitanovese.",
    image: "/murales/mural-7.jpg",
    category: "murale",
    likes: 39,
    views: 287,
    coordinates: [43.2987, 13.7356],
    tags: ["energia", "vitalità", "comunità", "colori"]
  },
  {
    id: 8,
    title: "Metamorfosi Urbana",
    artist: "Chiara Verde",
    year: "2022",
    location: "Stazione Ferroviaria",
    description: "Un'opera che simboleggia la trasformazione continua della città, con elementi che si evolvono e si trasformano.",
    image: "/murales/mural-8.jpg",
    category: "murale",
    likes: 44,
    views: 334,
    coordinates: [43.3123, 13.7201],
    tags: ["metamorfosi", "trasformazione", "evoluzione", "città"]
  },
  {
    id: 9,
    title: "Sogni di Libertà",
    artist: "Matteo Cielo",
    year: "2023",
    location: "Piazza XX Settembre",
    description: "Figure che volano libere nel cielo, rappresentando i sogni e le aspirazioni della gioventù civitanovese.",
    image: "/murales/mural-9.jpg",
    category: "murale",
    likes: 56,
    views: 445,
    coordinates: [43.3067, 13.7267],
    tags: ["sogni", "libertà", "gioventù", "volo"]
  },
  {
    id: 10,
    title: "Radici e Ali",
    artist: "Anna Terra",
    year: "2021",
    location: "Scuola Media Annibal Caro",
    description: "Un murale che rappresenta l'importanza delle radici culturali e la capacità di volare verso nuovi orizzonti.",
    image: "/murales/mural-10.jpg",
    category: "murale",
    likes: 42,
    views: 312,
    coordinates: [43.3034, 13.7278],
    tags: ["radici", "ali", "cultura", "orizzonti"]
  },
  {
    id: 11,
    title: "Sinfonia di Colori",
    artist: "Luca Arcobaleno",
    year: "2023",
    location: "Centro Commerciale Cuore Adriatico",
    description: "Una composizione musicale tradotta in colori, dove ogni tonalità rappresenta una nota in questa sinfonia visiva.",
    image: "/murales/mural-11.jpg",
    category: "murale",
    likes: 48,
    views: 378,
    coordinates: [43.2998, 13.7334],
    tags: ["musica", "sinfonia", "colori", "note"]
  },
  {
    id: 12,
    title: "Guardiani del Tempo",
    artist: "Sofia Antica",
    year: "2022",
    location: "Biblioteca Comunale",
    description: "Figure mistiche che custodiscono la saggezza e la conoscenza, rappresentando il ruolo della biblioteca come custode del sapere.",
    image: "/murales/mural-12.jpg",
    category: "murale",
    likes: 35,
    views: 267,
    coordinates: [43.3089, 13.7256],
    tags: ["tempo", "saggezza", "conoscenza", "biblioteca"]
  },
  {
    id: 13,
    title: "Futuro Sostenibile",
    artist: "Eco Artista",
    year: "2023",
    location: "Parco Fluviale",
    description: "Un'opera che promuove la sostenibilità ambientale, con elementi naturali che si integrano armoniosamente con la tecnologia verde.",
    image: "/murales/mural-13.jpg",
    category: "murale",
    likes: 51,
    views: 423,
    coordinates: [43.3056, 13.7289],
    tags: ["sostenibilità", "ambiente", "futuro", "verde"]
  }
];