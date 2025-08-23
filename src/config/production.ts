// Configurazione per l'ambiente di produzione

// Impostazioni per i dati mock
export const PRODUCTION_CONFIG = {
  // Disabilita tutti i dati mock in produzione
  USE_MOCK_DATA: false,
  
  // Configurazioni specifiche per servizi
  MOCK_SERVICES: {
    community: false,
    news: false,
    events: false,
    users: false,
    badges: false,
    notifications: false,
    statistics: false,
    logs: false
  },
  
  // Configurazioni per l'ambiente
  ENVIRONMENT: 'production',
  
  // Debug e logging
  DEBUG_MODE: false,
  CONSOLE_WARNINGS: false,
  
  // Configurazioni API
  API_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Funzione per verificare se siamo in produzione
export const isProduction = () => {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
};

// Funzione per ottenere la configurazione corretta
export const getConfig = () => {
  if (isProduction()) {
    return PRODUCTION_CONFIG;
  }
  
  // Configurazione di sviluppo (permette mock data)
  return {
    ...PRODUCTION_CONFIG,
    USE_MOCK_DATA: true,
    MOCK_SERVICES: {
      community: true,
      news: true,
      events: true,
      users: true,
      badges: true,
      notifications: true,
      statistics: true,
      logs: true
    },
    DEBUG_MODE: true,
    CONSOLE_WARNINGS: true
  };
};