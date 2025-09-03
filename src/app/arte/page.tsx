"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Calendar,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
  Grid,
  Filter,
  Search,
  X,
  Info,
  Camera,
  Palette,
  Star,
} from 'lucide-react';

import { artworks as artworksData } from '@/data/artworks';

interface ArtworkData {
  id: number;
  title: string;
  artist: string;
  year: string;
  location: string;
  description: string;
  image: string;
  category: 'murale' | 'scultura' | 'installazione' | 'pittura';
  likes: number;
  views: number;
  coordinates?: [number, number];
  tags: string[];
}

const SLIDE_MS = 5000; // leggermente più lento per migliore leggibilità
const SWIPE_THRESHOLD = 40; // px

export default function ArtePage() {
  const artworks = useMemo(() => artworksData, []);

  const [isClient, setIsClient] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>(() => (typeof window !== 'undefined' ? (localStorage.getItem('arte_view_mode') as 'carousel' | 'grid') || 'carousel' : 'carousel'));
  const [selectedCategory, setSelectedCategory] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('arte_category') || 'all' : 'all'));
  const [searchTerm, setSearchTerm] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('arte_search') || '' : ''));
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkData | null>(null);
  const [likedArtworks, setLikedArtworks] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem('arte_liked');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('arte_autoplay');
    return stored ? stored === 'true' : true;
  });
  const [showInfo, setShowInfo] = useState(false);
  const [toast, setToast] = useState<string>('');

  // Refs
  const touchStartX = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useRef<boolean>(false);

  // Categories with icons
  const categories = useMemo(
    () => [
      { id: 'all', name: 'Tutte', icon: Palette },
      { id: 'murale', name: 'Murales', icon: Camera },
      { id: 'scultura', name: 'Sculture', icon: Star },
      { id: 'installazione', name: 'Installazioni', icon: Grid },
      { id: 'pittura', name: 'Pitture', icon: Palette },
    ],
    []
  );

  // Counts per categoria (senza filtro di ricerca per coerenza)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: artworks.length };
    for (const c of ['murale', 'scultura', 'installazione', 'pittura']) {
      counts[c] = artworks.filter((a) => a.category === (c as ArtworkData['category'])).length;
    }
    return counts;
  }, [artworks]);

  // Filtro opere (memoizzato per performance)
  const filteredArtworks = useMemo(() => {
    const byCategory = artworks.filter((artwork) => selectedCategory === 'all' || artwork.category === selectedCategory);
    if (!searchTerm) return byCategory;
    const s = searchTerm.toLowerCase();
    return byCategory.filter((artwork) =>
      artwork.title.toLowerCase().includes(s) ||
      artwork.artist.toLowerCase().includes(s) ||
      artwork.tags.some((tag) => tag.toLowerCase().includes(s))
    );
  }, [artworks, selectedCategory, searchTerm]);

  // Clamp dello slide quando cambiano i risultati
  useEffect(() => {
    if (filteredArtworks.length === 0) {
      setCurrentSlide(0);
      return;
    }
    setCurrentSlide((prev) => Math.max(0, Math.min(prev, filteredArtworks.length - 1)));
    if (filteredArtworks.length > 0 && currentSlide >= filteredArtworks.length) {
      setCurrentSlide(0);
    }
  }, [currentSlide, filteredArtworks.length]);

  // Auto-play: preferenze "reduce motion" e tab visibility
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = media.matches;
    if (media.matches) setIsAutoPlaying(false);

    const onVisibility = () => {
      if (document.hidden) setIsAutoPlaying(false);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlaying || viewMode !== 'carousel' || filteredArtworks.length <= 1) return;
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % filteredArtworks.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [isAutoPlaying, viewMode, filteredArtworks.length]);

  // Persistenza preferenze base
  useEffect(() => {
    try {
      localStorage.setItem('arte_view_mode', viewMode);
      localStorage.setItem('arte_category', selectedCategory);
      localStorage.setItem('arte_search', searchTerm);
      localStorage.setItem('arte_autoplay', String(isAutoPlaying));
      localStorage.setItem('arte_liked', JSON.stringify(Array.from(likedArtworks)));
    } catch {}
  }, [viewMode, selectedCategory, searchTerm, isAutoPlaying, likedArtworks]);

  // Deep-linking: #id=XX oppure ?id=XX
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const getId = () => {
      const url = new URL(window.location.href);
      const fromQuery = url.searchParams.get('id');
      if (fromQuery) return Number(fromQuery);
      const hash = url.hash; // e.g. #id=3
      if (hash.startsWith('#id=')) return Number(hash.replace('#id=', ''));
      return null;
    };
    const id = getId();
    if (id) {
      const found = artworks.find((a) => a.id === id);
      if (found) setSelectedArtwork(found);
    }
  }, [artworks]);

  // Keyboard navigation (solo carousel attivo)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (viewMode !== 'carousel' || filteredArtworks.length === 0) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsAutoPlaying(false);
        setCurrentSlide((prev) => (prev + 1) % filteredArtworks.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsAutoPlaying(false);
        setCurrentSlide((prev) => (prev - 1 + filteredArtworks.length) % filteredArtworks.length);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [viewMode, filteredArtworks.length]);

  // Helpers
  const nextSlide = useCallback(() => {
    if (filteredArtworks.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % filteredArtworks.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [filteredArtworks.length]);

  const prevSlide = useCallback(() => {
    if (filteredArtworks.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + filteredArtworks.length) % filteredArtworks.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [filteredArtworks.length]);

  const toggleLike = useCallback((artworkId: number) => {
    setLikedArtworks((prev) => {
      const next = new Set(prev);
      if (next.has(artworkId)) next.delete(artworkId);
      else next.add(artworkId);
      return next;
    });
  }, []);

  const shareArtwork = useCallback(async (artwork: ArtworkData) => {
    try {
      const url = `${window.location.origin}/arte#id=${artwork.id}`;
      const title = `${artwork.title} – Arte a Civitanova`;
      const text = `${artwork.title} di ${artwork.artist} (${artwork.year}) – ${artwork.location}`;
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast('Link copiato negli appunti');
        setTimeout(() => setToast(''), 1800);
      }
    } catch {
      setToast('Impossibile condividere');
      setTimeout(() => setToast(''), 1800);
    }
  }, []);

  const openMaps = useCallback((artwork: ArtworkData) => {
    if (!artwork.coordinates) return;
    const [lat, lng] = artwork.coordinates;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlaying(false);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) nextSlide();
      else prevSlide();
    } else {
      // riprende autoplay se non si è navigato
      setIsAutoPlaying(true);
    }
    touchStartX.current = null;
  };

  const currentArtwork = filteredArtworks.length > 0 ? filteredArtworks[currentSlide] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <Link
                href="/"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group shrink-0"
                aria-label="Torna alla Home"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <div className="h-5 w-px bg-white/15 shrink-0" />
              <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent truncate">
                Arte a Civitanova
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <label className="relative hidden md:block" aria-label="Cerca opere">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cerca opere, artisti, tag..."
                  className="bg-white/10 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 w-60"
                />
              </label>

              {/* View Mode Toggle */}
              <div className="flex bg-white/10 rounded-lg p-1" role="tablist" aria-label="Modalità di visualizzazione">
                <button
                  onClick={() => setViewMode('carousel')}
                  role="tab"
                  aria-selected={viewMode === 'carousel'}
                  className={`p-2 rounded transition-colors outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                    viewMode === 'carousel' ? 'bg-cyan-500 text-white' : 'text-white/70 hover:text-white'
                  }`}
                  title="Vista carousel"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  role="tab"
                  aria-selected={viewMode === 'grid'}
                  className={`p-2 rounded transition-colors outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                    viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-white/70 hover:text-white'
                  }`}
                  title="Vista griglia"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Filters toggle (mobile + desktop) */}
              <button
                onClick={() => setShowFilters((s) => !s)}
                className={`p-2 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                  showFilters ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/70 hover:text-white'
                }`}
                aria-expanded={showFilters}
                aria-controls="filters-panel"
                title="Filtri"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div id="filters-panel" className="mt-3 p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategory === category.id;
                  const count = categoryCounts[category.id] ?? 0;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                        isActive ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'
                      }`}
                      aria-pressed={isActive}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{category.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {viewMode === 'carousel' ? (
          <div className="space-y-6 sm:space-y-8">
            {/* Carousel principale */}
            <div
              ref={carouselRef}
              className="relative"
              role="region"
              aria-roledescription="carousel"
              aria-label="Galleria murales – Arte a Civitanova"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div
                className="relative h-[60vh] sm:h-[65vh] lg:h-[70vh] rounded-2xl overflow-hidden shadow-2xl group"
                onMouseEnter={() => !reducedMotion.current && setIsAutoPlaying(false)}
                onMouseLeave={() => !reducedMotion.current && setIsAutoPlaying(true)}
              >
                {/* Background Image */}
                {currentArtwork ? (
                  <Image
                    src={currentArtwork.image}
                    alt={currentArtwork.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Controls */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm outline-none focus:ring-2 focus:ring-cyan-400/50"
                  aria-label="Slide precedente"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm outline-none focus:ring-2 focus:ring-cyan-400/50"
                  aria-label="Slide successiva"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Info correnti */}
                {currentArtwork && (
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm capitalize">
                            {currentArtwork.category}
                          </span>
                          <span className="text-white/70 text-xs sm:text-sm">{currentArtwork.year}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight truncate">
                          {currentArtwork.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/85 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <User className="w-4 h-4 shrink-0" />
                            <span className="truncate">{currentArtwork.artist}</span>
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{currentArtwork.location}</span>
                          </div>
                        </div>
                        <p className="text-white/90 text-sm sm:text-base max-w-2xl leading-relaxed line-clamp-3 sm:line-clamp-none">
                          {currentArtwork.description}
                        </p>
                      </div>

                      <div className="flex items-end gap-2 sm:gap-3 lg:flex-col lg:items-end lg:gap-3 lg:ml-6">
                        <button
                          onClick={() => currentArtwork && toggleLike(currentArtwork.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                            currentArtwork && likedArtworks.has(currentArtwork.id)
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                              : 'bg-white/10 text-white/80 hover:bg-white/20'
                          }`}
                          aria-label="Mi piace"
                        >
                          <Heart className={`w-5 h-5 ${currentArtwork && likedArtworks.has(currentArtwork.id) ? 'fill-current' : ''}`} />
                          <span className="text-sm">{currentArtwork ? currentArtwork.likes + (likedArtworks.has(currentArtwork.id) ? 1 : 0) : 0}</span>
                        </button>
                        <button
                          onClick={() => currentArtwork && shareArtwork(currentArtwork)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm outline-none focus:ring-2 focus:ring-cyan-400/50"
                          aria-label="Condividi"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="hidden sm:inline text-sm">Condividi</span>
                        </button>
                        {currentArtwork?.coordinates && (
                          <button
                            onClick={() => openMaps(currentArtwork)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm outline-none focus:ring-2 focus:ring-cyan-400/50"
                            aria-label="Apri in Maps"
                          >
                            <MapPin className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm">Apri in Maps</span>
                          </button>
                        )}
                        <button
                          onClick={() => setShowInfo(true)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm outline-none focus:ring-2 focus:ring-cyan-400/50"
                          aria-label="Dettagli pagina"
                        >
                          <Info className="w-5 h-5" />
                          <span className="hidden sm:inline text-sm">Dettagli</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress & stats */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2" aria-label="Indicatori slide">
                        {filteredArtworks.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`h-2 rounded-full transition-all duration-300 outline-none focus:ring-2 focus:ring-cyan-400/50 ${i === currentSlide ? 'bg-cyan-400 w-8' : 'bg-white/30 w-2 hover:bg-white/50'}`}
                            aria-label={`Vai alla slide ${i + 1}`}
                            aria-current={i === currentSlide}
                          />)
                        )}
                      </div>
                      {currentArtwork && (
                        <div className="flex items-center gap-4 text-white/70 text-xs sm:text-sm">
                          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{currentArtwork.views}</span>
                          <span>{filteredArtworks.length > 0 ? `${currentSlide + 1} / ${filteredArtworks.length}` : '0/0'}</span>
                          {isAutoPlaying && <span className="inline-flex w-3 h-3 bg-cyan-400 rounded-full animate-pulse" aria-label="Auto-play attivo" />}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {filteredArtworks.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-1" aria-label="Anteprime opere">
                {filteredArtworks.map((artwork, index) => (
                  <button
                    key={artwork.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-all duration-200 outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                      index === currentSlide ? 'ring-2 ring-cyan-400 scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    aria-label={`Mostra ${artwork.title}`}
                    aria-current={index === currentSlide}
                  >
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                    {index === currentSlide && <div className="absolute inset-0 bg-cyan-400/15" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredArtworks.map((artwork) => (
              <article
                key={artwork.id}
                className="group relative bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.01] cursor-pointer outline-none focus:ring-2 focus:ring-cyan-400/50"
                onClick={() => setSelectedArtwork(artwork)}
                tabIndex={0}
                aria-label={`${artwork.title} di ${artwork.artist}`}
              >
                <div className="relative h-44 sm:h-48">
                  <Image
                    src={artwork.image}
                    alt={artwork.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(artwork.id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                        likedArtworks.has(artwork.id) ? 'bg-red-500/20 text-red-300' : 'bg-black/30 text-white/80 hover:text-white'
                      }`}
                      aria-label="Mi piace"
                    >
                      <Heart className={`w-4 h-4 ${likedArtworks.has(artwork.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareArtwork(artwork);
                      }}
                      className="p-2 rounded-full bg-black/30 text-white/80 hover:text-white backdrop-blur-sm outline-none focus:ring-2 focus:ring-cyan-400/50"
                      aria-label="Condividi"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Category */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/50 text-white text-[11px] px-2 py-1 rounded-full backdrop-blur-sm capitalize">
                      {artwork.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1 line-clamp-1">{artwork.title}</h3>
                  <p className="text-white/70 text-sm mb-2">{artwork.artist} • {artwork.year}</p>
                  <p className="text-white/85 text-sm line-clamp-2 mb-3">{artwork.description}</p>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" />{artwork.likes + (likedArtworks.has(artwork.id) ? 1 : 0)}</span>
                      <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{artwork.views}</span>
                    </div>
                    <span className="truncate max-w-[50%] text-right">{artwork.location}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Nessun risultato */}
        {filteredArtworks.length === 0 && (
          <div className="text-center py-16">
            <Palette className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/80 mb-2">Nessuna opera trovata</h3>
            <p className="text-white/60">Modifica i filtri di ricerca o esplora tutte le categorie.</p>
          </div>
        )}
      </div>

      {/* Modale Dettaglio Opera */}
      {selectedArtwork && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors outline-none focus:ring-2 focus:ring-cyan-400/50"
                aria-label="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-80 sm:h-96">
                <Image
                  src={selectedArtwork.image}
                  alt={selectedArtwork.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{selectedArtwork.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-white/75 mb-2">
                      <span>{selectedArtwork.artist}</span>
                      <span className="opacity-50">•</span>
                      <span>{selectedArtwork.year}</span>
                      <span className="opacity-50">•</span>
                      <span className="capitalize">{selectedArtwork.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleLike(selectedArtwork.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                        likedArtworks.has(selectedArtwork.id) ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                      aria-label="Mi piace"
                    >
                      <Heart className={`w-5 h-5 ${likedArtworks.has(selectedArtwork.id) ? 'fill-current' : ''}`} />
                      <span>{selectedArtwork.likes + (likedArtworks.has(selectedArtwork.id) ? 1 : 0)}</span>
                    </button>
                    <button
                      onClick={() => shareArtwork(selectedArtwork)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors outline-none focus:ring-2 focus:ring-cyan-400/50"
                      aria-label="Condividi"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Condividi</span>
                    </button>
                  </div>
                </div>

                <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-6">{selectedArtwork.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">Dettagli</h4>
                    <div className="space-y-2 text-white/75">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{selectedArtwork.location}</span></div>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{selectedArtwork.year}</span></div>
                      <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>{selectedArtwork.artist}</span></div>
                      {selectedArtwork.coordinates && (
                        <button
                          onClick={() => openMaps(selectedArtwork)}
                          className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors outline-none focus:ring-2 focus:ring-cyan-400/50"
                        >
                          <MapPin className="w-4 h-4" /> Apri in Maps
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-3">Statistiche</h4>
                    <div className="space-y-2 text-white/75">
                      <div className="flex items-center justify-between"><span>Mi piace</span><span>{selectedArtwork.likes + (likedArtworks.has(selectedArtwork.id) ? 1 : 0)}</span></div>
                      <div className="flex items-center justify-between"><span>Visualizzazioni</span><span>{selectedArtwork.views}</span></div>
                    </div>
                  </div>
                </div>

                {/* Tag */}
                {selectedArtwork.tags?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-white mb-3">Tag</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtwork.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 text-white/75 rounded-full text-sm">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Arte a Civitanova</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors outline-none focus:ring-2 focus:ring-cyan-400/50"
                aria-label="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-white/85">
              <p>
                Scopri la ricca collezione di arte urbana e contemporanea di Civitanova Marche. Questa galleria digitale
                presenta le opere più significative che decorano la nostra città.
              </p>
              <div className="grid grid-cols-2 gap-4 py-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{artworks.length}</div>
                  <div className="text-sm text-white/60">Opere totali</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{new Set(artworks.map((a) => a.artist)).size}</div>
                  <div className="text-sm text-white/60">Artisti</div>
                </div>
              </div>
              <p className="text-sm text-white/65">
                Usa i filtri per esplorare le opere per categoria, cerca per titolo o artista e passa dalla vista carousel alla griglia.
                Suggerimento: con la barra spaziatrice metti in pausa/riprendi il carosello.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-lg bg-white/10 text-white/90 border border-white/15 shadow backdrop-blur-md">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
