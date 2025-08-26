/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'source.unsplash.com', 
      'via.placeholder.com',
      'oaidalleapiprodscus.blob.core.windows.net', // OpenAI DALL-E images
      'api.creativepilot.pro', 
      'assets.creativepilot.pro'
    ],
    unoptimized: true, // For external image sources
  },
  // Environment variables are handled by Vercel directly
  // env: {
  //   OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  // },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Ensure TypeScript paths work in production
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;