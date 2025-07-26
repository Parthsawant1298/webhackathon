// next.config.mjs - ES Module syntax for .mjs files
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // Add other image domains if needed
      {
        protocol: 'https', 
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', 
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Updated configuration for newer Next.js versions
  serverExternalPackages: ['mongoose'],
  // Turbopack configuration (optional - only if you need webpack customization)
  turbo: {
    rules: {
      '*.js': {
        loaders: ['babel-loader'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;