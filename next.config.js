/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static exports
  images: {
    unoptimized: true, // Required for static export
    domains: ['picsum.photos'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  basePath: process.env.NODE_ENV === 'production' ? '/conspiracy' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/conspiracy/' : '',
  trailingSlash: true,
};

module.exports = nextConfig; 