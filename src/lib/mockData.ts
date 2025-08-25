// Mock data per sviluppo e testing
import { News, Event, Profile, Badge, UserXP, Comment, Notification, SystemLog } from './database';

// Mock Users
export const mockUsers: Profile[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'admin@civitanova.it',
    full_name: 'Marco Amministratore',
    role: 'admin',
    bio: 'Amministratore del sistema MyCivitanova',
    phone: '+39 0733 123456',
    address: 'Via Roma 1, Civitanova Marche',
    is_active: true,
    is_verified: true,
    privacy_settings: {
      profile_public: true,
      email_public: false,
      phone_public: false
    },
    notification_settings: {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-15T14:30:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'mario.rossi@email.com',
    full_name: 'Mario Rossi',
    role: 'user',
    bio: 'Cittadino di Civitanova Marche, appassionato di eventi culturali',
    phone: '+39 333 1234567',
    address: 'Via Garibaldi 12, Civitanova Marche',
    is_active: true,
    is_verified: true,
    privacy_settings: {
      profile_public: true,
      email_public: false,
      phone_public: false
    },
    notification_settings: {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false
    },
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-03-15T12:20:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'giulia.bianchi@email.com',
    full_name: 'Giulia Bianchi',
    role: 'user',
    bio: 'Insegnante e mamma, amo la mia città',
    phone: '+39 334 2345678',
    address: 'Via Mazzini 8, Civitanova Marche',
    is_active: true,
    is_verified: true,
    privacy_settings: {
      profile_public: true,
      email_public: false,
      phone_public: true
    },
    notification_settings: {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: true
    },
    created_at: '2024-02-10T16:30:00Z',
    updated_at: '2024-03-14T18:45:00Z'
  }
];

