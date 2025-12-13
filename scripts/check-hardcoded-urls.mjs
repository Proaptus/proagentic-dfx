#!/usr/bin/env node
/**
 * =============================================================================
 * HARDCODED URL CHECK - Pre-commit quality gate
 * =============================================================================
 * Detects hardcoded localhost URLs in production source code that would break
 * in deployed environments (Vercel, etc.).
 *
 * Patterns detected:
 *   - http://localhost:3000
 *   - http://localhost:3001
 *   - http://127.0.0.1:*
 *   - Fallbacks to localhost in API_BASE, BASE_URL, etc.
 *
 * Excludes:
 *   - Test files (__tests__, *.test.*, *.spec.*)
 *   - Comments (lines starting with // or *)
 *   - .env files (environment config is expected)
 *   - node_modules
 * =============================================================================
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Patterns that indicate hardcoded localhost URLs
const FORBIDDEN_PATTERNS = [
  // Direct localhost URLs
  /['"`]https?:\/\/localhost:\d+/,
  /['"`]https?:\/\/127\.0\.0\.1:\d+/,
  // Fallback to localhost (common bug pattern)
  /\|\|\s*['"`]https?:\/\/localhost/,
  /\?\?\s*['"`]https?:\/\/localhost/,
  // Direct fetch to localhost (not via API client)
  /fetch\s*\(\s*['"`]https?:\/\/localhost/,
];

// Files/directories to exclude
const EXCLUDE_PATTERNS = [
  /__tests__/,
  /\.test\./,
  /\.spec\./,
  /node_modules/,
  /\.env/,
  /\.md$/,
  /\.json$/, // Allow JSON files (config, mock data)
];

// Lines that are allowed (comments, documentation)
const ALLOWED_LINE_PATTERNS = [
  /^\s*\/\//, // Single-line comments
  /^\s*\*/, // Multi-line comment content
  /^\s*\/\*/, // Multi-line comment start
  /^\s*#/, // Shell comments
  /In development.*localhost/i, // Documentation about dev setup
  /NEXT_PUBLIC_API_URL.*localhost/i, // Documenting env var usage
];

function getFilesToCheck(mode) {
  if (mode === 'staged') {
    // Get staged files only
    try {
      const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
        encoding: 'utf-8',
      });
      return output
        .trim()
        .split('\n')
        .filter((f) => f);
    } catch {
      return [];
    }
  } else {
    // Check all source files in proagentic-dfx/src AND config files at root
    const srcDir = path.join(process.cwd(), 'proagentic-dfx', 'src');
    const files = getAllFiles(srcDir);

    // Also check critical config files at project root that affect production
    const configFiles = [
      'proagentic-dfx/next.config.ts',
      'proagentic-dfx/next.config.js',
      'proagentic-dfx/next.config.mjs',
    ];

    for (const configFile of configFiles) {
      const fullPath = path.join(process.cwd(), configFile);
      if (fs.existsSync(fullPath)) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath));
}

function isAllowedLine(line) {
  return ALLOWED_LINE_PATTERNS.some((pattern) => pattern.test(line));
}

function checkFile(filePath) {
  const violations = [];

  // Only check TypeScript/JavaScript files
  if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) {
    return violations;
  }

  // Skip excluded files
  if (shouldExcludeFile(filePath)) {
    return violations;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Skip allowed lines (comments, documentation)
      if (isAllowedLine(line)) {
        return;
      }

      // Check each forbidden pattern
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({
            file: filePath,
            line: index + 1,
            content: line.trim().substring(0, 100),
            pattern: pattern.toString(),
          });
          break; // One violation per line is enough
        }
      }
    });
  } catch (err) {
    // File might not exist or be unreadable
    console.error(`Warning: Could not read ${filePath}: ${err.message}`);
  }

  return violations;
}

function main() {
  const mode = process.argv[2] || 'all'; // 'staged' or 'all'
  const files = getFilesToCheck(mode);

  console.log(`Checking ${files.length} files for hardcoded URLs...`);

  let allViolations = [];

  for (const file of files) {
    const violations = checkFile(file);
    allViolations = allViolations.concat(violations);
  }

  if (allViolations.length > 0) {
    console.error('\n');
    console.error('='.repeat(60));
    console.error('  HARDCODED URL VIOLATIONS DETECTED');
    console.error('='.repeat(60));
    console.error('\n');
    console.error(
      'The following files contain hardcoded localhost URLs that will'
    );
    console.error('break in production:\n');

    for (const v of allViolations) {
      console.error(`  ${v.file}:${v.line}`);
      console.error(`    ${v.content}`);
      console.error('');
    }

    console.error('='.repeat(60));
    console.error('  HOW TO FIX:');
    console.error('='.repeat(60));
    console.error('');
    console.error('  Use relative paths instead of hardcoded localhost URLs:');
    console.error('');
    console.error("    BAD:  const API = 'http://localhost:3001'");
    console.error("    GOOD: const API = process.env.NEXT_PUBLIC_API_URL || '/api'");
    console.error('');
    console.error('  See proagentic-dfx/src/lib/api/client.ts for reference.');
    console.error('');
    console.error(`Total violations: ${allViolations.length}`);
    process.exit(1);
  }

  console.log('  No hardcoded URLs found');
  process.exit(0);
}

main();
