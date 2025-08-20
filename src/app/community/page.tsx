'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import ImageWithFallback from '@/components/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  AlertTriangle, 
  Users, 
  Calendar,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Filter,
  Search,
  Plus,
  TrendingUp,
  Award,
  Bell,
  Home,
  FileText,
  Star,
  Heart,
  Eye,
  Clock,
  Sparkles,
  Zap,
  SortDesc,
  Flame,
  ChevronDown,
  RefreshCw,
  Loader2
} from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { BottomNavbar } from '@/components/BottomNavbar';
import { CreatePostModal } from '@/components/CreatePostModal';
import { CommunityPostCard } from '@/components/CommunityPostCard';
import { CategoryFilter } from '@/components/community/CategoryFilter';
import { SortMenu } from '@/components/community/SortMenu';
import LoginModal from '@/components/LoginModal';
import { useToast } from '@/components/Toast';
import { useCommunity } from '@/hooks/useCommunity';
import { useSidebar } from '@/context/SidebarContext';
import { FetchPostsParams } from '@/lib/communityApi';


const CommunityPage = () => {
  const { sidebarWidth } = useSidebar();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Toast system
  const { showToast, ToastContainer } = useToast();
  
  // Hook per la gestione della community
  const {
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
    deletePost,
    hasMore,
    total
  } = useCommunity();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Ripristina filtri salvati
  useEffect(() => {
    try {
      const saved = localStorage.getItem('communityFilters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        if (typeof parsed.selectedCategory === 'string') setSelectedCategory(parsed.selectedCategory);
        if (parsed.sortBy) setSortBy(parsed.sortBy);
        if (typeof parsed.searchQuery === 'string') {
          setSearchQuery(parsed.searchQuery);
          setSearchInput(parsed.searchQuery);
        }
      }
    } catch {}
  }, []);

  // Persisti filtri
  useEffect(() => {
    try {
      localStorage.setItem('communityFilters', JSON.stringify({
        activeTab,
        selectedCategory,
        sortBy,
        searchQuery
      }));
    } catch {}
  }, [activeTab, selectedCategory, sortBy, searchQuery]);

  // Debounce search input -> searchQuery
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Carica i post all'avvio e quando cambiano i filtri
  useEffect(() => {
    const params: FetchPostsParams = {
      type: activeTab === 'all' ? undefined : activeTab,
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
      sortBy: sortBy,
      limit: 20
    };
    
    fetchPosts(params);
  }, [activeTab, selectedCategory, searchQuery, sortBy, fetchPosts]);

  // Infinite scroll: osserva il sentinel
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasMore && !loading && posts.length > 0) {
        const params: FetchPostsParams = {
          type: activeTab === 'all' ? undefined : activeTab,
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          sortBy: sortBy,
          limit: 20
        };
        loadMorePosts(params);
      }
    }, { rootMargin: '400px 0px' });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [activeTab, selectedCategory, searchQuery, sortBy, hasMore, loading, posts.length, loadMorePosts]);

  // Gestori eventi
  const handleCreatePost = async (postData: any) => {
    try {
      await createPost(postData);
      // I post vengono aggiornati automaticamente dall'hook
    } catch (error) {
      console.error('Errore nella creazione del post:', error);
      throw error;
    }
  };

  // Gestisce il tentativo di aprire il modal di creazione post
  const handleNewPostClick = () => {
    setShowNewPost(true);
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      showToast('Effettua il login per mettere like ai post', 'info');
      return;
    }
    try {
      await toggleReaction(postId, 'like');
    } catch (error) {
      console.error('Errore nel like:', error);
      showToast('Errore nel mettere like al post', 'error');
    }
  };

  const handleDislike = async (postId: string) => {
    if (!currentUser) {
      showToast('Effettua il login per mettere dislike ai post', 'info');
      return;
    }
    try {
      await toggleReaction(postId, 'dislike');
    } catch (error) {
      console.error('Errore nel dislike:', error);
      showToast('Errore nel mettere dislike al post', 'error');
    }
  };

  const handleShare = async (postId: string, shareType: 'internal' | 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'link') => {
    if (!currentUser && shareType === 'internal') {
      showToast('Effettua il login per condividere internamente', 'info');
      return;
    }
    try {
      await sharePost(postId, shareType);
      showToast('Post condiviso con successo!', 'success');
    } catch (error) {
      console.error('Errore nella condivisione:', error);
      showToast('Errore nella condivisione del post', 'error');
    }
  };

  const handleComment = async (postId: string, content: string, parentId?: string) => {
    if (!currentUser) {
      showToast('Effettua il login per commentare i post', 'info');
      return;
    }
    try {
      await addComment({ post_id: postId, content, parent_id: parentId });
      showToast('Commento aggiunto con successo!', 'success');
    } catch (error) {
      console.error('Errore nel commento:', error);
      showToast('Errore nell\'aggiunta del commento', 'error');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!currentUser) {
      showToast('Effettua il login per eliminare i post', 'info');
      return;
    }
    try {
      await deletePost(postId);
      showToast('Post eliminato con successo!', 'success');
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
      showToast('Errore nell\'eliminazione del post', 'error');
    }
  };

  const handleRefresh = () => {
    const params: FetchPostsParams = {
      type: activeTab === 'all' ? undefined : activeTab,
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
      sortBy: sortBy,
      limit: 20
    };
    
    fetchPosts(params);
  };

  // Configurazione tabs
  const tabs = [
    { id: 'all', label: 'Tutto', icon: Home, count: posts.length },
    { id: 'report', label: 'Segnalazioni', icon: AlertTriangle, count: posts.filter(p => p.type === 'report').length },
    { id: 'discussion', label: 'Forum', icon: MessageCircle, count: posts.filter(p => p.type === 'discussion').length },
    { id: 'event', label: 'Eventi', icon: Calendar, count: posts.filter(p => p.type === 'event').length },
    { id: 'group', label: 'Gruppi', icon: Users, count: posts.filter(p => p.type === 'group').length },
  ];

  const categories = [
    'Generale',
    'Trasporti', 
    'Ambiente',
    'Sicurezza',
    'Eventi',
    'Servizi',
    'Turismo',
    'Sport',
    'Cultura'
  ];

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      
      <div
        style={{ marginLeft: sidebarWidth }}
        className="transition-all duration-500 ease-in-out pb-16 md:pb-0"
      >
        {/* Header */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Community</h1>
                <p className="text-white/60 text-sm">Connettiti con la tua città</p>
                <div className="mt-1 text-xs text-white/40">{total} post totali</div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={handleNewPostClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-accent text-dark-400 rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nuovo Post</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cerca nella community..."
                className="w-full bg-dark-300/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-accent text-dark-400'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id
                          ? 'bg-dark-400/20 text-dark-400'
                          : 'bg-white/10 text-white/60'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
            <SortMenu
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 pb-20">
          {/* Quick Post Creator (Facebook-style) */}
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-300/50 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-6"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center flex-shrink-0">
                  {currentUser.avatar ? (
                    <Image 
                      src={currentUser.avatar} 
                      alt={currentUser.display_name} 
                      className="w-full h-full rounded-full object-cover"
                      fill
                      sizes="40px"
                    />
                  ) : (
                    <span className="text-accent font-semibold text-sm">
                      {currentUser.display_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleNewPostClick}
                  className="flex-1 bg-dark-400/50 border border-white/10 rounded-full px-4 py-3 text-left text-white/60 hover:bg-dark-400/70 hover:border-white/20 transition-all"
                >
                  Cosa stai pensando, {currentUser.display_name?.split(' ')[0]}?
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleNewPostClick}
                    className="flex items-center space-x-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Discussione</span>
                  </button>
                  
                  <button
                    onClick={handleNewPostClick}
                    className="flex items-center space-x-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm">Segnalazione</span>
                  </button>
                  
                  <button
                    onClick={handleNewPostClick}
                    className="flex items-center space-x-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Evento</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            {loading && posts.length === 0 ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-dark-300/50 border border-white/10 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-white/10" />
                      <div className="flex-1">
                        <div className="h-3 bg-white/10 rounded w-1/3 mb-2" />
                        <div className="h-2 bg-white/10 rounded w-1/5" />
                      </div>
                    </div>
                    <div className="h-3 bg-white/10 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
                    <div className="h-40 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
              ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Nessun post trovato</h3>
                <p className="text-white/60 mb-4">
                  {searchQuery || selectedCategory 
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Sii il primo a condividere qualcosa!'
                  }
                </p>
                {currentUser && (
                  <button
                    onClick={() => setShowNewPost(true)}
                    className="px-4 py-2 bg-accent text-dark-400 rounded-lg font-medium hover:bg-accent/90 transition-colors"
                  >
                    Crea il primo post
                  </button>
                )}
              </div>
              ) : (
              posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post as any}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onShare={handleShare}
                  onComment={handleComment}
                  onDelete={handleDelete}
                  fetchComments={fetchComments}
                />
              ))
            )}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} />
          {posts.length > 0 && loading && (
            <div className="flex items-center justify-center py-6 text-white/60">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Caricamento...
            </div>
          )}
          {posts.length > 0 && !hasMore && (
            <div className="text-center py-6 text-white/40 text-sm">Hai visto tutti i post</div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={showNewPost}
        onClose={() => setShowNewPost(false)}
        onSubmit={handleCreatePost}
        currentUser={currentUser}
      />


      {/* Toast Container */}
      <ToastContainer />

      <BottomNavbar />
    </div>
  );
};

export default CommunityPage;
