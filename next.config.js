/** @type {import('next').NextConfig} */
const nextConfig = {
  // Assicura che i CSS siano processati correttamente
  swcMinify: true,
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
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
