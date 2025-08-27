require('dotenv').config({ path: '../.env' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para build standalone (necessário para Docker)
  output: 'standalone',
  
  // Configurações de imagem otimizadas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  
  // Desabilitar ESLint durante build (para produção)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Desabilitar TypeScript check durante build (para produção)
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
