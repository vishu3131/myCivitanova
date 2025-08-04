export interface PuntoInteresse {
  nome: string;
  tipo: 'monumento' | 'ristorante' | 'parco' | 'negozio';
}

export interface Quartiere {
  id: number;
  name: string;
  image: string;
  description: string;
  puntiInteresse: PuntoInteresse[];
}

export const quartieriData: Quartiere[] = [
  {
    id: 1,
    name: "Centro Storico",
    image: "https://source.unsplash.com/random/800x600/?civitanova,old,town",
    description: "Il cuore antico di Civitanova Marche, con le sue strade acciottolate e palazzi storici.",
    puntiInteresse: [
      { nome: "Palazzo Comunale", tipo: "monumento" },
      { nome: "Chiesa di San Marone", tipo: "monumento" },
      { nome: "Trattoria da Mario", tipo: "ristorante" },
      { nome: "Parco della Rocca", tipo: "parco" }
    ]
  },
  {
    id: 2,
    name: "Porto",
    image: "https://source.unsplash.com/random/800x600/?civitanova,port,fishing",
    description: "Il porto peschereccio con le sue barche colorate e l'atmosfera marinara.",
    puntiInteresse: [
      { nome: "Porto Turistico", tipo: "monumento" },
      { nome: "Ristorante Il Pescatore", tipo: "ristorante" },
      { nome: "Mercato del Pesce", tipo: "negozio" }
    ]
  },
  {
    id: 3,
    name: "Lungomare Nord",
    image: "https://source.unsplash.com/random/800x600/?civitanova,beach,sea",
    description: "La zona balneare con spiagge attrezzate e stabilimenti moderni.",
    puntiInteresse: [
      { nome: "Bagno Roma", tipo: "parco" },
      { nome: "Chalet delle Rose", tipo: "ristorante" },
      { nome: "Parco Giochi", tipo: "parco" }
    ]
  },
  {
    id: 4,
    name: "San Gabriele",
    image: "https://source.unsplash.com/random/800x600/?civitanova,residential",
    description: "Un quartiere residenziale tranquillo con parchi e attività commerciali.",
    puntiInteresse: [
      { nome: "Parco San Gabriele", tipo: "parco" },
      { nome: "Pizzeria Il Focolare", tipo: "ristorante" },
      { nome: "Centro Commerciale", tipo: "negozio" }
    ]
  }
];