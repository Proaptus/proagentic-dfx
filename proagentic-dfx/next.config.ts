import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include WASM files in serverless function bundles
  outputFileTracingIncludes: {
    '/api/**/*': ['./wasm/**/*'],
  },

  // Turbopack configuration (Next.js 16+ default bundler)
  turbopack: {
    // Enable WASM support in Turbopack
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.wasm'],
  },

  // Proxy API requests to mock server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },

  // Headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

export default nextConfig;
