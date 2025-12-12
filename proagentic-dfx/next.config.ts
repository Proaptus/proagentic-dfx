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

  // Proxy API requests to mock server (except auth and requirements/chat which are handled locally)
  async rewrites() {
    const mockServerUrl = process.env.MOCK_SERVER_URL || 'http://localhost:3001';
    return [
      // ISSUE-001: Add optimization API proxy for Pareto results
      {
        source: '/api/optimization/:path*',
        destination: `${mockServerUrl}/api/optimization/:path*`,
      },
      {
        source: '/api/designs/:path*',
        destination: `${mockServerUrl}/api/designs/:path*`,
      },
      // Additional API proxies for full mock server functionality
      {
        source: '/api/compare/:path*',
        destination: `${mockServerUrl}/api/compare/:path*`,
      },
      {
        source: '/api/export/:path*',
        destination: `${mockServerUrl}/api/export/:path*`,
      },
      {
        source: '/api/standards/:path*',
        destination: `${mockServerUrl}/api/standards/:path*`,
      },
      {
        source: '/api/materials/:path*',
        destination: `${mockServerUrl}/api/materials/:path*`,
      },
      {
        source: '/api/tank-type/:path*',
        destination: `${mockServerUrl}/api/tank-type/:path*`,
      },
      {
        source: '/api/testing/:path*',
        destination: `${mockServerUrl}/api/testing/:path*`,
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
