import { supabase } from '@/utils/supabaseClient';
import { CommunityPost, CommunityComment, CreatePostData, CreateCommentData } from '@/hooks/useCommunity';

export interface FetchPostsParams {
  type?: string;
  category?: string;
  search?: string;
  userId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'recent' | 'popular' | 'trending';
  status?: string;
  location?: string;
}

export interface PostStats {
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  engagement_score: number;
  trending_score: number;
}

export class CommunityAPI {
  
  /**
   * Recupera i post della community con filtri e paginazione
   */
  static async fetchPosts(params: FetchPostsParams = {}): Promise<{
    posts: CommunityPost[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      let query = supabase
        .from('community_posts_with_stats')
        .select('*', { count: 'exact' });

      // Applica filtri
      if (params.type) {
        query = query.eq('type', params.type);
      }

      if (params.category) {
        query = query.eq('category', params.category);
      }

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }

      if (params.location) {
        query = query.ilike('location', `%${params.location}%`);
      }

      if (params.search) {
        query = query.or(`title.ilike.%${params.search}%,content.ilike.%${params.search}%`);
      }

      // Ordinamento
      switch (params.sortBy) {
        case 'popular':
          query = query.order('engagement_score', { ascending: false });
          break;
        case 'trending':
          query = query.order('trending_score', { ascending: false });
          break;
        case 'recent':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Paginazione: usa .range solo con limit definito per evitare errori
      const limit = typeof params.limit === 'number' ? params.limit : 20;
      const offset = typeof params.offset === 'number' ? params.offset : 0;
      if (typeof limit === 'number' && typeof offset === 'number') {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error, count } = await query;

      // Gestione robusta errori: considera errore solo se ha contenuto significativo
      const isMeaningfulError = !!(error && (error as any).message);
      if (isMeaningfulError) {
        console.error('Errore nel recupero dei post:', error);
        throw error as any;
      }

      const posts = (data as any[]) || [];
      // Alcuni adapter Supabase non restituiscono count quando non esplicitato: fallback sicuro
      const total = typeof count === 'number' ? count : posts.length;
      const hasMore = posts.length === limit;

      return {
        posts: posts.map(this.transformPost),
        total,
        hasMore
      };
    } catch (error) {
      // Non sovrascrivere l'errore se è vuoto: crea un messaggio più utile
      const errorMessage = error instanceof Error && error.message ? error.message : 'Impossibile recuperare i post';
      const enhancedError = new Error(`Errore API fetchPosts: ${errorMessage}`);
      console.error(enhancedError.message);
      throw enhancedError;
    }
  }

