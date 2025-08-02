/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose',
  },
  // Assicura che i CSS siano processati correttamente
  swcMinify: true,
};

module.exports = nextConfig;
