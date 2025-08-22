"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchListingsWithImages, searchListings, AdvancedSearchFilters } from "@/services/marketplace";
import { ListingExpanded } from "@/types/marketplace";
import FavoriteButton from "@/components/marketplace/FavoriteButton";
import ListingForm from "@/components/marketplace/ListingForm";
import MyListings from "@/components/marketplace/MyListings";
import FavoritesList from "@/components/marketplace/FavoritesList";
import AdvancedFilters, { AdvancedFiltersState } from "@/components/marketplace/AdvancedFilters";

// Categories
const BENI_CATEGORIES = [
  "Elettronica",
  "Arredo",
  "Sport",
  "Auto & Moto",
  "Libri",
  "Bimbi",
  "Casa",
  "Altro",
];

const SERVIZI_CATEGORIES = [
  "Riparazioni",
  "Lezioni",
  "Benessere",
  "Pulizie",
  "Eventi",
  "Professionisti",
  "Traslochi",
  "Altro",
];

type ViewMode = "grid" | "list";
type ActiveView = "marketplace" | "add-listing" | "my-listings" | "favorites";

function SafeImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [error, setError] = React.useState(false);
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={!src || error ? "/marketplace/placeholder.svg" : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

export default function MarketplaceClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<"beni" | "servizi">("beni");
  const [activeView, setActiveView] = useState<ActiveView>("marketplace");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("recenti");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [listings, setListings] = useState<ListingExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<ListingExpanded | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
    priceRange: { min: null, max: null },
    location: '',
    locationRadius: 10,
    dateRange: { from: null, to: null },
    condition: null,
    tags: [],
    hasImages: false,
    hasReviews: false
  });

  useEffect(() => {
    if (searchParams) {
      const tab = (searchParams.get("tab") as "beni" | "servizi") || "beni";
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", activeTab);
      router.replace(`/marketplace?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchParams]); // Add searchParams to dependency array

  // Load listings
  const loadListings = async () => {
    try {
      setLoading(true);
      
      // Prepare advanced search filters
      const searchFilters: AdvancedSearchFilters = {
        type: activeTab,
        category: category || undefined,
        onlyAvailable,
        onlyVerified,
        minPrice: advancedFilters.priceRange.min || undefined,
        maxPrice: advancedFilters.priceRange.max || undefined,
        location: advancedFilters.location || undefined,
        locationRadius: advancedFilters.locationRadius,
        condition: advancedFilters.condition || undefined,
        tags: advancedFilters.tags.length > 0 ? advancedFilters.tags : undefined,
        hasImages: advancedFilters.hasImages,
        hasReviews: advancedFilters.hasReviews,
        dateFrom: advancedFilters.dateRange.from?.toISOString(),
        dateTo: advancedFilters.dateRange.to?.toISOString()
      };
      
      const params = {
        type: activeTab,
        query: query.trim() || undefined,
        category: category || undefined,
        onlyAvailable,
        onlyVerified,
        sort,
        limit: 50
      };
      
      const data = await searchListings(query.trim() || "", searchFilters);
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Errore nel caricamento degli annunci');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [activeTab, query, category, onlyAvailable, onlyVerified, sort, advancedFilters]);

  const categories = activeTab === "beni" ? BENI_CATEGORIES : SERVIZI_CATEGORIES;

  const featured = useMemo(() => {
    return [...listings]
      .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
      .slice(0, 5);
  }, [listings]);

  // Stats
  const activeCount = listings.length;
  const verifiedCount = listings.filter((l) => l.verified).length;
  const nearYouCount = listings.filter((l) => l.location?.toLowerCase().includes('civitanova')).length;

  const formatPrice = (listing: ListingExpanded) => {
    if (!listing.price_amount) return listing.price_type === 'free' ? 'Gratis' : 'Su richiesta';
    const currency = listing.price_currency === 'EUR' ? '€' : listing.price_currency || '€';
    const suffix = listing.price_type === 'hourly' ? '/h' : '';
    return `${listing.price_amount}${currency}${suffix}`;
  };

  const getListingImage = (listing: ListingExpanded) => {
    return listing.listing_images?.[0]?.url || '/marketplace/placeholder.svg';
  };

  const handleListingAction = (action: 'add' | 'edit' | 'view-my' | 'view-favorites', listing?: ListingExpanded) => {
    if (!user && action !== 'add') {
      toast.error('Devi effettuare il login per accedere a questa funzione');
      return;
    }
    
    switch (action) {
      case 'add':
        setActiveView('add-listing');
        setEditingListing(null);
        break;
      case 'edit':
        setActiveView('add-listing');
        setEditingListing(listing || null);
        break;
      case 'view-my':
        setActiveView('my-listings');
        break;
      case 'view-favorites':
        setActiveView('favorites');
        break;
    }
  };

  const handleListingSuccess = () => {
    setActiveView('marketplace');
    setEditingListing(null);
    loadListings();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky header con stats e CTA */}
      <div className="sticky top-0 z-30 bg-black/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/70 hover:text-white">←</Link>
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-lg">🛍️</span>
              <span>Marketplace Civitanova</span>
            </div>
            <div className="ml-auto flex gap-2">
              {user && (
                <>
                  <button 
                    onClick={() => handleListingAction('view-favorites')}
                    className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs hover:bg-white/20"
                  >
                    ❤️ Preferiti
                  </button>
                  <button 
                    onClick={() => handleListingAction('view-my')}
                    className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs hover:bg-white/20"
                  >
                    📋 I miei annunci
                  </button>
                </>
              )}
              <button 
                onClick={() => handleListingAction('add')}
                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs hover:bg-white/20"
              >
                + Nuovo annuncio
              </button>
            </div>
          </div>
          {/* mini-stats */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
              <span>📦</span>
              <div>
                <div className="text-white/90 font-medium">{activeCount}</div>
                <div className="text-white/60">Annunci attivi</div>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
              <span>✅</span>
              <div>
                <div className="text-white/90 font-medium">{verifiedCount}</div>
                <div className="text-white/60">Verificati</div>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
              <span>📍</span>
              <div>
                <div className="text-white/90 font-medium">{nearYouCount}</div>
                <div className="text-white/60">Vicino a te</div>
              </div>
            </div>
          </div>
        </div>
        {/* Navigation */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="flex gap-2 items-center">
            <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1">
              <button
                onClick={() => { setActiveView('marketplace'); setActiveTab("beni"); }}
                className={`px-4 py-1.5 text-sm rounded-lg flex items-center gap-1 ${activeView === 'marketplace' && activeTab === "beni" ? "bg-accent/20 text-white border border-accent/30" : "text-white/70 hover:text-white"}`}
              >
                <span>🛒</span> Beni
              </button>
              <button
                onClick={() => { setActiveView('marketplace'); setActiveTab("servizi"); }}
                className={`px-4 py-1.5 text-sm rounded-lg flex items-center gap-1 ${activeView === 'marketplace' && activeTab === "servizi" ? "bg-accent/20 text-white border border-accent/30" : "text-white/70 hover:text-white"}`}
              >
                <span>🧰</span> Servizi
              </button>
            </div>
            
            {activeView !== 'marketplace' && (
              <button
                onClick={() => setActiveView('marketplace')}
                className="px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/10 hover:bg-white/20"
              >
                ← Torna al marketplace
              </button>
            )}
          </div>
        </div>
        
        {/* Advanced Filters Component */}
         <AdvancedFilters
           filters={advancedFilters}
           onFiltersChange={setAdvancedFilters}
           isOpen={showAdvancedFilters}
           onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
           activeTab={activeTab}
         />
      </div>

      {/* Render different views */}
      {activeView === 'add-listing' && (
        <div className="max-w-3xl mx-auto px-4 py-6">
          <ListingForm 
            listing={editingListing}
            onSuccess={handleListingSuccess}
            onCancel={() => setActiveView('marketplace')}
          />
        </div>
      )}
      
      {activeView === 'my-listings' && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <MyListings onEdit={(listing) => handleListingAction('edit', listing)} />
        </div>
      )}
      
      {activeView === 'favorites' && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <FavoritesList />
        </div>
      )}

      {/* Marketplace view */}
      {activeView === 'marketplace' && (
        <>
          {/* Controls */}
          <div className="max-w-5xl mx-auto px-4 py-3 grid grid-cols-1 gap-3">
        {/* search + sort + view toggle */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50">🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Cerca ${activeTab === "beni" ? "oggetti" : "servizi"}...`}
              className="w-full pl-7 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                aria-label="Cancella ricerca"
              >
                ✖
              </button>
            )}
          </div>
          <div className="hidden sm:flex bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <button onClick={() => setSort("recenti")} className={`px-2 py-1 rounded-lg ${sort === "recenti" ? "bg-accent/20 border border-accent/30" : "hover:bg-white/10"}`}>Recenti</button>
            <button onClick={() => setSort("prezzo")} className={`px-2 py-1 rounded-lg ${sort === "prezzo" ? "bg-accent/20 border border-accent/30" : "hover:bg-white/10"}`}>Prezzo</button>
            <button onClick={() => setSort("rating")} className={`px-2 py-1 rounded-lg ${sort === "rating" ? "bg-accent/20 border border-accent/30" : "hover:bg-white/10"}`}>Rating</button>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <button onClick={() => setViewMode("grid")} className={`px-2 py-1 rounded-lg ${viewMode === "grid" ? "bg-accent/20 border border-accent/30" : "hover:bg-white/10"}`}>Griglia</button>
            <button onClick={() => setViewMode("list")} className={`px-2 py-1 rounded-lg ${viewMode === "list" ? "bg-accent/20 border border-accent/30" : "hover:bg-white/10"}`}>Lista</button>
          </div>
        </div>

        {/* quick toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOnlyAvailable((v) => !v)}
            className={`px-3 py-1.5 rounded-full text-[12px] border flex items-center gap-1 ${onlyAvailable ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <span>🟢</span> Solo disponibili
          </button>
          <button
            onClick={() => setOnlyVerified((v) => !v)}
            className={`px-3 py-1.5 rounded-full text-[12px] border flex items-center gap-1 ${onlyVerified ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <span>🛡️</span> Solo verificati
          </button>
          <button
            onClick={() => {
              setCategory(null);
              setQuery("");
              setOnlyAvailable(false);
              setOnlyVerified(false);
              setSort("recenti");
              setAdvancedFilters({
                priceRange: { min: null, max: null },
                location: '',
                locationRadius: 10,
                dateRange: { from: null, to: null },
                condition: null,
                tags: [],
                hasImages: false,
                hasReviews: false
              });
              setShowAdvancedFilters(false);
            }}
            className="ml-auto px-3 py-1.5 rounded-full text-[12px] border bg-white/5 border-white/10 hover:bg-white/10"
          >
            Reset filtri
          </button>
        </div>

        {/* Category chips: scroll or wrap */}
        <div className="-mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 py-1 w-max">
            <button
              onClick={() => setCategory(null)}
              className={`px-3 py-1.5 rounded-full text-[12px] border ${category === null ? "bg-accent/20 border-accent/30" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
            >
              Tutte le categorie
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-[12px] border ${category === c ? "bg-accent/20 border-accent/30" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

          {/* Featured horizontal carousel */}
          <div className="max-w-5xl mx-auto px-4">
            <div className="mb-2 text-sm text-white/80">Vetrina</div>
            <div className="relative -mx-1 flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2">
              {featured.map((f) => (
                <div key={f.id} className="snap-start shrink-0 w-64 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <div className="relative h-36">
                    <SafeImage src={getListingImage(f)} alt={f.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                    {f.verified && (
                      <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-black/60 border border-white/10">🛡️ Verificato</span>
                    )}
                    <div className="absolute top-2 right-2">
                      <FavoriteButton listingId={f.id} size="sm" />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium line-clamp-1">{f.title}</div>
                    <div className="text-[12px] text-white/70 line-clamp-1">📍 {f.location || 'Civitanova'}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-[12px] text-white/90 font-semibold">{formatPrice(f)}</div>
                      {f.average_rating && (
                        <div className="text-[11px] text-white/70">★ {f.average_rating.toFixed(1)}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="max-w-5xl mx-auto px-4 py-16 text-center">
              <div className="text-4xl mb-2">⏳</div>
              <div className="text-lg font-semibold">Caricamento annunci...</div>
            </div>
          ) : listings.length === 0 ? (
            <div className="max-w-5xl mx-auto px-4 py-16">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <div className="text-4xl mb-2">🗂️</div>
                <div className="text-lg font-semibold">Nessun risultato trovato</div>
                <div className="text-white/70 text-sm mt-1">Prova a rimuovere qualche filtro o modifica la ricerca.</div>
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => { setCategory(null); setQuery(""); setOnlyAvailable(false); setOnlyVerified(false); setSort("recenti"); }}
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-sm"
                  >
                    Reset filtri
                  </button>
                  <button
                    onClick={() => setActiveTab(activeTab === "beni" ? "servizi" : "beni")}
                    className="px-4 py-2 rounded-xl bg-accent/30 border border-accent/30 hover:bg-accent/40 text-sm"
                  >
                    Vai a {activeTab === "beni" ? "Servizi" : "Beni"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto px-4 py-4">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {listings.map((l) => (
                    <Link key={l.id} href={`/marketplace/${l.id}`} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-colors">
                      <div className="relative h-28 sm:h-32 md:h-36">
                        <SafeImage src={getListingImage(l)} alt={l.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                        {l.verified && (
                          <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-black/60 border border-white/10">🛡️ Verificato</span>
                        )}
                        <div className="absolute top-2 right-2" onClick={(e) => e.preventDefault()}>
                          <FavoriteButton listingId={l.id} size="sm" />
                        </div>
                        <span className="absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded-full bg-black/60 border border-white/10">{formatPrice(l)}</span>
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-medium line-clamp-1">{l.title}</div>
                        <div className="text-[12px] text-white/70 line-clamp-1">📍 {l.location || 'Civitanova'}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className={`text-[11px] ${!l.is_available ? "text-red-400" : "text-green-400"}`}>
                            {!l.is_available ? "Non disponibile" : "Disponibile"}
                          </div>
                          {l.average_rating && (
                            <div className="text-[11px] text-white/70">★ {l.average_rating.toFixed(1)}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {listings.map((l) => (
                    <Link key={l.id} href={`/marketplace/${l.id}`} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden flex hover:bg-white/10 transition-colors">
                      <div className="relative w-32 sm:w-40 h-28 sm:h-32 flex-shrink-0">
                        <SafeImage src={getListingImage(l)} alt={l.title} className="w-full h-full object-cover" />
                        {l.verified && (
                          <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-black/60 border border-white/10">🛡️ Verificato</span>
                        )}
                        <div className="absolute top-2 right-2" onClick={(e) => e.preventDefault()}>
                          <FavoriteButton listingId={l.id} size="sm" />
                        </div>
                      </div>
                      <div className="p-3 flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium line-clamp-1">{l.title}</div>
                            <div className="text-[12px] text-white/70 line-clamp-1">📍 {l.location || 'Civitanova'}</div>
                          </div>
                          <div className="text-[12px] text-white/90 font-semibold whitespace-nowrap">{formatPrice(l)}</div>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-white/70">
                          <div className={`${!l.is_available ? "text-red-400" : "text-green-400"}`}>
                            {!l.is_available ? "Non disponibile" : "Disponibile"}
                          </div>
                          {l.average_rating && (
                            <div>★ {l.average_rating.toFixed(1)}</div>
                          )}
                          {l.verified && <div className="text-blue-300">🛡️ Verificato</div>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* CTA fixed bottom on mobile */}
      {activeView === 'marketplace' && (
        <div className="sticky bottom-0 z-20 bg-black/70 backdrop-blur-md border-t border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
            <div className="text-white/70 text-sm">Hai qualcosa da proporre?</div>
            <button 
              onClick={() => handleListingAction('add')}
              className="ml-auto px-4 py-2 rounded-xl bg-accent/30 hover:bg-accent/40 border border-accent/30 text-sm"
            >
              Pubblica annuncio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