  /**
   * Crea un nuovo post
   */
  static async createPost(postData: CreatePostData & { user_id: string }): Promise<CommunityPost> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert([{
          user_id: postData.user_id,
          type: postData.type,
          title: postData.title,
          content: postData.content,
          images: postData.images || [],
          location: postData.location,
          category: postData.category,
          tags: postData.tags || [],
          visibility: postData.visibility || 'public'
        }])
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar,
            role
          )
        `)
        .single();

      if (error) {
        console.error('Errore nella creazione del post:', error);
        throw error;
      }

      return this.transformPost({
        ...data,
        author_name: data.profiles?.display_name,
        author_avatar: data.profiles?.avatar,
        author_role: data.profiles?.role,
        likes_count: 0,
        dislikes_count: 0,
        comments_count: 0,
        shares_count: 0,
        views_count: 0,
        engagement_score: 0,
        trending_score: 0
      });
    } catch (error) {
      console.error('Errore API createPost:', error);
      throw error;
    }
  }

  /**
   * Aggiorna un post esistente
   */
  static async updatePost(postId: string, updates: Partial<CreatePostData>): Promise<CommunityPost> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar,
            role
          )
        `)
        .single();

      if (error) {
        console.error('Errore nell\'aggiornamento del post:', error);
        throw error;
      }

      return this.transformPost({
        ...data,
        author_name: data.profiles?.display_name,
        author_avatar: data.profiles?.avatar,
        author_role: data.profiles?.role
      });
    } catch (error) {
      console.error('Errore API updatePost:', error);
      throw error;
    }
  }

  /**
   * Elimina un post
   */
  static async deletePost(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Errore nell\'eliminazione del post:', error);
        throw error;
      }
    } catch (error) {
      console.error('Errore API deletePost:', error);
      throw error;
    }
  }

  /**
   * Recupera i commenti di un post
   */
  static async fetchComments(postId: string): Promise<CommunityComment[]> {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar,
            role
          ),
          replies:community_comments!parent_id (
            *,
            profiles:user_id (
              display_name,
              avatar,
              role
            )
          )
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Errore nel recupero dei commenti:', error);
        throw error;
      }

      return (data || []).map(comment => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        content: comment.content,
        images: comment.images || [],
        is_edited: comment.is_edited,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        author_name: comment.profiles?.display_name,
        author_avatar: comment.profiles?.avatar,
        author_role: comment.profiles?.role,
        likes_count: 0, // TODO: Implementare conteggio reazioni commenti
        dislikes_count: 0,
        is_solution: false,
        replies: (comment.replies || []).map((reply: any) => ({
          id: reply.id,
          post_id: reply.post_id,
          user_id: reply.user_id,
          parent_id: reply.parent_id,
          content: reply.content,
          images: reply.images || [],
          is_edited: reply.is_edited,
          created_at: reply.created_at,
          updated_at: reply.updated_at,
          author_name: reply.profiles?.display_name,
          author_avatar: reply.profiles?.avatar,
          author_role: reply.profiles?.role,
          likes_count: 0,
          dislikes_count: 0,
          is_solution: false
        }))
      }));
    } catch (error) {
      console.error('Errore API fetchComments:', error);
      throw error;
    }
  }

  /**
   * Aggiunge un commento a un post
   */
  static async addComment(commentData: CreateCommentData & { user_id: string }): Promise<CommunityComment> {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .insert([{
          post_id: commentData.post_id,
          user_id: commentData.user_id,
          parent_id: commentData.parent_id || null,
          content: commentData.content,
          images: commentData.images || []
        }])
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar,
            role
          )
        `)
        .single();

      if (error) {
        console.error('Errore nell\'aggiunta del commento:', error);
        throw error;
      }

      return {
        id: data.id,
        post_id: data.post_id,
        user_id: data.user_id,
        parent_id: data.parent_id,
        content: data.content,
        images: data.images || [],
        is_edited: data.is_edited,
        created_at: data.created_at,
        updated_at: data.updated_at,
        author_name: data.profiles?.display_name,
        author_avatar: data.profiles?.avatar,
        author_role: data.profiles?.role,
        likes_count: 0,
        dislikes_count: 0,
        is_solution: false,
        replies: []
      };
    } catch (error) {
      console.error('Errore API addComment:', error);
      throw error;
    }
  }

  /**
   * Gestisce le reazioni ai post (like/dislike)
   */
  static async toggleReaction(postId: string, userId: string, reactionType: 'like' | 'dislike'): Promise<{
    success: boolean;
    action: 'added' | 'removed' | 'changed';
    newReaction?: string;
  }> {
    try {
      // Controlla se esiste già una reazione
      const { data: existingReaction } = await supabase
        .from('community_reactions')
        .select('reaction_type')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Rimuovi la reazione se è la stessa
          const { error } = await supabase
            .from('community_reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);

          if (error) throw error;

          return { success: true, action: 'removed' };
        } else {
          // Cambia il tipo di reazione
          const { error } = await supabase
            .from('community_reactions')
            .update({ reaction_type: reactionType })
            .eq('post_id', postId)
            .eq('user_id', userId);

          if (error) throw error;

          return { success: true, action: 'changed', newReaction: reactionType };
        }
      } else {
        // Aggiungi nuova reazione
        const { error } = await supabase
          .from('community_reactions')
          .insert([{
            post_id: postId,
            user_id: userId,
            reaction_type: reactionType
          }]);

        if (error) throw error;

        return { success: true, action: 'added', newReaction: reactionType };
      }
    } catch (error) {
      console.error('Errore API toggleReaction:', error);
      throw error;
    }
  }

  /**
   * Condivide un post
   */
  static async sharePost(postId: string, userId: string, shareType: 'internal' | 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'link'): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_shares')
        .insert([{
          post_id: postId,
          user_id: userId,
          share_type: shareType
        }]);

      if (error) {
        console.error('Errore nella condivisione del post:', error);
        throw error;
      }
    } catch (error) {
      console.error('Errore API sharePost:', error);
      throw error;
    }
  }

  /**
   * Segna un post come visualizzato
   */
  static async markAsViewed(postId: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_views')
        .insert([{
          post_id: postId,
          user_id: userId || null,
          ip_address: ipAddress || null,
          user_agent: userAgent || null
        }]);

      // Ignora errori di duplicati (stesso utente, stesso post, stesso giorno)
      if (error && !error.message.includes('duplicate')) {
        console.error('Errore nel segnare come visualizzato:', error);
        throw error;
      }
    } catch (error) {
      console.error('Errore API markAsViewed:', error);
      // Non lanciare errore per le visualizzazioni
    }
  }

  /**
   * Recupera la reazione dell'utente corrente per un post
   */
  static async getUserReaction(postId: string, userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('community_reactions')
        .select('reaction_type')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Errore nel recupero della reazione utente:', error);
        throw error;
      }

      return data?.reaction_type || null;
    } catch (error) {
      console.error('Errore API getUserReaction:', error);
      return null;
    }
  }

  /**
   * Trasforma i dati del post dal database al formato dell'interfaccia
   */
  private static transformPost(rawPost: any): CommunityPost {
    return {
      id: rawPost.id,
      user_id: rawPost.user_id,
      type: rawPost.type,
      title: rawPost.title,
      content: rawPost.content,
      images: rawPost.images || [],
      location: rawPost.location,
      category: rawPost.category,
      tags: rawPost.tags || [],
      status: rawPost.status,
      visibility: rawPost.visibility,
      is_pinned: rawPost.is_pinned,
      is_locked: rawPost.is_locked || false,
      created_at: rawPost.created_at,
      updated_at: rawPost.updated_at,
      author_name: rawPost.author_name,
      author_avatar: rawPost.author_avatar,
      author_role: rawPost.author_role,
      likes_count: rawPost.likes_count || 0,
      dislikes_count: rawPost.dislikes_count || 0,
      comments_count: rawPost.comments_count || 0,
      shares_count: rawPost.shares_count || 0,
      views_count: rawPost.views_count || 0,
      user_reaction: undefined // Verrà popolato separatamente se necessario
    };
  }

  /**
   * Recupera le statistiche aggregate della community
   */
  static async getCommunityStats(): Promise<{
    totalPosts: number;
    totalUsers: number;
    totalReactions: number;
    totalComments: number;
    postsByType: Record<string, number>;
    postsByStatus: Record<string, number>;
  }> {
    try {
      const [
        { count: totalPosts },
        { count: totalUsers },
        { count: totalReactions },
        { count: totalComments },
        { data: postsByType },
        { data: postsByStatus }
      ] = await Promise.all([
        supabase.from('community_posts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('community_reactions').select('*', { count: 'exact', head: true }),
        supabase.from('community_comments').select('*', { count: 'exact', head: true }),
        supabase.from('community_posts').select('type').then(({ data }) => 
          data?.reduce((acc: Record<string, number>, post) => {
            acc[post.type] = (acc[post.type] || 0) + 1;
            return acc;
          }, {}) || {}
        ),
        supabase.from('community_posts').select('status').then(({ data }) => 
          data?.reduce((acc: Record<string, number>, post) => {
            acc[post.status] = (acc[post.status] || 0) + 1;
            return acc;
          }, {}) || {}
        )
      ]);

      return {
        totalPosts: totalPosts || 0,
        totalUsers: totalUsers || 0,
        totalReactions: totalReactions || 0,
        totalComments: totalComments || 0,
        postsByType: (postsByType as unknown as Record<string, number>) || {},
        postsByStatus: (postsByStatus as unknown as Record<string, number>) || {}
      };
    } catch (error) {
      console.error('Errore API getCommunityStats:', error);
      throw error;
    }
  }
}