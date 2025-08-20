'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { CommunityAPI, FetchPostsParams } from '@/lib/communityApi';
import { useLoading } from '@/context/LoadingContext';

export interface CommunityPost {
  id: string;
  user_id: string;
  type: 'report' | 'discussion' | 'event' | 'group' | 'announcement';
  title: string;
  content: string;
  location?: string;
  category?: string;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  images?: string[];
  tags?: string[];
  is_pinned: boolean;
  is_locked: boolean;
  visibility: 'public' | 'private' | 'friends';
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  // Dati dell'autore
  user_reaction?: string;
  time_ago?: string;
  profiles?: {
    display_name: string;
    avatar: string;
    role: string;
  };
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  images?: string[];
  likes_count: number;
  dislikes_count: number;
  is_solution: boolean;
  is_edited?: boolean;
  created_at: string;
  updated_at: string;
  // Dati dell'autore
  author_name?: string;
  author_avatar?: string;
  author_role?: string;
  user_reaction?: string;
  time_ago?: string;
  // Risposte
  replies?: CommunityComment[];
}

export interface CreatePostData {
  type: CommunityPost['type'];
  title: string;
  content: string;
  location?: string;
  category?: string;
  images?: string[];
  tags?: string[];
  visibility?: CommunityPost['visibility'];
}

export interface CreateCommentData {
  post_id: string;
  content: string;
  parent_id?: string;
  images?: string[];
}

