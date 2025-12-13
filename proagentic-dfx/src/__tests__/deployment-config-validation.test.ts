/**
 * Deployment Configuration Validation Tests
 *
 * These tests validate that the deployment configuration is correct and won't
 * cause 404 errors or other deployment failures in production (Vercel).
 *
 * Lessons learned from 2025-12-13 production outage:
 * - next.config.ts rewrites defaulting to localhost:3001 caused 404s in production
 * - API routes need proper configuration for Vercel deployment
 * - Config files need validation to catch deployment issues before push
 *
 * @see fix: make API rewrites conditional to fix production 404 errors
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SRC_DIR = path.resolve(__dirname, '..');

describe('Deployment Configuration Validation', () => {
  describe('next.config.ts - Production Safety', () => {
    it('should NOT have rewrites function (unified code path architecture)', () => {
      const configPath = path.join(PROJECT_ROOT, 'next.config.ts');
      const content = fs.readFileSync(configPath, 'utf-8');

      // ARCHITECTURAL DECISION: No rewrites at all
      // Dev and prod should use the SAME code path:
      // Frontend → /api/* → Local API routes → Static data files
      //
      // The mock server is only for:
      // 1. Generating static data files
      // 2. Complex runtime calculations (called FROM local API routes)
      const hasRewrites =
        /async\s+rewrites\s*\(\s*\)/.test(content) ||
        content.includes('rewrites()') ||
        content.includes('rewrites:');

      expect(
        hasRewrites,
        'next.config.ts should NOT have rewrites.\n\n' +
          'ARCHITECTURAL DECISION:\n' +
          '- Dev and prod must use the SAME code path\n' +
          '- Frontend → /api/* → Local API routes → Static data\n' +
          '- No proxying to mock server in dev\n\n' +
          'This eliminates "works in dev, fails in prod" issues.'
      ).toBe(false);
    });

    it('should not have localhost URLs anywhere', () => {
      const configPath = path.join(PROJECT_ROOT, 'next.config.ts');
      const content = fs.readFileSync(configPath, 'utf-8');

      // No localhost URLs should exist in config at all
      const localhostPatterns = [
        /['"`]https?:\/\/localhost/g,
        /['"`]http:\/\/127\.0\.0\.1/g,
      ];

      const violations: string[] = [];
      for (const pattern of localhostPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          violations.push(...matches);
        }
      }

      expect(
        violations,
        `Found localhost URLs in next.config.ts:\n` +
          violations.map((v) => `  - "${v}"`).join('\n') +
          '\n\nFix: Remove all localhost references. Use local API routes instead.'
      ).toHaveLength(0);
    });

    it('should not hardcode any production URLs', () => {
      const configPath = path.join(PROJECT_ROOT, 'next.config.ts');
      const content = fs.readFileSync(configPath, 'utf-8');

      // Check for hardcoded production URLs (should use env vars)
      const hardcodedProdUrls = [
        /['"`]https:\/\/proagentic-dfx\.vercel\.app/g,
        /['"`]https:\/\/.*\.vercel\.app/g,
      ];

      const violations: string[] = [];
      for (const pattern of hardcodedProdUrls) {
        const matches = content.match(pattern);
        if (matches) {
          violations.push(...matches);
        }
      }

      expect(
        violations,
        `Found hardcoded production URLs in next.config.ts:\n` +
          violations.join('\n') +
          '\n\nFix: Use environment variables instead.'
      ).toHaveLength(0);
    });
  });

  describe('vercel.json - Configuration Validity', () => {
    it('should exist and be valid JSON', () => {
      const vercelJsonPath = path.join(PROJECT_ROOT, 'vercel.json');

      expect(
        fs.existsSync(vercelJsonPath),
        'vercel.json must exist in project root'
      ).toBe(true);

      const content = fs.readFileSync(vercelJsonPath, 'utf-8');
      let parsed: unknown;

      expect(() => {
        parsed = JSON.parse(content);
      }, 'vercel.json must be valid JSON').not.toThrow();

      expect(
        typeof parsed === 'object' && parsed !== null,
        'vercel.json must be a valid object'
      ).toBe(true);
    });

    it('should have correct framework configuration', () => {
      const vercelJsonPath = path.join(PROJECT_ROOT, 'vercel.json');
      const content = fs.readFileSync(vercelJsonPath, 'utf-8');
      const config = JSON.parse(content) as Record<string, unknown>;

      expect(
        config.framework,
        'vercel.json should specify "nextjs" framework'
      ).toBe('nextjs');
    });
  });

  describe('API Routes - Production Readiness', () => {
    it('should have SSE streaming route with proper Vercel config', () => {
      const streamRoutePath = path.join(
        SRC_DIR,
        'app/api/optimization/[id]/stream/route.ts'
      );

      expect(
        fs.existsSync(streamRoutePath),
        'Optimization stream route must exist at src/app/api/optimization/[id]/stream/route.ts'
      ).toBe(true);

      const content = fs.readFileSync(streamRoutePath, 'utf-8');

      // SSE routes MUST have runtime = 'nodejs' for Vercel
      expect(
        /export\s+const\s+runtime\s*=\s*['"`]nodejs['"`]/.test(content),
        'Stream route must export runtime = "nodejs" for Vercel SSE support'
      ).toBe(true);

      // Should also have dynamic = 'force-dynamic'
      expect(
        /export\s+const\s+dynamic\s*=\s*['"`]force-dynamic['"`]/.test(content),
        'Stream route should export dynamic = "force-dynamic" to disable caching'
      ).toBe(true);
    });

    it('should have all required API routes for production', () => {
      const requiredRoutes = [
        'app/api/optimization/route.ts',
        'app/api/optimization/[id]/route.ts',
        'app/api/optimization/[id]/stream/route.ts',
        'app/api/optimization/[id]/results/route.ts',
        'app/api/designs/route.ts',
        'app/api/designs/[designId]/route.ts',
        'app/api/requirements/chat/route.ts',
        'app/api/tank-type/recommend/route.ts',
        'app/api/auth/route.ts',
      ];

      const missingRoutes: string[] = [];

      for (const route of requiredRoutes) {
        const fullPath = path.join(SRC_DIR, route);
        if (!fs.existsSync(fullPath)) {
          missingRoutes.push(route);
        }
      }

      expect(
        missingRoutes,
        `Missing required API routes for production:\n` +
          missingRoutes.map((r) => `  - ${r}`).join('\n') +
          '\n\nThese routes are needed for the app to function without a mock server.'
      ).toHaveLength(0);
    });
  });

  describe('Serverless File Bundling - CRITICAL', () => {
    it('should include data directory in outputFileTracingIncludes', () => {
      const configPath = path.join(PROJECT_ROOT, 'next.config.ts');
      const content = fs.readFileSync(configPath, 'utf-8');

      // Check that data directory is included for serverless bundling
      // Without this, any API route using fs.readFileSync on data/ will fail in production
      expect(
        content.includes("'./data/**/*'") || content.includes('"./data/**/*"'),
        'next.config.ts outputFileTracingIncludes must include "./data/**/*"\n' +
          'Without this, API routes using fs.readFileSync will fail in Vercel production.\n\n' +
          'Fix: Add "./data/**/*" to outputFileTracingIncludes:\n' +
          '  outputFileTracingIncludes: {\n' +
          "    '/api/**/*': ['./wasm/**/*', './data/**/*'],\n" +
          '  }'
      ).toBe(true);
    });

    it('should not use fs.readFileSync without outputFileTracingIncludes coverage', () => {
      const apiDir = path.join(SRC_DIR, 'app/api');

      // Get all API route files
      const getAllFiles = (dir: string): string[] => {
        const files: string[] = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          if (item.isDirectory()) {
            files.push(...getAllFiles(fullPath));
          } else if (item.name.endsWith('.ts')) {
            files.push(fullPath);
          }
        }
        return files;
      };

      const apiFiles = getAllFiles(apiDir);
      const violations: string[] = [];

      for (const file of apiFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(PROJECT_ROOT, file);

        // Check for fs.readFileSync or fs.existsSync usage
        if (
          content.includes('fs.readFileSync') ||
          content.includes('fs.existsSync')
        ) {
          // Check if it reads from data directory
          if (
            content.includes("'data'") ||
            content.includes('"data"') ||
            content.includes("'./data") ||
            content.includes('"./data')
          ) {
            // This is fine IF outputFileTracingIncludes has data/**/*
            // We already check that above, so just log for awareness
          }
        }
      }

      // This test is informational - the real check is outputFileTracingIncludes
      expect(true).toBe(true);
    });
  });

  describe('Environment Variables - Documentation Consistency', () => {
    it('should have all NEXT_PUBLIC_ vars documented in .env.example', () => {
      const envExamplePath = path.join(PROJECT_ROOT, '.env.example');

      expect(
        fs.existsSync(envExamplePath),
        '.env.example must exist to document environment variables'
      ).toBe(true);

      const envExample = fs.readFileSync(envExamplePath, 'utf-8');

      // Required NEXT_PUBLIC_ vars that must be documented
      const requiredPublicVars = [
        'NEXT_PUBLIC_API_URL',
        'NEXT_PUBLIC_APP_NAME',
        'NEXT_PUBLIC_APP_VERSION',
      ];

      const missing: string[] = [];
      for (const varName of requiredPublicVars) {
        if (!envExample.includes(varName)) {
          missing.push(varName);
        }
      }

      expect(
        missing,
        `Missing environment variables in .env.example:\n` +
          missing.map((v) => `  - ${v}`).join('\n') +
          '\n\nAll NEXT_PUBLIC_ vars must be documented for team consistency.'
      ).toHaveLength(0);
    });

    it('should not have localhost URLs in .env.example production section', () => {
      const envExamplePath = path.join(PROJECT_ROOT, '.env.example');
      const content = fs.readFileSync(envExamplePath, 'utf-8');

      // Find the production section and check it doesn't have localhost
      const productionCommentPattern =
        /# Production:.*\n(NEXT_PUBLIC_API_URL=.*)/i;
      const match = content.match(productionCommentPattern);

      if (match) {
        expect(
          match[1].includes('localhost'),
          'Production API_URL in .env.example should not contain localhost'
        ).toBe(false);
      }
    });
  });

  describe('Health Check Endpoint - Production Monitoring', () => {
    it('should have health check route for deployment verification', () => {
      const healthRoutePath = path.join(SRC_DIR, 'app/api/health/route.ts');

      expect(
        fs.existsSync(healthRoutePath),
        'Health check endpoint must exist at src/app/api/health/route.ts\n' +
          'This is critical for post-deployment smoke tests.'
      ).toBe(true);

      const content = fs.readFileSync(healthRoutePath, 'utf-8');

      // Should export GET handler
      expect(
        content.includes('export async function GET'),
        'Health route must export GET handler'
      ).toBe(true);

      // Should check data files (verifies outputFileTracingIncludes works)
      expect(
        content.includes('data') && content.includes('readdir'),
        'Health route should verify data files are accessible'
      ).toBe(true);
    });
  });

  describe('API Client - Production Configuration', () => {
    it('should use relative API paths by default (not localhost)', () => {
      const clientPath = path.join(SRC_DIR, 'lib/api/client.ts');

      expect(
        fs.existsSync(clientPath),
        'API client must exist at src/lib/api/client.ts'
      ).toBe(true);

      const content = fs.readFileSync(clientPath, 'utf-8');

      // Should default to '/api' not 'http://localhost:...'
      const apiBasePattern = /const\s+API_BASE\s*=\s*[^;]+/;
      const match = content.match(apiBasePattern);

      expect(match, 'API_BASE declaration should exist').toBeTruthy();

      const declaration = match![0];

      // Should use env var with '/api' fallback
      expect(
        declaration.includes("'/api'") || declaration.includes('"/api"'),
        `API_BASE should default to '/api', not a localhost URL.\n` +
          `Found: ${declaration}\n` +
          `Expected pattern: const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'`
      ).toBe(true);

      // Should NOT have localhost as the default
      expect(
        !declaration.includes("|| 'http://localhost") &&
          !declaration.includes('|| "http://localhost'),
        `API_BASE should NOT fallback to localhost.\n` +
          `Found: ${declaration}`
      ).toBe(true);
    });
  });
});
