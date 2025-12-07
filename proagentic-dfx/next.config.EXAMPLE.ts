/**
 * Next.js Configuration for OpenCascade.js WASM Integration
 *
 * IMPORTANT: Replace your current next.config.ts with this configuration
 * to enable WebAssembly loading for the OpenCascade.js CAD kernel.
 *
 * This configuration:
 * 1. Prevents Node.js modules from being bundled in browser code
 * 2. Enables WebAssembly async loading
 * 3. Configures Webpack 5 for WASM files
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // ===== Server-Side: Don't bundle Node.js-specific modules =====
    // OpenCascade.js might reference these, but they don't exist in browser
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,              // File system (Node.js only)
        perf_hooks: false,      // Performance hooks (Node.js only)
        os: false,              // Operating system utilities (Node.js only)
        worker_threads: false,  // Worker threads (Node.js only)
        crypto: false,          // Crypto module (use Web Crypto instead)
        stream: false,          // Stream module (Node.js only)
      };
    }

    // ===== WebAssembly Support =====
    // Enable async WebAssembly loading (required for opencascade.js)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,  // Allow dynamic WASM imports
      layers: true,            // Enable webpack layers (recommended)
    };

    // ===== Optional: WASM File Handling =====
    // If you need to manually configure WASM file loading:
    // config.module.rules.push({
    //   test: /\.wasm$/,
    //   type: 'webassembly/async',
    // });

    return config;
  },

  // ===== Optional: Output Configuration =====
  // Uncomment if you need to serve WASM files from a custom path
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/your-cdn-path' : '',

  // ===== Optional: Build Configuration =====
  // Increase memory limit if WASM compilation causes issues
  // env: {
  //   NODE_OPTIONS: '--max-old-space-size=4096',
  // },
};

export default nextConfig;

/**
 * USAGE INSTRUCTIONS:
 *
 * 1. Backup your current next.config.ts:
 *    > copy next.config.ts next.config.BACKUP.ts
 *
 * 2. Replace next.config.ts with this configuration:
 *    > copy next.config.EXAMPLE.ts next.config.ts
 *
 * 3. Install OpenCascade.js:
 *    > npm install opencascade.js
 *
 * 4. Restart Next.js development server:
 *    > npm run dev
 *
 * 5. Test WASM loading by visiting your CAD test page
 *
 * TROUBLESHOOTING:
 *
 * - If you see "Cannot resolve 'fs'" errors:
 *   → Check that fallback config is applied (should be!)
 *
 * - If WASM fails to load:
 *   → Check browser console for WASM errors
 *   → Verify asyncWebAssembly is enabled
 *   → Try clearing Next.js cache: rm -rf .next
 *
 * - If build is slow:
 *   → WASM compilation is resource-intensive
 *   → Consider increasing Node memory limit
 *   → First build will be slowest (subsequent builds are cached)
 *
 * - If bundle size is too large:
 *   → Consider creating a custom OpenCascade build
 *   → Use dynamic imports to code-split CAD components
 *   → Host WASM files on CDN (update assetPrefix)
 */