export const useCommunity = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const { startLoading, stopLoading } = useLoading();

  // Carica l'utente corrente
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // Prima prova localStorage (per bypass login)
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
          return;
        }

        // Poi prova Supabase Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setCurrentUser(profile);
        }
      } catch (err) {
        console.error('Errore nel caricamento utente:', err);
      }
    };

    getCurrentUser();
  }, []);

  // Carica i post
  const fetchPosts = useCallback(async (params: FetchPostsParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await CommunityAPI.fetchPosts(params);
      setHasMore(result.hasMore);
      setTotal(result.total);
      
      const processedPosts = result.posts.map(post => ({
        ...post,
        author_name: post.profiles?.display_name || 'Utente Sconosciuto',
        author_avatar: post.profiles?.avatar || undefined,
        author_role: post.profiles?.role || undefined,
      }));

      // Se l'utente è loggato, recupera le sue reazioni per ogni post
      if (currentUser) {
        const postsWithReactions = await Promise.all(
          processedPosts.map(async (post) => {
            try {
              const userReaction = await CommunityAPI.getUserReaction(post.id, currentUser.id);
              return { ...post, user_reaction: userReaction || undefined };
            } catch (error) {
              console.error('Errore nel recupero reazione utente:', error);
              return post;
            }
          })
        );
        setPosts(postsWithReactions);
      } else {
        setPosts(processedPosts);
      }
      
    } catch (err) {
      console.error('Errore nel recupero dei post:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei post');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Caricamento incrementale
  const loadMorePosts = useCallback(async (params: FetchPostsParams = {}) => {
    try {
      if (loading || !hasMore) return;
      setLoading(true);
      setError(null);

      const result = await CommunityAPI.fetchPosts({
        ...params,
        offset: posts.length,
      });

      setHasMore(result.hasMore);
      setTotal(result.total);

      const processedNewPosts = result.posts.map(post => ({
        ...post,
        author_name: post.profiles?.display_name || 'Utente Sconosciuto',
        author_avatar: post.profiles?.avatar || undefined,
        author_role: post.profiles?.role || undefined,
      }));

      if (currentUser) {
        const postsWithReactions = await Promise.all(
          processedNewPosts.map(async (post) => {
            try {
              const userReaction = await CommunityAPI.getUserReaction(post.id, currentUser.id);
              return { ...post, user_reaction: userReaction || undefined };
            } catch (error) {
              console.error('Errore nel recupero reazione utente:', error);
              return post;
            }
          })
        );
        setPosts(prev => [...prev, ...postsWithReactions]);
      } else {
        setPosts(prev => [...prev, ...processedNewPosts]);
      }
    } catch (err) {
      console.error('Errore nel caricamento incrementale dei post:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei post');
    } finally {
      setLoading(false);
    }
  }, [currentUser, posts.length, hasMore, loading]);

  // Crea un nuovo post
  const createPost = useCallback(async (postData: CreatePostData) => {
    try {
      if (!currentUser) {
        throw new Error('Utente non autenticato');
      }

      setLoading(true);
      setError(null);

      const newPost = await CommunityAPI.createPost({
        ...postData,
        user_id: currentUser.id
      });

      // Aggiungi il nuovo post alla lista esistente
      setPosts(prevPosts => [newPost, ...prevPosts]);

      return newPost;
    } catch (err) {
      console.error('Errore nella creazione post:', err);
      setError(err instanceof Error ? err.message : 'Errore nella creazione del post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Carica i commenti di un post
  const fetchComments = useCallback(async (postId: string): Promise<CommunityComment[]> => {
    try {
      return await CommunityAPI.fetchComments(postId);
    } catch (err) {
      console.error('Errore nel recupero dei commenti:', err);
      throw err;
    }
  }, []);

  // Aggiungi un commento
  const addComment = useCallback(async (commentData: CreateCommentData) => {
    try {
      if (!currentUser) {
        throw new Error('Utente non autenticato');
      }

      return await CommunityAPI.addComment({
        ...commentData,
        user_id: currentUser.id
      });
    } catch (err) {
      console.error('Errore nell\'aggiunta commento:', err);
      throw err;
    }
  }, [currentUser]);

  // Gestisci reazione (like/dislike)
  const toggleReaction = useCallback(async (postId: string, reactionType: 'like' | 'dislike') => {
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }

    // Simula l'interazione per i dati finti
    if (error) {
      setPosts(prevPosts =>
        prevPosts.map(p => {
          if (p.id === postId) {
            const newPost = { ...p };
            const currentReaction = newPost.user_reaction;

            // Logica per aggiornare i conteggi e la reazione dell'utente
            if (currentReaction === reactionType) { // Rimuove la reazione
              newPost.user_reaction = undefined;
              if (reactionType === 'like') newPost.likes_count--;
              else newPost.dislikes_count--;
            } else { // Aggiunge o cambia la reazione
              if (currentReaction === 'like') newPost.likes_count--;
              if (currentReaction === 'dislike') newPost.dislikes_count--;
              
              newPost.user_reaction = reactionType;
              if (reactionType === 'like') newPost.likes_count++;
              else newPost.dislikes_count++;
            }
            return newPost;
          }
          return p;
        })
      );
      return;
    }

    // Logica reale con API
    try {
      const result = await CommunityAPI.toggleReaction(postId, currentUser.id, reactionType);
      // L'aggiornamento dei conteggi viene gestito dai trigger del DB, 
      // ma aggiorniamo la reazione dell'utente per un feedback immediato.
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            const updatedPost = { ...post };
            if (result.action === 'removed') {
              updatedPost.user_reaction = undefined;
            } else {
              updatedPost.user_reaction = result.newReaction;
            }
            // Potremmo anche aggiornare i conteggi localmente per evitare un refetch
            // Ma per ora ci affidiamo alla denormalizzazione del DB
            return updatedPost;
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Errore nella gestione reazione:', err);
      throw err;
    }
  }, [currentUser, error]);

  // Condividi un post
  const sharePost = useCallback(async (postId: string, shareType: 'internal' | 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'link') => {
    try {
      if (!currentUser) {
        throw new Error('Utente non autenticato');
      }

      await CommunityAPI.sharePost(postId, currentUser.id, shareType);

      // Aggiorna il contatore delle condivisioni localmente
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, shares_count: post.shares_count + 1 }
            : post
        )
      );

    } catch (err: any) {
      console.error('Errore nella condivisione:', err);
      throw err;
    }
  }, [currentUser]);

  // Segna un post come visualizzato
  const markAsViewed = useCallback(async (postId: string) => {
    try {
      const userAgent = navigator.userAgent;
      await CommunityAPI.markAsViewed(postId, currentUser?.id, undefined, userAgent);
    } catch (err) {
      console.error('Errore nella marcatura visualizzazione:', err);
    }
  }, [currentUser]);

  // Elimina un post
  const deletePost = useCallback(async (postId: string) => {
    try {
      if (!currentUser) {
        throw new Error('Utente non autenticato');
      }

      await CommunityAPI.deletePost(postId);

      // Rimuovi il post dalla lista locale
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

    } catch (err) {
      console.error('Errore nell\'eliminazione post:', err);
      throw err;
    }
  }, [currentUser]);

  // Aggiorna un post
  const updatePost = useCallback(async (postId: string, updates: Partial<CreatePostData>) => {
    try {
      if (!currentUser) {
        throw new Error('Utente non autenticato');
      }

      const updatedPost = await CommunityAPI.updatePost(postId, updates);

      // Aggiorna il post nella lista locale
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId ? updatedPost : post
        )
      );

      return updatedPost;
    } catch (err) {
      console.error('Errore nell\'aggiornamento post:', err);
      throw err;
    }
  }, [currentUser]);

  return {
    posts,
    loading,
    error,
    currentUser,
    fetchPosts,
    loadMorePosts,
    createPost,
    fetchComments,
    addComment,
    toggleReaction,
    sharePost,
    markAsViewed,
    deletePost,
    updatePost,
    hasMore,
    total
  };
};
