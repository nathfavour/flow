import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const config: NextConfig = {
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ['pino', 'thread-stream', '@walletconnect/logger'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        pino: false,
        'thread-stream': false,
      };
    }
    return config;
  },
  reactCompiler: true,
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'date-fns',
      'lucide-react',
      '@tanstack/react-query',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
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

const nextConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(config);

export default nextConfig;
