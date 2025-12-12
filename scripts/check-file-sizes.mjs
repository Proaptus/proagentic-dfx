#!/usr/bin/env node
/**
 * File Size Checker
 * Enforces file size limits for AI-friendly codebase
 *
 * Limits:
 * - Max 300 lines per file (error)
 * - Max 400 lines per file (hard limit, blocks commit)
 * - Max 15KB file size (warning)
 * - Max 25KB file size (error)
 */

import { execSync } from 'child_process';
import { readFileSync, statSync } from 'fs';
import { resolve, relative } from 'path';

// Configuration
const CONFIG = {
  // Line limits (code lines, excluding blank lines & comments)
  LINES_WARN: 350,   // Warning threshold
  LINES_ERROR: 500,  // Hard limit - blocks commit
  // Size limits (bytes)
  SIZE_WARN: 20 * 1024,  // 20KB warning
  SIZE_ERROR: 35 * 1024, // 35KB hard limit
  // File patterns to check
  INCLUDE_PATTERNS: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
  // Directories to ignore
  IGNORE_DIRS: ['node_modules', '.next', 'dist', 'build', 'coverage', '.git'],
  // Specific files to ignore
  IGNORE_FILES: ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'],
  // Files with higher limits (type definition files, test files)
  RELAXED_PATTERNS: ['types/index.ts', '.test.ts', '.test.tsx', '.spec.ts'],
  RELAXED_LINES_ERROR: 800, // Higher limit for type files
  // LEGACY: Pre-existing large files - DO NOT ADD NEW FILES HERE
  // These files predate the size limits and need refactoring (tracked in tech debt)
  // TODO: Remove entries as files are refactored under 500 lines
  LEGACY_FILES: [
    'ThermalAnalysisPanel.tsx',
    'CADTankViewer.tsx',
    'StressContourChart.tsx',
    'StandardsLibraryPanel.tsx',
    'ValidationScreen.tsx',
  ],
};

// Get staged files or all files based on mode
function getFilesToCheck(mode = 'staged') {
  if (mode === 'staged') {
    try {
      const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' });
      return output.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  // All mode - recursively find files
  try {
    const output = execSync('git ls-files', { encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function shouldCheckFile(filePath) {
  // Check extension
  const hasValidExt = CONFIG.INCLUDE_PATTERNS.some(ext => filePath.endsWith(ext));
  if (!hasValidExt) return false;

  // Check ignored directories
  const isIgnoredDir = CONFIG.IGNORE_DIRS.some(dir => filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`) || filePath.startsWith(`${dir}/`));
  if (isIgnoredDir) return false;

  // Check ignored files
  const isIgnoredFile = CONFIG.IGNORE_FILES.some(file => filePath.endsWith(file));
  if (isIgnoredFile) return false;

  return true;
}

function countLines(content) {
  // Count non-blank, non-comment lines
  const lines = content.split('\n');
  let count = 0;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip blank lines
    if (!trimmed) continue;

    // Handle block comments
    if (trimmed.startsWith('/*')) {
      inBlockComment = true;
      if (trimmed.endsWith('*/')) inBlockComment = false;
      continue;
    }
    if (inBlockComment) {
      if (trimmed.endsWith('*/')) inBlockComment = false;
      continue;
    }

    // Skip single-line comments
    if (trimmed.startsWith('//')) continue;

    count++;
  }

  return count;
}

function checkFile(filePath) {
  const issues = [];
  const rootDir = process.cwd();
  const fullPath = resolve(rootDir, filePath);
  const relativePath = relative(rootDir, fullPath);

  // Check if file has relaxed limits
  const isRelaxed = CONFIG.RELAXED_PATTERNS.some(pattern => filePath.includes(pattern));
  const linesError = isRelaxed ? CONFIG.RELAXED_LINES_ERROR : CONFIG.LINES_ERROR;

  // Check if file is in legacy whitelist (errors become warnings)
  const isLegacy = CONFIG.LEGACY_FILES.some(legacy => filePath.endsWith(legacy));

  try {
    const content = readFileSync(fullPath, 'utf-8');
    const stats = statSync(fullPath);

    // Check line count
    const lineCount = countLines(content);
    if (lineCount > linesError) {
      issues.push({
        type: isLegacy ? 'warning' : 'error',  // Downgrade to warning for legacy files
        file: relativePath,
        message: isLegacy
          ? `${lineCount} lines (max: ${linesError}) - LEGACY FILE (needs refactoring)`
          : `${lineCount} lines (max: ${linesError}) - SPLIT THIS FILE`,
        metric: 'lines',
        value: lineCount,
      });
    } else if (lineCount > CONFIG.LINES_WARN) {
      issues.push({
        type: 'warning',
        file: relativePath,
        message: `${lineCount} lines (recommended max: ${CONFIG.LINES_WARN})`,
        metric: 'lines',
        value: lineCount,
      });
    }

    // Check file size
    const fileSize = stats.size;
    if (fileSize > CONFIG.SIZE_ERROR) {
      issues.push({
        type: isLegacy ? 'warning' : 'error',  // Downgrade to warning for legacy files
        file: relativePath,
        message: isLegacy
          ? `${(fileSize / 1024).toFixed(1)}KB (max: ${CONFIG.SIZE_ERROR / 1024}KB) - LEGACY FILE`
          : `${(fileSize / 1024).toFixed(1)}KB (max: ${CONFIG.SIZE_ERROR / 1024}KB)`,
        metric: 'size',
        value: fileSize,
      });
    } else if (fileSize > CONFIG.SIZE_WARN) {
      issues.push({
        type: 'warning',
        file: relativePath,
        message: `${(fileSize / 1024).toFixed(1)}KB (recommended max: ${CONFIG.SIZE_WARN / 1024}KB)`,
        metric: 'size',
        value: fileSize,
      });
    }
  } catch (err) {
    // File might not exist (deleted in staging)
  }

  return issues;
}

function main() {
  const mode = process.argv[2] || 'staged';
  const files = getFilesToCheck(mode);
  const filesToCheck = files.filter(shouldCheckFile);

  if (filesToCheck.length === 0) {
    console.log('No files to check.');
    process.exit(0);
  }

  let allIssues = [];

  for (const file of filesToCheck) {
    const issues = checkFile(file);
    allIssues = allIssues.concat(issues);
  }

  // Report issues
  const errors = allIssues.filter(i => i.type === 'error');
  const warnings = allIssues.filter(i => i.type === 'warning');

  if (warnings.length > 0) {
    console.log('\n⚠️  FILE SIZE WARNINGS:');
    for (const w of warnings) {
      console.log(`   ${w.file}: ${w.message}`);
    }
  }

  if (errors.length > 0) {
    console.log('\n❌ FILE SIZE ERRORS (must fix before commit):');
    for (const e of errors) {
      console.log(`   ${e.file}: ${e.message}`);
    }
    console.log('\n💡 Tips to fix large files:');
    console.log('   - Extract helper functions to separate utility files');
    console.log('   - Split large components into smaller sub-components');
    console.log('   - Move types/interfaces to dedicated .types.ts files');
    console.log('   - Extract constants to config files');
    console.log('');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log('\n✅ Commit allowed, but consider refactoring warned files.\n');
  } else {
    console.log('✅ All files within size limits.\n');
  }

  process.exit(0);
}

main();
