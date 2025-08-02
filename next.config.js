/** @type {import('next').NextConfig} */
const nextConfig = {
  // Assicura che i CSS siano processati correttamente
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
