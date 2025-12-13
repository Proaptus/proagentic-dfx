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
    it('should not have localhost fallbacks in rewrites', () => {
      const configPath = path.join(PROJECT_ROOT, 'next.config.ts');
      const content = fs.readFileSync(configPath, 'utf-8');

      // Check for dangerous fallback patterns that would break production
      const dangerousPatterns = [
        // Fallback to localhost with || operator
        /\|\|\s*['"`]https?:\/\/localhost/g,
        // Fallback to localhost with ?? operator
        /\?\?\s*['"`]https?:\/\/localhost/g,
        // Direct localhost assignment without env check
        /const\s+\w+Url\s*=\s*['"`]https?:\/\/localhost/g,
      ];

      const violations: string[] = [];
      for (const pattern of dangerousPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          violations.push(...matches);
        }
      }

      expect(
        violations,
        `Found ${violations.length} localhost fallback pattern(s) in next.config.ts that would break production:\n` +
          violations.map((v) => `  - "${v}"`).join('\n') +
          '\n\nFix: Use conditional rewrites that return [] when MOCK_SERVER_URL is not set.\n' +
          'See: proagentic-dfx/next.config.ts async rewrites() for correct pattern.'
      ).toHaveLength(0);
    });

    it('should return empty rewrites array when MOCK_SERVER_URL is not set', () => {
      const configPath = path.join(PROJECT_ROOT, 'next.config.ts');
      const content = fs.readFileSync(configPath, 'utf-8');

      // The correct pattern: check for env var and return [] if not set
      const correctPattern =
        /if\s*\(\s*!mockServerUrl\s*\)\s*\{[\s\S]*?return\s*\[\s*\]/;

      expect(
        correctPattern.test(content),
        'next.config.ts should check if MOCK_SERVER_URL is set and return [] if not.\n' +
          'This prevents the rewrites from proxying to localhost in production.\n\n' +
          'Expected pattern:\n' +
          '  if (!mockServerUrl) {\n' +
          '    return [];\n' +
          '  }'
      ).toBe(true);
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
