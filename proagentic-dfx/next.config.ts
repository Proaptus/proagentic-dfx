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

  // Proxy API requests to mock server (except auth which is handled locally)
  async rewrites() {
    const mockServerUrl = process.env.MOCK_SERVER_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/designs/:path*',
        destination: `${mockServerUrl}/api/designs/:path*`,
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
