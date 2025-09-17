import { NewsItem, CreateNewsData, UpdateNewsData } from '@/types/news';
import { getConfig } from '@/config/production';
import { supabase } from '@/utils/supabaseClient';

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

// Helper mapping DB -> NewsItem
const mapNewsRow = (row: any): NewsItem => ({
  id: row.id,
  title: row.title,
  description: row.excerpt ?? undefined,
  content: row.content ?? undefined,
  type: row.is_featured ? 'urgent' : 'news',
  status: row.status ?? 'published',
  author_id: row.author_id ?? undefined,
  source: row.category ? `Categoria: ${row.category}` : undefined,
  image_url: row.featured_image ?? undefined,
  tags: undefined,
  likes_count: row.likes_count ?? 0,
  dislikes_count: 0,
  comments_count: row.comments_count ?? 0,
  views_count: row.views_count ?? 0,
  featured: !!row.is_featured,
  published_at: row.published_at ?? undefined,
  created_at: row.created_at ?? new Date().toISOString(),
  updated_at: row.updated_at ?? new Date().toISOString(),
});

const mapEventRow = (row: any): NewsItem => ({
  id: row.id,
  title: row.title,
  description: row.short_description ?? undefined,
  content: row.description ?? undefined,
  type: 'event',
  status: row.status ?? 'published',
  author_id: undefined,
  source: row.category ? `Evento: ${row.category}` : 'Evento',
  image_url: row.featured_image ?? undefined,
  tags: undefined,
  likes_count: 0,
  dislikes_count: 0,
  comments_count: 0,
  views_count: 0,
  featured: !!row.is_featured,
  published_at: row.start_date ?? undefined,
  created_at: row.created_at ?? new Date().toISOString(),
  updated_at: row.updated_at ?? new Date().toISOString(),
});

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

  // Ottieni news/eventi da Supabase con filtri, ricerca e paginazione; fallback ai mock
  async getNews(filters?: {
    type?: 'urgent' | 'news' | 'event' | 'all';
    status?: 'draft' | 'published' | 'archived' | 'all' | 'upcoming' | 'ongoing';
    featured?: boolean;
    search?: string;
    category?: string;
    limit?: number;
    page?: number;
    pageSize?: number;
  }): Promise<NewsItem[]> {
    const cfg = getConfig();
    const useMock = cfg.USE_MOCK_DATA && cfg.MOCK_SERVICES.news;

    const type = filters?.type ?? 'all';
    const search = filters?.search?.trim();
    const category = filters?.category;
    const page = filters?.page ?? 0;
    const pageSize = filters?.pageSize ?? (filters?.limit ?? 10);

    try {
      // Decidi tabella e campi
      const isEvents = type === 'event';
      const table = isEvents ? 'events' : 'news';
      let query = supabase
        .from(table)
        .select(
          isEvents
            ? 'id,title,short_description,description,featured_image,category,is_featured,status,start_date,created_at,updated_at'
            : 'id,title,excerpt,content,featured_image,category,status,is_featured,author_id,views_count,likes_count,comments_count,published_at,created_at,updated_at'
        );

      // Stato / featured / urgent
      if (!isEvents) {
        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        } else {
          query = query.eq('status', 'published');
        }
        if (type === 'urgent' || filters?.featured === true) {
          query = query.eq('is_featured', true);
        }
      } else {
        if (filters?.status && ['upcoming', 'ongoing'].includes(filters.status)) {
          query = query.eq('status', filters.status);
        } else {
          query = query.in('status', ['upcoming', 'ongoing']);
        }
      }

      if (category && category !== 'tutte') {
        query = query.eq('category', category);
      }

      if (search) {
        const term = `%${search}%`;
        query = query.or(
          isEvents
            ? `title.ilike.${term},description.ilike.${term}`
            : `title.ilike.${term},content.ilike.${term},excerpt.ilike.${term}`
        );
      }

      // Ordinamento e paginazione
      query = isEvents
        ? query.order('start_date', { ascending: true, nullsFirst: false })
        : query.order('published_at', { ascending: false, nullsFirst: false });

      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || []).map((row: any) => (isEvents ? mapEventRow(row) : mapNewsRow(row)));

      // Se filtro type = all: unisci news+events
      if (type === 'all') {
        const [{ data: eventsData, error: evErr }] = await Promise.all([
          supabase
            .from('events')
            .select('id,title,short_description,description,featured_image,category,is_featured,status,start_date,created_at,updated_at')
            .in('status', ['upcoming', 'ongoing'])
            .order('start_date', { ascending: true, nullsFirst: false })
            .range(0, Math.max(0, pageSize - 1)),
        ]);
        if (evErr) throw evErr;
        const evMapped = (eventsData || []).map(mapEventRow);
        return [...mapped, ...evMapped];
      }

      return mapped;
    } catch (e) {
      console.warn('getNews: fallback ai mock per errore Supabase', e);
      if (!useMock) throw e;

      // MOCK: applichiamo approssimativamente gli stessi filtri
      let filteredNews = [...this.newsData];

      if (filters?.type && filters.type !== 'all') {
        filteredNews = filteredNews.filter(n => n.type === filters.type);
      }
      if (filters?.status && filters.status !== 'all') {
        filteredNews = filteredNews.filter(n => n.status === filters.status);
      } else {
        filteredNews = filteredNews.filter(n => n.status === 'published');
      }
      if (filters?.featured !== undefined) {
        filteredNews = filteredNews.filter(n => n.featured === filters.featured);
      }
      if (filters?.category && filters.category !== 'tutte') {
        filteredNews = filteredNews.filter(n => (n.source || '').toLowerCase().includes(filters.category!.toLowerCase()));
      }
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        filteredNews = filteredNews.filter(n =>
          n.title.toLowerCase().includes(s) ||
          (n.description || '').toLowerCase().includes(s) ||
          (n.content || '').toLowerCase().includes(s)
        );
      }
      filteredNews.sort((a, b) => {
        const da = new Date(a.published_at || a.created_at).getTime();
        const db = new Date(b.published_at || b.created_at).getTime();
        return db - da;
      });
      const page = filters?.page ?? 0;
      const pageSize = filters?.pageSize ?? (filters?.limit ?? 10);
      const start = page * pageSize;
      return filteredNews.slice(start, start + pageSize);
    }
  }

  // Realtime subscribe news+events => callback con NewsItem e azione
  subscribeRealtime(
    onChange: (payload: { action: 'INSERT' | 'UPDATE' | 'DELETE'; item: NewsItem }) => void
  ): () => void {
    const newsChannel = supabase
      .channel('realtime-news-service')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new;
          if (row.status === 'published') onChange({ action: 'INSERT', item: mapNewsRow(row) });
        } else if (payload.eventType === 'UPDATE') {
          onChange({ action: 'UPDATE', item: mapNewsRow(payload.new) });
        } else if (payload.eventType === 'DELETE') {
          onChange({ action: 'DELETE', item: mapNewsRow(payload.old) });
        }
      })
      .subscribe();

    const eventsChannel = supabase
      .channel('realtime-events-service')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          onChange({ action: 'INSERT', item: mapEventRow(payload.new) });
        } else if (payload.eventType === 'UPDATE') {
          onChange({ action: 'UPDATE', item: mapEventRow(payload.new) });
        } else if (payload.eventType === 'DELETE') {
          onChange({ action: 'DELETE', item: mapEventRow(payload.old) });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(newsChannel);
      supabase.removeChannel(eventsChannel);
    };
  }

  // Ottieni una singola news per ID (mock o best-effort supabase)
  async getNewsById(id: string): Promise<NewsItem | null> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id,title,excerpt,content,featured_image,category,status,is_featured,author_id,views_count,likes_count,comments_count,published_at,created_at,updated_at')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data ? mapNewsRow(data) : null;
    } catch {
      const news = this.newsData.find(item => item.id === id);
      return news || null;
    }
  }

  // Ottieni news in evidenza (real o mock)
  async getFeaturedNews(): Promise<NewsItem[]> {
    return this.getNews({ featured: true, limit: 5, type: 'news' });
  }

  // Ottieni news per tipo (real o mock)
  async getNewsByType(type: 'urgent' | 'news' | 'event'): Promise<NewsItem[]> {
    return this.getNews({ type, status: type === 'event' ? 'upcoming' : 'published', limit: 10 });
  }

  // Crea una nuova news (mock locale; per produzione servirebbero endpoint o RLS opportune)
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

  // Aggiorna una news esistente (mock)
  async updateNews(data: UpdateNewsData): Promise<NewsItem> {
    const index = this.newsData.findIndex(news => news.id === data.id);
    if (index === -1) {
      throw new Error('News non trovata');
    }

    const updatedNews = {
      ...this.newsData[index],
      ...data,
      updated_at: new Date().toISOString(),
    } as NewsItem;

    if (data.status === 'published' && !this.newsData[index].published_at) {
      updatedNews.published_at = new Date().toISOString();
    }

    this.newsData[index] = updatedNews;
    return updatedNews;
  }

  // Elimina una news (mock)
  async deleteNews(id: string): Promise<boolean> {
    const index = this.newsData.findIndex(news => news.id === id);
    if (index === -1) {
      return false;
    }

    this.newsData.splice(index, 1);
    return true;
  }

  // Toggle featured status (mock)
  async toggleFeatured(id: string): Promise<boolean> {
    const news = this.newsData.find(item => item.id === id);
    if (!news) {
      return false;
    }

    news.featured = !news.featured;
    news.updated_at = new Date().toISOString();
    return true;
  }

  // Aggiungi visualizzazione (best-effort supabase, altrimenti mock)
  async addView(newsId: string, userId?: string): Promise<boolean> {
    try {
      // Best-effort: incrementa views_count
      const { error } = await supabase.rpc('increment_news_views', { news_id: newsId });
      if (error) throw error;
      return true;
    } catch {
      const news = this.newsData.find(item => item.id === newsId);
      if (!news) return false;
      news.views_count += 1;
      return true;
    }
  }

  // Gestione reazioni (mock locale)
  async addReaction(newsId: string, userId: string, type: 'like' | 'dislike'): Promise<boolean> {
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
    }

    if (type === 'like') {
      news.likes_count += 1;
    } else {
      news.dislikes_count += 1;
    }

    userReactions.set(reactionKey, type);
    return true;
  }

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

  async getUserReaction(newsId: string, userId: string): Promise<'like' | 'dislike' | null> {
    const reactionKey = `${newsId}-${userId}`;
    return userReactions.get(reactionKey) || null;
  }

  // Aggiungi commento (mock)
  async addComment(newsId: string, userId: string, content: string): Promise<boolean> {
    const news = this.newsData.find(item => item.id === newsId);
    if (!news) {
      return false;
    }

    news.comments_count += 1;
    return true;
  }

  // Ottieni statistiche (mock)
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