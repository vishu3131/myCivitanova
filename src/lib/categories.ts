// Configurazione centralizzata delle categorie della community
// Questo file definisce tutte le categorie disponibili per i post della community

export interface Category {
  id: string;
  label: string;
  description: string;
  icon?: string;
  color?: string;
}

// Categorie predefinite per la community di Civitanova
export const COMMUNITY_CATEGORIES: Category[] = [
  {
    id: 'generale',
    label: 'Generale',
    description: 'Discussioni generali sulla città',
    icon: '<span role="img" aria-label="Chat bubble emoji">💬</span>',
    color: '#3B82F6'
  },
  {
    id: 'trasporti',
    label: 'Trasporti',
    description: 'Trasporti pubblici, traffico, mobilità',
    icon: '🚌',
    color: '#10B981'
  },
  {
    id: 'ambiente',
    label: 'Ambiente',
    description: 'Questioni ambientali, sostenibilità, verde pubblico',
    icon: '🌱',
    color: '#059669'
  },
  {
    id: 'servizi',
    label: 'Servizi',
    description: 'Servizi pubblici, uffici, burocrazia',
    icon: '🏛️',
    color: '#7C3AED'
  },
  {
    id: 'eventi',
    label: 'Eventi',
    description: 'Eventi, manifestazioni, attività culturali',
    icon: '🎉',
    color: '#F59E0B'
  },
  {
    id: 'sicurezza',
    label: 'Sicurezza',
    description: 'Sicurezza pubblica, segnalazioni, emergenze',
    icon: '🚨',
    color: '#EF4444'
  },
  {
    id: 'commercio',
    label: 'Commercio',
    description: 'Attività commerciali, negozi, mercati',
    icon: '🏪',
    color: '#8B5CF6'
  },
  {
    id: 'turismo',
    label: 'Turismo',
    description: 'Attrazioni turistiche, consigli per visitatori',
    icon: '🏖️',
    color: '#06B6D4'
  },
  {
    id: 'sport',
    label: 'Sport',
    description: 'Attività sportive, impianti, eventi sportivi',
    icon: '⚽',
    color: '#F97316'
  },
  {
    id: 'cultura',
    label: 'Cultura',
    description: 'Arte, musei, biblioteche, attività culturali',
    icon: '🎭',
    color: '#EC4899'
  }
];

// Funzioni di utilità
export const getCategoryById = (id: string): Category | undefined => {
  return COMMUNITY_CATEGORIES.find(category => category.id === id);
};

export const getCategoryLabel = (id: string): string => {
  const category = getCategoryById(id);
  return category ? category.label : 'Categoria sconosciuta';
};

export const getCategoryColor = (id: string): string => {
  const category = getCategoryById(id);
  return category ? category.color || '#6B7280' : '#6B7280';
};

export const getCategoryIcon = (id: string): string => {
  const category = getCategoryById(id);
  return category ? category.icon || '📝' : '📝';
};

// Validazione categoria
export const isValidCategory = (id: string): boolean => {
  return COMMUNITY_CATEGORIES.some(category => category.id === id);
};

// Esporta solo gli ID delle categorie per validazione
export const VALID_CATEGORY_IDS = COMMUNITY_CATEGORIES.map(cat => cat.id);

// Categoria di default
export const DEFAULT_CATEGORY = 'generale';