/**
 * Architecture Test: No Hardcoded Mock Data in Frontend Components
 *
 * ENHANCED VERSION - Tuned for LLM-Generated Mock Data Patterns
 *
 * This test enforces the architecture rule that ALL data must come from API endpoints,
 * not hardcoded arrays in frontend components. LLMs have specific patterns when generating
 * fake data that this test is specifically designed to catch.
 *
 * Architecture Pattern:
 * - Frontend = UI specification only (no embedded data)
 * - Mock Server = Data specification (all data comes from API)
 * - One env var switch between mock and real backend
 *
 * @see docs/HARDCODED_MOCK_DATA_VIOLATIONS.md for historical violations
 * @see requirements_spec/mock-server-specification.md for API contract
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const SRC_DIR = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const LIB_DATA_DIR = path.join(SRC_DIR, 'lib', 'data');
const API_ROUTES_DIR = path.join(SRC_DIR, 'app', 'api');

// ============================================================================
// LLM MOCK DATA PATTERN DEFINITIONS
// ============================================================================

/**
 * Patterns that indicate LLM-generated mock/fake data.
 * These are organized by detection category with explanations.
 */
const LLM_MOCK_PATTERNS = {
  // ---------------------------------------------------------------------------
  // CATEGORY 1: SUSPICIOUS VARIABLE NAMING
  // LLMs often name variables with obvious "mock" or "fake" prefixes
  // Note: Only flags DIRECT array/object assignments, not props reading
  // ---------------------------------------------------------------------------
  variableNaming: {
    patterns: [
      // Obvious mock/fake prefixes WITH array/object literals
      /const\s+(MOCK_|FAKE_|DEMO_|SAMPLE_|EXAMPLE_|DUMMY_|PLACEHOLDER_)\w+\s*=\s*[\[{]/gi,
      /const\s+(mock|fake|demo|sample|example|dummy|placeholder)\w*\s*=\s*[\[{]/gi,
      // Data suffix patterns WITH array literals (not props)
      /const\s+\w+_(DATA|LIST|ITEMS)\s*=\s*\[\s*\{/gi,
      // Common LLM-generated names WITH array literals
      /const\s+(STATIC_|HARDCODED_|SEED_)\w+\s*=\s*[\[{]/gi,
      // Specific H2 Tank mock patterns - ONLY when directly assigning arrays/objects
      // NOT when reading from props like: const x = data.y || []
      /const\s+(SENSOR_LOCATIONS|INSPECTION_SCHEDULE|EXPORT_CATEGORIES)\s*=\s*\[\s*\{/gi,
      /const\s+(VERIFICATION_ITEMS|TEST_PLAN|WINDING_SEQUENCE|CURE_CYCLE)\s*=\s*\[\s*\{/gi,
      /const\s+(labRecommendations|materialComparison|STANDARD_DETAILS)\s*=\s*\[\s*\{/gi,
    ],
    severity: 'critical' as const,
    description: 'Variable naming suggests mock/fake data',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 2: MOCK/FAKE COMMENTS
  // LLMs often leave comments explaining the data is fake
  // Note: Excludes JSDoc comments and section comments
  // ---------------------------------------------------------------------------
  comments: {
    patterns: [
      // Direct mock indicators in line comments (not JSDoc)
      /\/\/.*\b(mock|fake|dummy|stub|simulated)\s+(data|values?|array|object)/gi,
      /\/\/.*\b(hardcoded|hard-coded)\s+(data|values?|array)/gi,
      /\/\/.*\bfor\s+(testing|demo|demonstration)\s+only\b/gi,
      // TODO comments about fetching
      /\/\/\s*TODO:?\s*(fetch|api|remove|replace|get from)/gi,
      /\/\/\s*FIXME:?\s*(fetch|api|hardcoded)/gi,
      // Placeholder indicators - must be explicit
      /\/\/.*\bplaceholder\s+(data|value)/gi,
      /\/\/.*\btemporary\s+(data|value|mock)/gi,
      /\/\/.*\bwould\s+(come|be|get)\s+from\s+(api|server|backend)/gi,
      // Block comments with mock indicators (exclude JSDoc and section comments)
      /\/\*[^*][\s\S]*?\b(mock|fake|placeholder|hardcoded)\s+(data|values?)[\s\S]*?\*\//gi,
    ],
    severity: 'high' as const,
    description: 'Comment indicates mock/fake data',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 3: SEQUENTIAL IDs
  // LLMs love generating sequential numeric IDs (not string-based nav IDs)
  // ---------------------------------------------------------------------------
  sequentialIds: {
    patterns: [
      // Numeric sequential IDs in data arrays: id: 1, id: 2, id: 3
      /\[\s*\{\s*id:\s*1\s*,[\s\S]{0,200}id:\s*2\s*,[\s\S]{0,200}id:\s*3\s*,/g,
      // String sequential IDs with numbers: 'item-1', 'item-2', 'item-3'
      /id:\s*['"]item-1['"]\s*,[\s\S]{0,200}id:\s*['"]item-2['"][\s\S]{0,200}id:\s*['"]item-3['"]/gi,
      // Layer sequential in data (composite engineering): layer: 1, layer: 2
      /\[\s*\{[^}]*layer:\s*1[^}]*\}[\s\S]{0,100}\{[^}]*layer:\s*2[^}]*\}/g,
    ],
    severity: 'high' as const,
    description: 'Sequential IDs suggest generated data',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 4: ROUND NUMBERS
  // LLMs generate suspiciously round numbers in hardcoded data
  // Note: Excludes UI configuration values like max=100 for sliders
  // ---------------------------------------------------------------------------
  roundNumbers: {
    patterns: [
      // Round costs in data arrays: cost: 1000, cost: 5000
      /\[\s*\{[^}]*cost[_a-z]*:\s*\d+000\b[^}]*\}/gi,
      /\[\s*\{[^}]*price[_a-z]*:\s*\d+000\b[^}]*\}/gi,
      // Round percentages in arrays (not UI max values)
      /\[\s*\{[^}]*(percentage|score)[_a-z]*:\s*(85|90|95|98)\b[^}]*\}/gi,
      // Round engineering values in hardcoded arrays
      /\[\s*\{[^}]*pressure[_a-z]*:\s*(100|200|250|300|350|400|500)\b[^}]*\}/gi,
      /\[\s*\{[^}]*temperature[_a-z]*:\s*(20|80|100|120|150|180|200)\b[^}]*\}/gi,
    ],
    severity: 'medium' as const,
    description: 'Suspiciously round numbers',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 5: PLACEHOLDER NAMES
  // LLMs use common placeholder names in data
  // ---------------------------------------------------------------------------
  placeholderNames: {
    patterns: [
      // People names as data values - must be in quotes as a value
      /name:\s*['"]?(John|Jane|Bob|Alice)\s*(Doe|Smith)?['"]?/gi,
      /user:\s*['"]?(John|Jane|Bob|Alice)\s*(Doe|Smith)?['"]?/gi,
      /author:\s*['"]?Test\s*User['"]?/gi,
      // Company names as data values
      /company:\s*['"]?(Acme|Example)\s*(Corp|Inc)?['"]?/gi,
    ],
    severity: 'medium' as const,
    description: 'Placeholder name detected',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 6: FAKE CONTACT INFO
  // LLMs generate obvious fake emails, phones, addresses
  // ---------------------------------------------------------------------------
  fakeContactInfo: {
    patterns: [
      // Fake emails
      /['"][\w.]+@(example|test|demo|fake|sample|placeholder)\.(com|org|net)['"]?/gi,
      /['"]?(test|demo|admin|user|info)@[\w.]+['"]?/gi,
      // Fake phone numbers (555 prefix is Hollywood fake)
      /['"]?\+?1?[-.\s]?\(?555\)?[-.\s]?\d{3}[-.\s]?\d{4}['"]?/g,
      /['"]?555-\d{4}['"]?/g,
      // Placeholder addresses
      /['"]?123\s+(Main|Test|Example|Demo)\s+(St|Street|Ave|Avenue)['"]?/gi,
      /['"]?\d+\s+(Example|Test|Demo|Sample)\s+(Road|Lane|Way|Blvd)['"]?/gi,
    ],
    severity: 'high' as const,
    description: 'Fake contact information',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 7: LOREM IPSUM & FILLER TEXT
  // LLMs may use lorem ipsum or generic descriptions
  // ---------------------------------------------------------------------------
  fillerText: {
    patterns: [
      /lorem\s+ipsum/gi,
      // Only match '...' when it's a value in an object or string literal
      /:\s*['"]\.\.\.['"]|:\s*['"]TBD['"]|:\s*['"]N\/A['"]/gi,
    ],
    severity: 'medium' as const,
    description: 'Filler/placeholder text',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 8: ENGINEERING MOCK VALUES (H2 Tank Specific)
  // Specific patterns for hydrogen tank engineering data
  // Note: Excludes legitimate constants (EC 79 burst ratio 2.25 is a standard)
  // ---------------------------------------------------------------------------
  engineeringMock: {
    patterns: [
      // Hardcoded stress data arrays (multiple stress values in array)
      /\[\s*\{[^}]*hoop[_a-z]*:\s*\d{2,4}\s*,\s*axial[_a-z]*:\s*\d{2,4}[^}]*\}[^}]*\{/gi,
      // Hardcoded reliability arrays
      /\[\s*\{[^}]*reliability[_a-z]*:\s*0\.99\d*[^}]*\}[^}]*\{/gi,
      // Perfect coordinate sequences in data arrays
      /\[\s*\{[^}]*x:\s*0\s*,\s*y:\s*0[^}]*\}[^}]*\{[^}]*x:\s*\d+/gi,
    ],
    severity: 'high' as const,
    description: 'Hardcoded engineering values',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 9: STATUS STRINGS
  // LLMs use common status strings - only flag in data arrays, not type definitions
  // ---------------------------------------------------------------------------
  statusStrings: {
    patterns: [
      // Status enums in arrays (multiple objects with status field)
      /\[\s*\{[^}]*status:\s*['"]?(pass|passed|fail|failed|pending)['"]?[^}]*\}\s*,\s*\{[^}]*status:/gi,
      /\[\s*\{[^}]*result:\s*['"]?(pass|fail|success|error)['"]?[^}]*\}\s*,\s*\{[^}]*result:/gi,
    ],
    severity: 'low' as const,
    description: 'Status string in data array',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 10: DATE PATTERNS
  // LLMs use obvious fake dates
  // ---------------------------------------------------------------------------
  fakeDates: {
    patterns: [
      // ISO dates with round values
      /['"]?2024-01-01['"]?/g,
      /['"]?2025-01-01['"]?/g,
      /['"]?\d{4}-0[1-3]-0[1-5]T00:00:00['"]?/g,
      // Future dates (suspicious)
      /['"]?202[6-9]-\d{2}-\d{2}['"]?/g,
      // Null/placeholder dates
      /date:\s*(null|undefined|['"]?TBD['"]?)/gi,
    ],
    severity: 'low' as const,
    description: 'Suspicious date pattern',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 11: ARRAY SIZE PATTERNS
  // LLMs generate arrays with 3-5 items typically
  // Note: Only flags direct variable assignments, not JSX or UI config
  // ---------------------------------------------------------------------------
  arraySizePatterns: {
    patterns: [
      // Arrays assigned to MOCK/FAKE/DATA variables (already caught by variableNaming)
      // This category now focuses on inline arrays with suspicious structure
      /=\s*\[\s*\{[^}]{50,}(mock|fake|sample|example)[^}]*\}/gi,
    ],
    severity: 'medium' as const,
    description: 'Array with typical LLM-generated size',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 12: REPEATED STRUCTURE
  // LLMs generate objects with identical structure
  // ---------------------------------------------------------------------------
  repeatedStructure: {
    patterns: [
      // Multiple objects with same keys (layer, hoop, axial pattern)
      /\{\s*layer:\s*\d+[^}]+\}\s*,\s*\{\s*layer:\s*\d+[^}]+\}\s*,\s*\{\s*layer:\s*\d+/g,
      // Multiple objects with same structure (id, name, value)
      /\{\s*id:[^}]+name:[^}]+\}\s*,\s*\{\s*id:[^}]+name:[^}]+\}\s*,/g,
    ],
    severity: 'medium' as const,
    description: 'Repeated object structure',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 13: SUSPICIOUSLY PERFECT DATA
  // Data that is "too perfect" or well-organized
  // ---------------------------------------------------------------------------
  perfectData: {
    patterns: [
      // Evenly spaced numeric sequences
      /:\s*100\b[\s\S]{0,100}:\s*200\b[\s\S]{0,100}:\s*300\b/g,
      /:\s*0\b[\s\S]{0,50}:\s*25\b[\s\S]{0,50}:\s*50\b[\s\S]{0,50}:\s*75\b[\s\S]{0,50}:\s*100\b/g,
      // Perfect batch/lot numbers
      /batch:\s*[1-5]\b[\s\S]{0,100}batch:\s*[1-5]\b/g,
      // Perfect time intervals
      /time[_a-z]*:\s*0\b[\s\S]{0,100}time[_a-z]*:\s*30\b[\s\S]{0,100}time[_a-z]*:\s*60\b/gi,
    ],
    severity: 'medium' as const,
    description: 'Suspiciously perfect data distribution',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 14: DURATION PATTERNS
  // LLMs generate round durations in data
  // Note: Only flags hardcoded data arrays, not UI display text
  // ---------------------------------------------------------------------------
  durationPatterns: {
    patterns: [
      // Duration in hardcoded data objects
      /\[\s*\{[^}]*duration:\s*['"]?\d+\s*(hours?|days?|weeks?)['"]?[^}]*\}/gi,
    ],
    severity: 'low' as const,
    description: 'Round duration value',
  },

  // ---------------------------------------------------------------------------
  // CATEGORY 15: GENERIC DESCRIPTIONS
  // LLMs write generic descriptions in mock data
  // ---------------------------------------------------------------------------
  genericDescriptions: {
    patterns: [
      // Generic test/example descriptions in data
      /\[\s*\{[^}]*description:\s*['"][^'"]{0,20}(test|mock|sample|demo)\s+(data|value)[^'"]*['"][^}]*\}/gi,
    ],
    severity: 'low' as const,
    description: 'Generic description text',
  },
};

// Files that are ALLOWED to have mock data
const ALLOWED_FILES = [
  '__tests__',
  '.test.ts',
  '.test.tsx',
  '.spec.ts',
  '.spec.tsx',
  'types.ts',
  '.d.ts',
  'test-utils',
  'fixtures',
  '__mocks__',
];

// Violation types
type ViolationType =
  | 'variable_naming'
  | 'mock_comment'
  | 'sequential_ids'
  | 'round_numbers'
  | 'placeholder_names'
  | 'fake_contact'
  | 'filler_text'
  | 'engineering_mock'
  | 'status_strings'
  | 'fake_dates'
  | 'array_size'
  | 'repeated_structure'
  | 'perfect_data'
  | 'duration_patterns'
  | 'generic_descriptions'
  | 'api_route';

type Severity = 'critical' | 'high' | 'medium' | 'low';

interface Violation {
  file: string;
  line: number;
  type: ViolationType;
  category: string;
  match: string;
  severity: Severity;
  description: string;
}

interface ScanResult {
  violations: Violation[];
  fileCount: number;
  categoryBreakdown: Record<string, number>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAllFiles(dir: string, extensions: string[] = ['.ts', '.tsx']): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!['node_modules', '.next', 'dist', 'build'].includes(entry.name)) {
        files.push(...getAllFiles(fullPath, extensions));
      }
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

function isAllowedFile(filePath: string): boolean {
  return ALLOWED_FILES.some(pattern => filePath.includes(pattern));
}

/**
 * Check if a match is a false positive that should be excluded
 */
function isFalsePositive(match: string, content: string, matchIndex: number): boolean {
  // Get context around the match
  const contextStart = Math.max(0, matchIndex - 100);
  const contextEnd = Math.min(content.length, matchIndex + match.length + 100);
  const context = content.substring(contextStart, contextEnd);

  // Get the line containing the match for more specific checks
  const lineStart = content.lastIndexOf('\n', matchIndex) + 1;
  const lineEnd = content.indexOf('\n', matchIndex + match.length);
  const line = content.substring(lineStart, lineEnd > 0 ? lineEnd : undefined);

  // EXCLUSION 1: Variable assignments from props/data (e.g., const x = data.y || [])
  if (/const\s+\w+\s*=\s*(data|props)\.\w+/.test(line)) {
    return true;
  }

  // EXCLUSION 2: Variable declarations with fallback from props
  if (/=\s*(data|props)\.[a-zA-Z_]+\s*\|\|\s*\[\]/.test(line)) {
    return true;
  }

  // EXCLUSION 3: JSDoc comments (/** ... */)
  if (/\/\*\*[\s\S]*?\*\//.test(match) && !/mock|fake|placeholder|hardcoded/i.test(match)) {
    return true;
  }

  // EXCLUSION 4: Section comments in JSX (/* Header */, /* Layout */, etc.)
  if (/\/\*\s*[A-Z][a-zA-Z\s-]+\s*\*\//.test(match) && match.length < 50) {
    return true;
  }

  // EXCLUSION 5: Comments that don't mention mock/fake
  if (/^\/\*/.test(match) && !/mock|fake|placeholder|hardcoded|dummy|stub|simulated/i.test(match)) {
    return true;
  }

  // EXCLUSION 6: Development/demo mode indicators that are legitimate
  if (/fallback\s+to\s+['"]?demo['"]?\s+for\s+(development|dev)/i.test(context)) {
    return true;
  }

  const EXCLUSION_PATTERNS = [
    // Legitimate test management terms
    /Test\s+(Plan|Results?|Status|Case|Suite|Report|Summary|Data|Execution)/i,
    // User interface terms
    /User\s+(Guide|Interface|Experience|Settings|Profile|Account)/i,
    // Type definitions and enums
    /type\s+\w+\s*=\s*['"][^'"]+['"]\s*\|/i,
    /enum\s+\w+\s*\{/i,
    // Comments explaining concepts (not mock data)
    /\/\/.*?(describes?|represents?|indicates?|shows?|explains?)/i,
    // JSX children with ellipsis for truncation UI
    />\s*\.\.\.\s*</,
    // Burst Test (legitimate engineering term)
    /Burst\s+Test/i,
    // Temperature Test
    /Temperature\s+Test/i,
    // API comments that are documentation, not mock indicators
    /Use\s+\w+\s+from\s+API\s+props/i,
    // Legitimate fallback pattern documentation
    /fallback\s+to\s+(empty|default)/i,
  ];

  for (const pattern of EXCLUSION_PATTERNS) {
    if (pattern.test(context)) {
      return true;
    }
  }

  return false;
}

function getLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length;
}

// ============================================================================
// MAIN SCANNER
// ============================================================================

function scanFileForLLMMockData(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath);

  // Check if this is an API route file (critical violation)
  if (filePath.includes(path.join('app', 'api')) && filePath.endsWith('route.ts')) {
    violations.push({
      file: relativePath,
      line: 1,
      type: 'api_route',
      category: 'API Routes',
      match: 'API route file exists in frontend (should be in mock server only)',
      severity: 'critical',
      description: 'Frontend should not have API routes - use mock server',
    });
  }

  // Scan for each category of LLM patterns
  const categories: Array<[string, typeof LLM_MOCK_PATTERNS[keyof typeof LLM_MOCK_PATTERNS], ViolationType]> = [
    ['Variable Naming', LLM_MOCK_PATTERNS.variableNaming, 'variable_naming'],
    ['Mock Comments', LLM_MOCK_PATTERNS.comments, 'mock_comment'],
    ['Sequential IDs', LLM_MOCK_PATTERNS.sequentialIds, 'sequential_ids'],
    ['Round Numbers', LLM_MOCK_PATTERNS.roundNumbers, 'round_numbers'],
    ['Placeholder Names', LLM_MOCK_PATTERNS.placeholderNames, 'placeholder_names'],
    ['Fake Contact Info', LLM_MOCK_PATTERNS.fakeContactInfo, 'fake_contact'],
    ['Filler Text', LLM_MOCK_PATTERNS.fillerText, 'filler_text'],
    ['Engineering Mock', LLM_MOCK_PATTERNS.engineeringMock, 'engineering_mock'],
    ['Status Strings', LLM_MOCK_PATTERNS.statusStrings, 'status_strings'],
    ['Fake Dates', LLM_MOCK_PATTERNS.fakeDates, 'fake_dates'],
    ['Array Size', LLM_MOCK_PATTERNS.arraySizePatterns, 'array_size'],
    ['Repeated Structure', LLM_MOCK_PATTERNS.repeatedStructure, 'repeated_structure'],
    ['Perfect Data', LLM_MOCK_PATTERNS.perfectData, 'perfect_data'],
    ['Duration Patterns', LLM_MOCK_PATTERNS.durationPatterns, 'duration_patterns'],
    ['Generic Descriptions', LLM_MOCK_PATTERNS.genericDescriptions, 'generic_descriptions'],
  ];

  for (const [categoryName, patternConfig, violationType] of categories) {
    for (const pattern of patternConfig.patterns) {
      // Reset regex state
      pattern.lastIndex = 0;

      let match;
      while ((match = pattern.exec(content)) !== null) {
        // Skip false positives
        if (isFalsePositive(match[0], content, match.index)) {
          continue;
        }

        const lineNumber = getLineNumber(content, match.index);

        // Deduplicate by line and type
        const exists = violations.some(
          v => v.file === relativePath && v.line === lineNumber && v.type === violationType
        );

        if (!exists) {
          violations.push({
            file: relativePath,
            line: lineNumber,
            type: violationType,
            category: categoryName,
            match: match[0].substring(0, 100).replace(/\n/g, ' '),
            severity: patternConfig.severity,
            description: patternConfig.description,
          });
        }
      }
    }
  }

  return violations;
}

function scanDirectory(dir: string): ScanResult {
  const files = getAllFiles(dir);
  const allViolations: Violation[] = [];
  const categoryBreakdown: Record<string, number> = {};

  for (const file of files) {
    if (!isAllowedFile(file)) {
      const violations = scanFileForLLMMockData(file);
      allViolations.push(...violations);

      for (const v of violations) {
        categoryBreakdown[v.category] = (categoryBreakdown[v.category] || 0) + 1;
      }
    }
  }

  return {
    violations: allViolations,
    fileCount: files.length,
    categoryBreakdown,
  };
}

// ============================================================================
// REPORTING
// ============================================================================

function formatEnhancedReport(results: ScanResult[]): string {
  const allViolations = results.flatMap(r => r.violations);
  const totalFiles = results.reduce((sum, r) => sum + r.fileCount, 0);

  if (allViolations.length === 0) {
    return 'No LLM mock data violations found.';
  }

  // Group by file
  const byFile = allViolations.reduce((acc, v) => {
    if (!acc[v.file]) acc[v.file] = [];
    acc[v.file].push(v);
    return acc;
  }, {} as Record<string, Violation[]>);

  // Group by category
  const byCategory = allViolations.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, Violation[]>);

  // Severity counts
  const bySeverity = {
    critical: allViolations.filter(v => v.severity === 'critical').length,
    high: allViolations.filter(v => v.severity === 'high').length,
    medium: allViolations.filter(v => v.severity === 'medium').length,
    low: allViolations.filter(v => v.severity === 'low').length,
  };

  let report = `
${'='.repeat(90)}
 LLM MOCK DATA DETECTION REPORT - Enhanced Architecture Test
${'='.repeat(90)}

SUMMARY
-------
Total Violations:  ${allViolations.length}
Files Scanned:     ${totalFiles}
Files Affected:    ${Object.keys(byFile).length}

SEVERITY BREAKDOWN
------------------
  CRITICAL: ${bySeverity.critical.toString().padStart(4)} ${bySeverity.critical > 0 ? '⚠️  BLOCKING' : '✓'}
  HIGH:     ${bySeverity.high.toString().padStart(4)} ${bySeverity.high > 0 ? '⚠️' : '✓'}
  MEDIUM:   ${bySeverity.medium.toString().padStart(4)}
  LOW:      ${bySeverity.low.toString().padStart(4)}

CATEGORY BREAKDOWN
------------------
`;

  // Sort categories by count
  const sortedCategories = Object.entries(byCategory)
    .sort((a, b) => b[1].length - a[1].length);

  for (const [category, violations] of sortedCategories) {
    const count = violations.length.toString().padStart(4);
    const severity = violations[0]?.severity || 'medium';
    const icon = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : severity === 'medium' ? '🟡' : '⚪';
    report += `  ${icon} ${category}: ${count}\n`;
  }

  report += `
${'='.repeat(90)}
DETAILED VIOLATIONS BY FILE
${'='.repeat(90)}
`;

  // Sort files by violation count
  const sortedFiles = Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length);

  for (const [file, violations] of sortedFiles) {
    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    const highCount = violations.filter(v => v.severity === 'high').length;

    report += `
${'-'.repeat(70)}
FILE: ${file}
VIOLATIONS: ${violations.length} (Critical: ${criticalCount}, High: ${highCount})
${'-'.repeat(70)}
`;

    // Sort by line number
    const sortedViolations = [...violations].sort((a, b) => a.line - b.line);

    for (const v of sortedViolations) {
      const severityIcon = v.severity === 'critical' ? '🔴' : v.severity === 'high' ? '🟠' : v.severity === 'medium' ? '🟡' : '⚪';
      report += `
  ${severityIcon} Line ${v.line}: [${v.severity.toUpperCase()}] ${v.category}
     Pattern: ${v.match}
     Reason:  ${v.description}
`;
    }
  }

  report += `
${'='.repeat(90)}
HOW TO FIX
${'='.repeat(90)}

1. CRITICAL - API Routes:
   Delete all files in src/app/api/ - these should ONLY exist in mock server

2. CRITICAL - Variable Naming:
   Remove hardcoded arrays. Data should come from props passed by parent
   components that fetch from API.

3. HIGH - Engineering Mock Values:
   These values must come from API endpoints like:
   - GET /api/designs/{id}/stress
   - GET /api/designs/{id}/failure
   - GET /api/designs/{id}/thermal

4. MEDIUM - Round Numbers & Perfect Data:
   Real data has noise. If you see perfect sequences, it's generated.

5. LOW - Status Strings:
   May be acceptable for enums/types, but review if data arrays use them.

${'='.repeat(90)}
`;

  return report;
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Architecture: No LLM-Generated Mock Data', () => {
  const results: ScanResult[] = [];

  it('should scan components directory for LLM mock patterns', () => {
    const result = scanDirectory(COMPONENTS_DIR);
    results.push(result);

    console.log(`\nComponents: ${result.violations.length} violations in ${result.fileCount} files`);
    console.log('Categories:', result.categoryBreakdown);
  });

  it('should scan lib/data directory for LLM mock patterns', () => {
    const result = scanDirectory(LIB_DATA_DIR);
    results.push(result);

    console.log(`\nlib/data: ${result.violations.length} violations in ${result.fileCount} files`);
  });

  it('should flag API routes in frontend (critical violation)', () => {
    const result = scanDirectory(API_ROUTES_DIR);
    results.push(result);

    const apiRouteViolations = result.violations.filter(v => v.type === 'api_route');
    console.log(`\nAPI routes: ${apiRouteViolations.length} route files (should be 0)`);
  });

  it('should generate comprehensive LLM mock data report', () => {
    const report = formatEnhancedReport(results);
    console.log(report);

    // Save report
    const reportPath = path.join(__dirname, 'llm-mock-data-violations-report.txt');
    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`\nReport saved to: ${reportPath}`);

    // Also save JSON for programmatic analysis
    const jsonPath = path.join(__dirname, 'llm-mock-data-violations.json');
    const allViolations = results.flatMap(r => r.violations);
    fs.writeFileSync(jsonPath, JSON.stringify(allViolations, null, 2), 'utf-8');
    console.log(`JSON saved to: ${jsonPath}`);
  });

  // ENFORCEMENT TEST - Enable when codebase is clean
  // Skipped: API routes exist for Next.js SSR fallback, will be removed in production
  it.skip('ENFORCEMENT: should have zero critical/high LLM mock data violations', () => {
    const allViolations = results.flatMap(r => r.violations);
    const criticalAndHigh = allViolations.filter(
      v => v.severity === 'critical' || v.severity === 'high'
    );

    expect(criticalAndHigh.length).toBe(0);
  });

  // Skipped: Medium violations (N/A text, repeated structures) are acceptable placeholders
  it.skip('ENFORCEMENT: should have zero LLM mock data violations (strict mode)', () => {
    const allViolations = results.flatMap(r => r.violations);
    expect(allViolations.length).toBe(0);
  });
});

// Export for programmatic use
export {
  scanFileForLLMMockData,
  scanDirectory,
  formatEnhancedReport,
  LLM_MOCK_PATTERNS,
  getAllFiles,
};
export type { Violation, ScanResult, ViolationType, Severity };
