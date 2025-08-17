export type FilterType = 'popolari' | 'recenti' | 'quasi-completati';

export interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  coverImage: string;
  raised: number;
  goal: number;
  startDate: string;
  endDate: string;
}

const allProjects: Project[] = [
  {
    id: '1',
    slug: 'progetto-parco-verde',
    title: 'Riqualificazione Parco Verde',
    shortDescription: 'Un progetto per trasformare un\'area abbandonata in un parco giochi sicuro e moderno per i bambini del quartiere.',
    coverImage: '/images/crowdfunding/park.jpg', // Placeholder image
    raised: 7500,
    goal: 10000,
    startDate: '2025-07-01',
    endDate: '2025-09-30',
  },
  {
    id: '2',
    slug: 'biblioteca-digitale',
    title: 'Biblioteca Digitale Comunale',
    shortDescription: 'Creazione di una piattaforma online per l\'accesso gratuito a libri, riviste e risorse educative per tutti i cittadini.',
    coverImage: '/images/crowdfunding/library.jpg', // Placeholder image
    raised: 12000,
    goal: 15000,
    startDate: '2025-08-01',
    endDate: '2025-10-31',
  },
  {
    id: '3',
    slug: 'murales-urbani',
    title: 'Murales Urbani: Arte per la Città',
    shortDescription: 'Un\'iniziativa per abbellire i muri grigi della città con opere d\'arte colorate realizzate da artisti locali.',
    coverImage: '/images/crowdfunding/murales.jpg', // Placeholder image
    raised: 4000,
    goal: 5000,
    startDate: '2025-08-15',
    endDate: '2025-09-15',
  },
  {
    id: '4',
    slug: 'orti-urbani-comunitari',
    title: 'Orti Urbani Comunitari',
    shortDescription: 'Creazione di spazi verdi condivisi dove i cittadini possono coltivare frutta e verdura biologica.',
    coverImage: '/images/crowdfunding/garden.jpg', // Placeholder image
    raised: 9000,
    goal: 10000,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
  },
  {
    id: '5',
    slug: 'supporto-anziani',
    title: 'Supporto Anziani Soli',
    shortDescription: 'Programma di volontariato per offrire compagnia, assistenza e servizi a domicilio agli anziani soli della comunità.',
    coverImage: '/images/crowdfunding/elderly.jpg', // Placeholder image
    raised: 6000,
    goal: 8000,
    startDate: '2025-07-10',
    endDate: '2025-09-10',
  },
];

export const getFilteredProjects = (filter: FilterType): Project[] => {
  const now = new Date();
  switch (filter) {
    case 'popolari':
      // Example: Sort by amount raised (descending)
      return [...allProjects].sort((a, b) => b.raised - a.raised);
    case 'recenti':
      // Example: Sort by start date (descending)
      return [...allProjects].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    case 'quasi-completati':
      // Example: Projects that are 70-99% complete
      return allProjects.filter(project => {
        const progress = (project.raised / project.goal) * 100;
        return progress >= 70 && progress < 100;
      }).sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
    default:
      return allProjects;
  }
};

export const getStatus = (project: Project) => {
  const now = new Date();
  const endDate = new Date(project.endDate);
  const timeRemaining = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, Math.round((project.raised / project.goal) * 100));
  const completed = project.raised >= project.goal || daysRemaining <= 0;

  return {
    daysRemaining: Math.max(0, daysRemaining),
    progressPercent,
    completed,
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};
