import { supabase } from '@/utils/supabaseClient';
import { CommunityPost, CreatePostData, CommunityComment, CreateCommentData } from '@/hooks/useCommunity';

const USE_MOCK_DATA = false; // Impostato a false per connettersi al database reale

// Interfaccia per i parametri di fetchPosts
export interface FetchPostsParams {
  type?: string;
  category?: string;
  search?: string;
  sortBy?: 'recent' | 'popular' | 'trending';
  limit?: number;
  offset?: number;
}

// Funzioni mockate
const mockApi = {
  fetchPosts: async (params: FetchPostsParams) => {
    console.warn("API MOCK: fetchPosts - Dati non reali.");
    // Simula un errore per mostrare i dati di fallback nella UI
    throw new Error("Errore API fetchPosts: Impossibile recuperare i post");
  },
  createPost: async (postData: any): Promise<CommunityPost> => {
    console.warn("API MOCK: createPost - Il post non verrà salvato.");
    return {
      ...postData,
      id: `fake-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      dislikes_count: 0,
      comments_count: 0,
      views_count: 0,
      shares_count: 0,
      is_pinned: false,
      is_locked: false,
      visibility: 'public',
    };
  },
  fetchComments: async (postId: string): Promise<CommunityComment[]> => {
    console.warn("API MOCK: fetchComments - Dati non reali.");
    return [];
  },
  addComment: async (commentData: any): Promise<CommunityComment> => {
    console.warn("API MOCK: addComment - Il commento non verrà salvato.");
    return {
      ...commentData,
      id: `fake-comment-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      dislikes_count: 0,
      is_solution: false,
    };
  },
  toggleReaction: async (postId: string, userId: string, reactionType: 'like' | 'dislike') => {
    console.warn("API MOCK: toggleReaction - La reazione non verrà salvata.");
    // Simula un'azione di aggiunta per il feedback visivo
    return { action: 'added', newReaction: reactionType };
  },
  getUserReaction: async (postId: string, userId: string): Promise<string | null> => {
    console.warn("API MOCK: getUserReaction - Dati non reali.");
    return null;
  },
  sharePost: async (postId: string, userId: string, shareType: string) => {
    console.warn("API MOCK: sharePost - La condivisione non verrà salvata.");
  },
  markAsViewed: async (postId: string, userId?: string, sessionId?: string, userAgent?: string) => {
    console.warn("API MOCK: markAsViewed - La visualizzazione non verrà salvata.");
  },
  deletePost: async (postId: string) => {
    console.warn("API MOCK: deletePost - Il post non verrà eliminato.");
  },
  updatePost: async (postId: string, updates: Partial<CreatePostData>): Promise<CommunityPost> => {
    console.warn("API MOCK: updatePost - Il post non verrà aggiornato.");
    // Questa funzione dovrebbe recuperare il post e applicare gli aggiornamenti.
    // Per ora, restituisce un oggetto vuoto con un ID.
    return { id: postId, ...updates } as CommunityPost;
  },
};

// Funzioni reali con Supabase
const supabaseApi = {
  fetchPosts: async (params: FetchPostsParams) => {
    let query = supabase
      .from('community_posts')
      .select('*, profiles(display_name, avatar, role)', { count: 'exact' })
      .order(params.sortBy === 'recent' ? 'created_at' : 'views_count', { ascending: false })
      .limit(params.limit || 20)
      .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1);

    if (params.type && params.type !== 'all') {
      query = query.eq('type', params.type);
    }
    if (params.category) {
      query = query.eq('category', params.category);
    }
    if (params.search) {
      query = query.ilike('title', `%${params.search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      posts: data as CommunityPost[],
      total: count || 0,
      hasMore: (data?.length || 0) + (params.offset || 0) < (count || 0),
    };
  },
  createPost: async (postData: any): Promise<CommunityPost> => {
    const { data, error } = await supabase
      .from('community_posts')
      .insert([postData])
      .select()
      .single();
    if (error) throw error;
    return data as CommunityPost;
  },
  fetchComments: async (postId: string): Promise<CommunityComment[]> => {
    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as CommunityComment[];
  },
  addComment: async (commentData: any): Promise<CommunityComment> => {
    const { data, error } = await supabase
      .from('community_comments')
      .insert([commentData])
      .select()
      .single();
    if (error) throw error;
    return data as CommunityComment;
  },
  toggleReaction: async (postId: string, userId: string, reactionType: 'like' | 'dislike') => {
    // Implementazione della logica di reazione con Supabase
    // 1. Controlla se esiste già una reazione
    const { data: existingReaction, error: fetchError } = await supabase
      .from('community_reactions')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // 'PGRST116' -> row not found
      throw fetchError;
    }

    // Caso 1: L'utente clicca sulla stessa reazione -> rimuovi la reazione
    if (existingReaction && existingReaction.reaction_type === reactionType) {
      const { error: deleteError } = await supabase
        .from('community_reactions')
        .delete()
        .match({ id: existingReaction.id });
      if (deleteError) throw deleteError;
      return { action: 'removed' };
    }

    // Caso 2: L'utente cambia reazione -> aggiorna la reazione
    if (existingReaction && existingReaction.reaction_type !== reactionType) {
      const { data, error: updateError } = await supabase
        .from('community_reactions')
        .update({ reaction_type: reactionType })
        .match({ id: existingReaction.id })
        .select()
        .single();
      if (updateError) throw updateError;
      return { action: 'changed', newReaction: data.reaction_type };
    }

    // Caso 3: Nessuna reazione esistente -> aggiungi nuova reazione
    if (!existingReaction) {
      const { data, error: insertError } = await supabase
        .from('community_reactions')
        .insert({ post_id: postId, user_id: userId, reaction_type: reactionType })
        .select()
        .single();
      if (insertError) throw insertError;
      return { action: 'added', newReaction: data.reaction_type };
    }
    
    return { action: 'none' };
  },
  getUserReaction: async (postId: string, userId: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from('community_reactions')
      .select('reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? data.reaction_type : null;
  },
  sharePost: async (postId: string, userId: string, shareType: string) => {
    // Logica per la condivisione
  },
  markAsViewed: async (postId: string, userId?: string, sessionId?: string, userAgent?: string) => {
    // Logica per segnare come visualizzato
  },
  deletePost: async (postId: string) => {
    const { error } = await supabase.from('community_posts').delete().match({ id: postId });
    if (error) throw error;
  },
  updatePost: async (postId: string, updates: Partial<CreatePostData>): Promise<CommunityPost> => {
    const { data, error } = await supabase
      .from('community_posts')
      .update(updates)
      .match({ id: postId })
      .select()
      .single();
    if (error) throw error;
    return data as CommunityPost;
  },
};

export const CommunityAPI = USE_MOCK_DATA ? mockApi : supabaseApi;
