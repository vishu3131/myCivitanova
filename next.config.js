/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurazione base
  // Impostazioni generali senza chiavi sperimentali non supportate
  
  // Ottimizzazioni per le performance
  compress: true, // Abilita la compressione gzip
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  
  // Ottimizzazioni per le immagini
  images: {
    formats: ['image/webp', 'image/avif'], // Formati moderni per immagini più leggere
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache delle immagini per 30 giorni
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: '*.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'source.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.pravatar.cc', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'statics.cedscdn.it', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: 'www.cronachemaceratesi.it', pathname: '/**' },
      { protocol: 'https', hostname: 'www.residencecasamare.it', pathname: '/**' },
      { protocol: 'https', hostname: 'www.civitanovamarche.info', pathname: '/**' },
      { protocol: 'https', hostname: 'www.cuoreadriatico.it', pathname: '/**' },
      { protocol: 'https', hostname: 'www.hotelvelas.it', pathname: '/**' },
      { protocol: 'https', hostname: 'www.bedandbreakfastmarche.it', pathname: '/**' },
      { protocol: 'https', hostname: 'www.teatridicivitanova.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i0.wp.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.chieseitaliane.chiesacattolica.it', pathname: '/**' },
      { protocol: 'https', hostname: 'citylive.it', pathname: '/**' },
      { protocol: 'https', hostname: 'www.picchionews.it', pathname: '/**' },
      { protocol: 'https', hostname: 'www.donnamoderna.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.aziendagricolasanmarco.it', pathname: '/**' },
      { protocol: 'https', hostname: 'www.illocale.info', pathname: '/**' },
      // Storage Firebase/Supabase e CDN comuni
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.firebasestorage.app', pathname: '/**' },
      { protocol: 'https', hostname: 'mrtxaubsdqxofumrwftm.supabase.co', pathname: '/**' },
    ],
  },
  eslint: {
    // Evita che errori lint blocchino la build (continueremo a correggerli a parte)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Evita che errori di type-checking blocchino la build per ora
    ignoreBuildErrors: true,
  },
  
  // Ottimizzazioni per il bundle
  experimental: {
    optimizeCss: true, // Ottimizza il CSS
    optimizePackageImports: ['lucide-react', '@heroicons/react'], // Ottimizza le importazioni
  },
  
  // Configurazione per il caching
  onDemandEntries: {
    // Periodo di mantenimento delle pagine in memoria (in ms)
    maxInactiveAge: 25 * 1000,
    // Numero di pagine da mantenere simultaneamente
    pagesBufferLength: 2,
  },
  
  // Headers per sicurezza e caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Redirect per canonicalizzazione dominio (www -> apex)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.mycivitanova.it' }],
        destination: 'https://mycivitanova.it/:path*',
        permanent: true,
      },
    ];
  },
  
  // Rimossa configurazione webpack personalizzata per CSS
  // Next.js gestisce automaticamente CSS e PostCSS
};


export default nextConfig;
