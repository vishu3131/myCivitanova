/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose',
  },
  // Assicura che i CSS siano processati correttamente
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Risolve i problemi con i moduli WebSocket in ambiente browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }

    // Ignora i warning per i moduli opzionali
    config.ignoreWarnings = [
      { module: /node_modules\/ws\/lib\/buffer-util\.js/ },
      { module: /node_modules\/ws\/lib\/validation\.js/ },
      { module: /node_modules\/@supabase\/realtime-js/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