// Mock News
export const mockNews: News[] = [
  {
    id: 'news-001',
    title: 'Festa del Mare 2024: Un Successo Straordinario',
    slug: 'festa-del-mare-2024-successo',
    content: `La Festa del Mare 2024 si è conclusa con un successo straordinario, attirando oltre 50.000 visitatori lungo il lungomare di Civitanova Marche. L'evento, che si è svolto dal 15 al 18 agosto, ha offerto quattro giorni di spettacoli, gastronomia e divertimento per tutta la famiglia.

Il programma ha incluso concerti di artisti nazionali e locali, spettacoli pirotecnici, mercatini dell'artigianato e una vasta area gastronomica con specialità marinare. Particolarmente apprezzata è stata la mostra fotografica "Civitanova attraverso i secoli" allestita presso il Palazzo Comunale.

"Siamo estremamente soddisfatti della riuscita dell'evento", ha dichiarato l'Assessore al Turismo. "La Festa del Mare conferma Civitanova Marche come una delle destinazioni più attrattive della costa adriatica."

L'evento ha generato un importante indotto economico per la città, con hotel e ristoranti che hanno registrato il tutto esaurito per l'intero periodo della manifestazione.`,
    excerpt: 'La Festa del Mare 2024 ha attirato oltre 50.000 visitatori con quattro giorni di spettacoli e gastronomia.',
    featured_image: '/images/festa-mare-2024.jpg',
    category: 'eventi',
    status: 'published',
    is_featured: true,
    author_id: '550e8400-e29b-41d4-a716-446655440001',
    views_count: 1250,
    likes_count: 89,
    comments_count: 12,
    published_at: '2024-03-13T10:00:00Z',
    created_at: '2024-03-13T09:30:00Z',
    updated_at: '2024-03-13T10:00:00Z'
  },
  {
    id: 'news-002',
    title: 'Inaugurazione Nuovo Parco Giochi in Via Leopardi',
    slug: 'inaugurazione-parco-giochi-via-leopardi',
    content: `Sabato 28 settembre alle ore 10:00 verrà inaugurato il nuovo parco giochi in Via Leopardi, un'area verde completamente rinnovata e dedicata alle famiglie con bambini.

Il parco, realizzato con un investimento di 150.000 euro, include:
- Nuove attrezzature ludiche per bambini da 3 a 12 anni
- Area fitness all'aperto per adulti
- Percorso pedonale accessibile
- Nuova illuminazione LED
- Panchine e tavoli per pic-nic
- Area cani recintata

"Questo progetto rappresenta il nostro impegno per creare spazi di qualità per le famiglie", ha spiegato l'Assessore ai Lavori Pubblici. "Il parco è stato progettato seguendo i più moderni criteri di sicurezza e sostenibilità ambientale."

L'inaugurazione sarà accompagnata da attività di animazione per bambini e un rinfresco offerto dall'Amministrazione Comunale. Tutti i cittadini sono invitati a partecipare.`,
    excerpt: 'Sabato 28 settembre inaugurazione del nuovo parco giochi in Via Leopardi con attrezzature moderne e sicure.',
    featured_image: '/images/parco-leopardi.jpg',
    category: 'servizi',
    status: 'published',
    is_featured: true,
    author_id: '550e8400-e29b-41d4-a716-446655440001',
    views_count: 650,
    likes_count: 67,
    comments_count: 15,
    published_at: '2024-03-14T21:00:00Z',
    created_at: '2024-03-14T20:30:00Z',
    updated_at: '2024-03-14T21:00:00Z'
  }
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: 'event-001',
    title: 'Mercatino dell\'Antiquariato',
    slug: 'mercatino-antiquariato-ottobre',
    description: `Il tradizionale mercatino dell'antiquariato torna in Corso Umberto I con oltre 50 espositori provenienti da tutta la regione. Un'occasione unica per trovare oggetti d'epoca, libri antichi, mobili vintage e curiosità di ogni tipo.

L'evento si svolgerà lungo tutto il corso principale della città, dalle 8:00 alle 19:00. Sarà possibile trovare:
- Mobili e oggetti d'arredamento d'epoca
- Libri e stampe antiche  
- Gioielli vintage
- Ceramiche e porcellane
- Oggetti da collezione
- Abbigliamento vintage

Durante la giornata, i bar e ristoranti del centro offriranno menù speciali a tema. Non perdete l'occasione di fare una passeggiata tra le bancarelle e scoprire tesori nascosti!`,
    short_description: 'Mercatino dell\'antiquariato con oltre 50 espositori in Corso Umberto I',
    featured_image: '/images/mercatino-antiquariato.jpg',
    category: 'commerciale',
    location: 'Corso Umberto I',
    address: 'Corso Umberto I, Civitanova Marche',
    start_date: '2024-10-20T08:00:00+02:00',
    end_date: '2024-10-20T19:00:00+02:00',
    is_all_day: false,
    max_participants: null,
    current_participants: 0,
    price: 0,
    is_free: true,
    status: 'upcoming',
    organizer_id: '550e8400-e29b-41d4-a716-446655440001',
    contact_email: 'eventi@civitanova.it',
    contact_phone: '0733.123.456',
    is_featured: false,
    created_at: '2024-03-10T14:00:00Z',
    updated_at: '2024-03-10T14:00:00Z'
  },
  {
    id: 'event-002',
    title: 'Torneo di Beach Volley Amatoriale',
    slug: 'torneo-beach-volley-amatoriale',
    description: `Torna il tradizionale torneo di beach volley amatoriale sulla spiaggia di Civitanova Marche. L'evento è aperto a tutti, dai principianti ai giocatori più esperti.

**Categorie:**
- Maschile
- Femminile  
- Misto
- Under 18

Il torneo si svolgerà su 6 campi allestiti sulla spiaggia libera di fronte al Lungomare Sud. Ogni squadra deve essere composta da 4 giocatori (2 titolari + 2 riserve).

**Premi:**
- 1° classificato: Trofeo + 500€ in buoni spesa
- 2° classificato: Trofeo + 300€ in buoni spesa  
- 3° classificato: Trofeo + 200€ in buoni spesa

Le iscrizioni sono aperte fino al 25 ottobre. Quota di partecipazione: 40€ per squadra. Durante l'evento sarà attivo un punto ristoro con specialità locali.`,
    short_description: 'Torneo di beach volley amatoriale con 4 categorie sulla spiaggia di Civitanova',
    featured_image: '/images/beach-volley.jpg',
    category: 'sportivo',
    location: 'Spiaggia Lungomare Sud',
    address: 'Lungomare Sud, Civitanova Marche',
    latitude: 43.3058,
    longitude: 13.7086,
    start_date: '2024-10-28T09:00:00+01:00',
    end_date: '2024-10-28T18:00:00+01:00',
    is_all_day: false,
    max_participants: 64,
    current_participants: 28,
    price: 40.00,
    is_free: false,
    status: 'upcoming',
    organizer_id: '550e8400-e29b-41d4-a716-446655440003',
    contact_email: 'beachvolley@civitanova.it',
    contact_phone: '335.3456789',
    is_featured: true,
    created_at: '2024-03-05T11:00:00Z',
    updated_at: '2024-03-15T16:30:00Z'
  }
];

