import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include WASM and data files in serverless function bundles
  // CRITICAL: Without './data/**/*', all API routes using fs.readFileSync fail in production
  outputFileTracingIncludes: {
    '/api/**/*': ['./wasm/**/*', './data/**/*'],
  },

  // Turbopack configuration (Next.js 16+ default bundler)
  turbopack: {
    // Enable WASM support in Turbopack
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.wasm'],
  },

  // ARCHITECTURAL DECISION: No rewrites - use local API routes for both dev and prod
  // This ensures dev and prod use the SAME code path, eliminating "works in dev, fails in prod" issues.
  //
  // The mock server (h2-tank-mock-server) is now only used for:
  // 1. Generating/updating static data files (data/static/*.json)
  // 2. Complex runtime calculations (called FROM local API routes as a backend service)
  //
  // Previously, rewrites bypassed local API routes in dev, creating two different code paths.
  // Now: Frontend → /api/* → Local API routes → Static data (same in dev AND prod)

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
