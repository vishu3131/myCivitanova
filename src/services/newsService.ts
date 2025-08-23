import { NewsItem, CreateNewsData, UpdateNewsData } from '@/types/news';
import { getConfig } from '@/config/production';

// Dati mock per le news - simulano un database (solo per sviluppo)
export const mockNewsData: NewsItem[] = [
  {
    id: 'news-1',
    title: 'LAVORI STRADALI: Via Dante chiusa fino al 15 agosto',
    description: 'Prestare attenzione alle deviazioni segnalate.',
    content: 'A causa di lavori di rifacimento del manto stradale, Via Dante rimarrà chiusa al traffico fino al 15 agosto. Sono previste deviazioni attraverso Via Roma e Via Garibaldi. Si consiglia di utilizzare percorsi alternativi durante gli orari di punta.\n\nI lavori inizieranno alle ore 7:00 e termineranno alle 18:00 dal lunedì al venerdì. Durante il weekend la strada sarà riaperta al traffico.\n\nPer informazioni: Ufficio Tecnico 0733-123456',
    type: 'urgent',
    status: 'published',
    source: 'Ufficio Tecnico',
    tags: ['traffico', 'lavori', 'viabilità'],
    likes_count: 5,
    dislikes_count: 1,
    comments_count: 3,
    views_count: 150,
    featured: true,
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-2',
    title: 'Festa di San Giuliano – Programma completo degli eventi',
    description: 'Concerti, stand gastronomici e fuochi d\'artificio in piazza.',
    content: 'Dal 25 al 27 agosto si svolgerà la tradizionale Festa di San Giuliano in Piazza del Popolo.\n\nPROGRAMMA:\n\nVenerdì 25 agosto:\n- Ore 19:00: Apertura stand gastronomici\n- Ore 21:00: Concerto della Banda Comunale\n- Ore 23:00: DJ set\n\nSabato 26 agosto:\n- Ore 18:00: Giochi per bambini\n- Ore 20:00: Cena con specialità locali\n- Ore 22:00: Concerto rock con i "Civitanova Sound"\n\nDomenica 27 agosto:\n- Ore 19:00: Processione religiosa\n- Ore 21:00: Spettacolo folkloristico\n- Ore 23:30: Gran finale con fuochi d\'artificio\n\nIngresso gratuito a tutti gli eventi.',
    type: 'event',
    status: 'published',
    source: 'Comune di Civitanova',
    tags: ['eventi', 'festa', 'tradizione', 'musica'],
    likes_count: 12,
    dislikes_count: 0,
    comments_count: 8,
    views_count: 320,
    featured: true,
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-3',
    title: 'Nuova pista ciclabile inaugurata sul lungomare',
    description: 'Percorso panoramico di 3km con vista sul mare.',
    content: 'È stata inaugurata la nuova pista ciclabile che si estende per 3 chilometri lungo il lungomare di Civitanova Marche. Il percorso offre una vista panoramica sul mare ed è dotato di:\n\n- Aree di sosta ogni 500 metri\n- Fontanelle per l\'acqua\n- Rastrelliere per biciclette\n- Illuminazione LED per l\'uso serale\n- Segnaletica dedicata\n\nL\'opera fa parte del progetto di mobilità sostenibile del comune e rappresenta un investimento di 200.000 euro finanziato con fondi regionali.\n\nLa pista è aperta tutti i giorni dalle 6:00 alle 24:00 ed è accessibile anche a persone con disabilità motorie.',
    type: 'news',
    status: 'published',
    source: 'Civitanova Today',
    tags: ['mobilità', 'ambiente', 'sport', 'turismo'],
    likes_count: 8,
    dislikes_count: 2,
    comments_count: 5,
    views_count: 200,
    featured: false,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-4',
    title: 'Nuovi orari biblioteca comunale per l\'estate',
    description: 'Orari ridotti durante il periodo estivo.',
    content: 'La biblioteca comunale "Giuseppe Mazzini" adotta gli orari estivi dal 1° luglio al 31 agosto 2024.\n\nNUOVI ORARI:\n- Lunedì: 8:30 - 13:30\n- Martedì: 8:30 - 13:30\n- Mercoledì: 8:30 - 13:30 / 15:00 - 18:00\n- Giovedì: 8:30 - 13:30\n- Venerdì: 8:30 - 13:30\n- Sabato e Domenica: CHIUSO\n\nSERVIZI ATTIVI:\n- Prestito e restituzione libri\n- Consultazione in sede\n- Accesso internet e Wi-Fi gratuito\n- Prestito digitale 24h su 24 tramite app\n- Servizio fotocopie\n\nRimangono attivi tutti i servizi online accessibili dal sito web comunale.',
    type: 'news',
    status: 'published',
    source: 'Biblioteca Civica',
    tags: ['servizi', 'cultura', 'orari'],
    likes_count: 3,
    dislikes_count: 0,
    comments_count: 1,
    views_count: 85,
    featured: false,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'news-5',
    title: 'Concerto al tramonto - Lungomare Sud',
    description: 'Evento musicale gratuito sulla spiaggia.',
    content: 'Il 15 agosto alle ore 19:30 si terrà un concerto gratuito sulla spiaggia del Lungomare Sud in occasione di Ferragosto.\n\nPROGRAMMA MUSICALE:\n- Orchestra Comunale di Civitanova\n- Repertorio di musica classica e moderna\n- Durata: circa 2 ore con intervallo\n- Direttore: Maestro Antonio Rossi\n\nINFORMAZIONI PRATICHE:\n- Evento gratuito, non serve prenotazione\n- Si consiglia di portare sedie o teli\n- Area parcheggio disponibile in Via del Mare\n- Bar e ristoranti aperti nelle vicinanze\n- In caso di maltempo l\'evento si terrà al Teatro Comunale\n\nL\'evento è organizzato dall\'Assessorato alla Cultura in collaborazione con l\'Associazione Musicale "Note di Mare".',
    type: 'event',
    status: 'published',
    source: 'Eventi Estivi',
    tags: ['musica', 'eventi', 'ferragosto', 'cultura'],
    likes_count: 15,
    dislikes_count: 0,
    comments_count: 12,
    views_count: 280,
    featured: true,
    published_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Simulazione di storage locale per le reazioni degli utenti
const userReactions = new Map<string, 'like' | 'dislike'>();

// Servizio per la gestione delle news
export class NewsService {
  private static instance: NewsService;
  private newsData: NewsItem[] = getConfig().MOCK_SERVICES.news ? [...mockNewsData] : [];

  private constructor() {}

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  // Ottieni tutte le news con filtri opzionali
  async getNews(filters?: {
    type?: 'urgent' | 'news' | 'event' | 'all';
    status?: 'draft' | 'published' | 'archived' | 'all';
    featured?: boolean;
    search?: string;
    limit?: number;
  }): Promise<NewsItem[]> {
    let filteredNews = [...this.newsData];

    // Applica filtri
    if (filters?.type && filters.type !== 'all') {
      filteredNews = filteredNews.filter(news => news.type === filters.type);
    }

    if (filters?.status && filters.status !== 'all') {
      filteredNews = filteredNews.filter(news => news.status === filters.status);
    } else {
      // Di default mostra solo le news pubblicate
      filteredNews = filteredNews.filter(news => news.status === 'published');
    }

    if (filters?.featured !== undefined) {
      filteredNews = filteredNews.filter(news => news.featured === filters.featured);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredNews = filteredNews.filter(news => 
        news.title.toLowerCase().includes(searchTerm) ||
        news.description?.toLowerCase().includes(searchTerm) ||
        news.content?.toLowerCase().includes(searchTerm)
      );
    }

    // Ordina per data di pubblicazione (più recenti prima)
    filteredNews.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at);
      const dateB = new Date(b.published_at || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    // Applica limite
    if (filters?.limit) {
      filteredNews = filteredNews.slice(0, filters.limit);
    }

    return filteredNews;
  }

  // Ottieni una singola news per ID
  async getNewsById(id: string): Promise<NewsItem | null> {
    const news = this.newsData.find(item => item.id === id);
    return news || null;
  }

  // Ottieni news in evidenza
  async getFeaturedNews(): Promise<NewsItem[]> {
    return this.getNews({ featured: true, limit: 5 });
  }

  // Ottieni news per tipo
  async getNewsByType(type: 'urgent' | 'news' | 'event'): Promise<NewsItem[]> {
    return this.getNews({ type, status: 'published' });
  }

  // Crea una nuova news (solo per admin/editor)
  async createNews(data: CreateNewsData): Promise<NewsItem> {
    const newNews: NewsItem = {
      id: `news-${Date.now()}`,
      ...data,
      likes_count: 0,
      dislikes_count: 0,
      comments_count: 0,
      views_count: 0,
      featured: data.featured || false,
      status: data.status || 'draft',
      published_at: data.status === 'published' ? (data.published_at || new Date().toISOString()) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.newsData.unshift(newNews);
    return newNews;
  }

  // Aggiorna una news esistente (solo per admin/editor)
  async updateNews(data: UpdateNewsData): Promise<NewsItem> {
    const index = this.newsData.findIndex(news => news.id === data.id);
    if (index === -1) {
      throw new Error('News non trovata');
    }

    const updatedNews = {
      ...this.newsData[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    // Se si sta pubblicando per la prima volta, imposta published_at
    if (data.status === 'published' && !this.newsData[index].published_at) {
      updatedNews.published_at = new Date().toISOString();
    }

    this.newsData[index] = updatedNews;
    return updatedNews;
  }

  // Elimina una news (solo per admin/editor)
  async deleteNews(id: string): Promise<boolean> {
    const index = this.newsData.findIndex(news => news.id === id);
    if (index === -1) {
      return false;
    }

    this.newsData.splice(index, 1);
    return true;
  }

  // Toggle featured status
  async toggleFeatured(id: string): Promise<boolean> {
    const news = this.newsData.find(item => item.id === id);
    if (!news) {
      return false;
    }

    news.featured = !news.featured;
    news.updated_at = new Date().toISOString();
    return true;
  }

  // Aggiungi visualizzazione
  async addView(newsId: string, userId?: string): Promise<boolean> {
    const news = this.newsData.find(item => item.id === newsId);
    if (!news) {
      return false;
    }

    news.views_count += 1;
    return true;
  }

  // Gestione reazioni
  async addReaction(newsId: string, userId: string, type: 'like' | 'dislike'): Promise<boolean> {
    const news = this.newsData.find(item => item.id === newsId);
    if (!news) {
      return false;
    }

    const reactionKey = `${newsId}-${userId}`;
    const currentReaction = userReactions.get(reactionKey);

    // Rimuovi la reazione precedente se esiste
    if (currentReaction) {
      if (currentReaction === 'like') {
        news.likes_count = Math.max(0, news.likes_count - 1);
      } else {
        news.dislikes_count = Math.max(0, news.dislikes_count - 1);
      }
    }

    // Aggiungi la nuova reazione
    if (type === 'like') {
      news.likes_count += 1;
    } else {
      news.dislikes_count += 1;
    }

    userReactions.set(reactionKey, type);
    return true;
  }

  // Rimuovi reazione
  async removeReaction(newsId: string, userId: string): Promise<boolean> {
    const news = this.newsData.find(item => item.id === newsId);
    if (!news) {
      return false;
    }

    const reactionKey = `${newsId}-${userId}`;
    const currentReaction = userReactions.get(reactionKey);

    if (currentReaction) {
      if (currentReaction === 'like') {
        news.likes_count = Math.max(0, news.likes_count - 1);
      } else {
        news.dislikes_count = Math.max(0, news.dislikes_count - 1);
      }
      userReactions.delete(reactionKey);
    }

    return true;
  }

  // Ottieni reazione utente
  async getUserReaction(newsId: string, userId: string): Promise<'like' | 'dislike' | null> {
    const reactionKey = `${newsId}-${userId}`;
    return userReactions.get(reactionKey) || null;
  }

  // Aggiungi commento (simulato)
  async addComment(newsId: string, userId: string, content: string): Promise<boolean> {
    const news = this.newsData.find(item => item.id === newsId);
    if (!news) {
      return false;
    }

    news.comments_count += 1;
    return true;
  }

  // Ottieni statistiche
  async getStats() {
    const total = this.newsData.length;
    const published = this.newsData.filter(n => n.status === 'published').length;
    const draft = this.newsData.filter(n => n.status === 'draft').length;
    const urgent = this.newsData.filter(n => n.type === 'urgent' && n.status === 'published').length;
    const featured = this.newsData.filter(n => n.featured).length;
    const totalViews = this.newsData.reduce((sum, n) => sum + n.views_count, 0);
    const totalLikes = this.newsData.reduce((sum, n) => sum + n.likes_count, 0);
    const totalComments = this.newsData.reduce((sum, n) => sum + n.comments_count, 0);

    return {
      total_news: total,
      published_news: published,
      draft_news: draft,
      urgent_news: urgent,
      featured_news: featured,
      total_views: totalViews,
      total_likes: totalLikes,
      total_comments: totalComments,
    };
  }
}

// Esporta un'istanza singleton
export const newsService = NewsService.getInstance();