// Mock Badges
export const mockBadges: Badge[] = [
  {
    id: 'badge-001',
    name: 'Benvenuto a Civitanova',
    description: 'Primo accesso all\'app MyCivitanova',
    icon: '👋',
    color: '#3B82F6',
    category: 'generale',
    xp_reward: 50,
    requirements: {},
    is_active: true,
    rarity: 'comune',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'badge-002',
    name: 'Esploratore Urbano',
    description: 'Visita 5 luoghi diversi della città',
    icon: '🗺️',
    color: '#10B981',
    category: 'esploratore',
    xp_reward: 100,
    requirements: { places_visited: 5 },
    is_active: true,
    rarity: 'comune',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'badge-003',
    name: 'Partecipante Attivo',
    description: 'Partecipa al tuo primo evento',
    icon: '🎉',
    color: '#F59E0B',
    category: 'partecipazione',
    xp_reward: 150,
    requirements: { events_participated: 1 },
    is_active: true,
    rarity: 'comune',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'badge-004',
    name: 'Commentatore',
    description: 'Scrivi 10 commenti costruttivi',
    icon: '<span role="img" aria-label="Chat bubble emoji">💬</span>',
    color: '#8B5CF6',
    category: 'social',
    xp_reward: 200,
    requirements: { comments_written: 10 },
    is_active: true,
    rarity: 'raro',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'badge-005',
    name: 'Veterano di Civitanova',
    description: 'Utilizza l\'app per 365 giorni consecutivi',
    icon: '🏆',
    color: '#F97316',
    category: 'veterano',
    xp_reward: 1000,
    requirements: { consecutive_days: 365 },
    is_active: true,
    rarity: 'leggendario',
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Mock User XP
export const mockUserXP: UserXP[] = [
  {
    id: 'xp-001',
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    total_xp: 2450,
    current_level: 8,
    xp_to_next_level: 150,
    weekly_xp: 320,
    monthly_xp: 890,
    last_activity: '2024-03-15T14:30:00Z',
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-03-15T14:30:00Z'
  },
  {
    id: 'xp-002',
    user_id: '550e8400-e29b-41d4-a716-446655440004',
    total_xp: 1890,
    current_level: 6,
    xp_to_next_level: 210,
    weekly_xp: 180,
    monthly_xp: 650,
    last_activity: '2024-03-14T18:45:00Z',
    created_at: '2024-02-10T16:30:00Z',
    updated_at: '2024-03-14T18:45:00Z'
  }
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: 'comment-001',
    content: 'Bellissima iniziativa! Finalmente un parco giochi moderno per i nostri bambini. Complimenti all\'amministrazione!',
    author_id: '550e8400-e29b-41d4-a716-446655440003',
    parent_id: undefined,
    content_type: 'news',
    content_id: 'news-002',
    status: 'approved',
    likes_count: 5,
    reports_count: 0,
    created_at: '2024-03-14T22:15:00Z',
    updated_at: '2024-03-14T22:15:00Z'
  },
  {
    id: 'comment-002',
    content: 'Parteciperò sicuramente al torneo di beach volley. È un\'ottima occasione per fare sport e divertirsi!',
    author_id: '550e8400-e29b-41d4-a716-446655440004',
    parent_id: undefined,
    content_type: 'event',
    content_id: 'event-002',
    status: 'approved',
    likes_count: 3,
    reports_count: 0,
    created_at: '2024-03-15T10:30:00Z',
    updated_at: '2024-03-15T10:30:00Z'
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Nuovo evento disponibile',
    message: 'È stato pubblicato un nuovo evento: Torneo di Beach Volley Amatoriale',
    type: 'event',
    is_read: false,
    action_url: '/events/torneo-beach-volley-amatoriale',
    metadata: { event_id: 'event-002' },
    created_at: '2024-03-15T09:00:00Z'
  },
  {
    id: 'notif-002',
    user_id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Badge ottenuto!',
    message: 'Complimenti! Hai ottenuto il badge "Commentatore"',
    type: 'badge',
    is_read: true,
    action_url: '/profile/badges',
    metadata: { badge_id: 'badge-004' },
    created_at: '2024-03-14T15:20:00Z'
  },
  {
    id: 'notif-003',
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Promemoria evento',
    message: 'Ricorda: domani inizia il Mercatino dell\'Antiquariato',
    type: 'event',
    is_read: false,
    action_url: '/events/mercatino-antiquariato-ottobre',
    metadata: { event_id: 'event-001' },
    created_at: '2024-03-19T18:00:00Z'
  }
];

// Mock System Logs
export const mockSystemLogs: SystemLog[] = [
  {
    id: 'log-001',
    level: 'info',
    message: 'Utente registrato con successo',
    details: 'Nuovo utente: mario.rossi@email.com',
    source: 'auth.js',
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    ip_address: '192.168.1.50',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    metadata: { registration_method: 'email' },
    created_at: '2024-03-15T14:30:25Z'
  },
  {
    id: 'log-002',
    level: 'warning',
    message: 'Tentativo di accesso con credenziali errate',
    details: 'IP: 192.168.1.100, Email: test@test.com',
    source: 'auth.js',
    user_id: undefined,
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    metadata: { failed_attempts: 3 },
    created_at: '2024-03-15T14:25:12Z'
  },
  {
    id: 'log-003',
    level: 'error',
    message: 'Database connection failed',
    details: 'Connection timeout after 30 seconds',
    source: 'database.js:45',
    user_id: undefined,
    ip_address: undefined,
    user_agent: undefined,
    metadata: { error_code: 'CONN_TIMEOUT' },
    created_at: '2024-03-15T14:20:08Z'
  }
];

// Mock App Statistics
export const mockAppStatistics = {
  total_users: 1247,
  total_news: 45,
  total_events: 23,
  upcoming_events: 8,
  total_comments: 156,
  total_badges_earned: 89,
  active_users_today: 34,
  active_users_week: 187,
  most_popular_event: {
    title: 'Torneo di Beach Volley Amatoriale',
    participants: 28
  },
  latest_news: [
    {
      title: 'Inaugurazione Nuovo Parco Giochi in Via Leopardi',
      published_at: '2024-03-14T21:00:00Z'
    },
    {
      title: 'Festa del Mare 2024: Un Successo Straordinario',
      published_at: '2024-03-13T10:00:00Z'
    },
    {
      title: 'Raccolta Differenziata: Civitanova Raggiunge l\'80%',
      published_at: '2024-03-12T15:30:00Z'
    }
  ]
};

// Mock Leaderboard
export const mockLeaderboard = [
  {
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    full_name: 'Mario Rossi',
    avatar_url: null,
    total_xp: 2450,
    current_level: 8,
    position: 1
  },
  {
    user_id: '550e8400-e29b-41d4-a716-446655440004',
    full_name: 'Giulia Bianchi',
    avatar_url: null,
    total_xp: 1890,
    current_level: 6,
    position: 2
  },
  {
    user_id: '550e8400-e29b-41d4-a716-446655440005',
    full_name: 'Luca Verdi',
    avatar_url: null,
    total_xp: 1200,
    current_level: 4,
    position: 3
  }
];

// Utility function per ottenere dati mock
export const getMockData = {
  users: () => mockUsers,
  news: () => mockNews,
  events: () => mockEvents,
  badges: () => mockBadges,
  userXP: () => mockUserXP,
  comments: () => mockComments,
  notifications: () => mockNotifications,
  systemLogs: () => mockSystemLogs,
  appStatistics: () => mockAppStatistics,
  leaderboard: () => mockLeaderboard,
  
  // Funzioni per ottenere singoli elementi
  getUserById: (id: string) => mockUsers.find(user => user.id === id),
  getNewsById: (id: string) => mockNews.find(news => news.id === id),
  getEventById: (id: string) => mockEvents.find(event => event.id === event.id),
  getBadgeById: (id: string) => mockBadges.find(badge => badge.id === id),
  
  // Funzioni per filtrare
  getNewsByCategory: (category: string) => mockNews.filter(news => news.category === category),
  getEventsByCategory: (category: string) => mockEvents.filter(event => event.category === category),
  getUsersByRole: (role: string) => mockUsers.filter(user => user.role === role),
  getNotificationsByUser: (userId: string) => mockNotifications.filter(notif => notif.user_id === userId),
  getUnreadNotifications: (userId: string) => mockNotifications.filter(notif => notif.user_id === userId && !notif.is_read)
};