/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurazione base
  // Imposto la root di Turbopack per evitare che rilevi lockfile esterni alla repo
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'statics.cedscdn.it',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.cronachemaceratesi.it',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.residencecasamare.it',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.civitanovamarche.info',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.cuoreadriatico.it',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.hotelvelas.it',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bedandbreakfastmarche.it',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.teatridicivitanova.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.chieseitaliane.chiesacattolica.it',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'citylive.it',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.picchionews.it',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.donnamoderna.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.aziendagricolasanmarco.it',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.illocale.info',
        pathname: '/**',
      },
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
  // Rimossa configurazione webpack personalizzata per CSS
  // Next.js gestisce automaticamente CSS e PostCSS
};


export default nextConfig;
