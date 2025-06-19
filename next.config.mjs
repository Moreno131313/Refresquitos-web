/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para resolver problemas de chunks
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para desarrollo
    if (dev) {
      config.cache = false
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      }
    }
    
    return config
  },
  
  // Configuración experimental para mejorar estabilidad
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ['@/components', '@/lib'],
  },
  
  // Configuración de compilación para evitar errores de chunks
  swcMinify: true,
  
  // Headers para evitar problemas de caché
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Configuración de salida
  output: 'standalone',
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig 