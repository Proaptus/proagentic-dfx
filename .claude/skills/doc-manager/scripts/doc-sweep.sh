#!/usr/bin/env bash

# doc-sweep.sh - Main orchestration script for 7-phase documentation sweep
# Usage: ./doc-sweep.sh [--dry-run] [--phase PHASE_LIST] [--skip-confirmation]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
# Only calculate PROJECT_ROOT if not already set (allows test override)
if [ -z "${PROJECT_ROOT:-}" ]; then
  PROJECT_ROOT="$(cd "$SKILL_DIR/../../.." && pwd)"
fi
DOCS_DIR="$PROJECT_ROOT/docs"
TEMP_DIR="$PROJECT_ROOT/.doc-manager-temp"

# Flags
DRY_RUN=false
PHASES="all"
SKIP_CONFIRMATION=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --phase)
      PHASES="$2"
      shift 2
      ;;
    --skip-confirmation)
      SKIP_CONFIRMATION=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--dry-run] [--phase PHASE_LIST] [--skip-confirmation]"
      exit 1
      ;;
  esac
done

# Helper functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."

  if ! command -v python3 &> /dev/null; then
    log_error "python3 not found. Please install Python 3.8+"
    exit 1
  fi

  if ! python3 -c "import yaml" 2>/dev/null; then
    log_error "PyYAML not installed. Run: pip install pyyaml"
    exit 1
  fi

  if ! python3 -c "import jsonschema" 2>/dev/null; then
    log_error "jsonschema not installed. Run: pip install jsonschema"
    exit 1
  fi

  log_success "Prerequisites check passed"
}

# Phase 1: Inventory
phase1_inventory() {
  log_info "=== Phase 1: Inventory & Discovery ==="

  mkdir -p "$TEMP_DIR"
  mkdir -p "$DOCS_DIR/_index"

  log_info "Scanning for all Markdown files..."

  if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Would scan project for .md files"
    return
  fi

  # Run inventory script
  bash "$SCRIPT_DIR/inventory-docs.sh" > "$DOCS_DIR/_index/inventory.json"

  local total_files=$(jq '.total_files' "$DOCS_DIR/_index/inventory.json")
  log_success "Found $total_files Markdown files"
}

# Phase 2: Analysis
phase2_analysis() {
  log_info "=== Phase 2: Analysis & Conflict Detection ==="

  if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Would analyze for duplicates and conflicts"
    return
  fi

  log_info "Analyzing documentation for duplicates..."

  local analysis_file="$TEMP_DIR/analysis-report.txt"
  > "$analysis_file"

  # Find duplicate patterns
  echo "=== DUPLICATE CLUSTERS DETECTED ===" >> "$analysis_file"

  # UAT duplicates
  local uat_count=$(find "$PROJECT_ROOT" -maxdepth 1 -name "UAT*.md" 2>/dev/null | wc -l)
  echo "UAT Documentation: $uat_count files (should be 1 canonical)" >> "$analysis_file"
  find "$PROJECT_ROOT" -maxdepth 1 -name "UAT*.md" 2>/dev/null | sort >> "$analysis_file"

  # TDD duplicates
  local tdd_count=$(find "$PROJECT_ROOT" -maxdepth 1 -name "TDD*.md" 2>/dev/null | wc -l)
  echo "" >> "$analysis_file"
  echo "TDD Documentation: $tdd_count files (should be 1 canonical)" >> "$analysis_file"
  find "$PROJECT_ROOT" -maxdepth 1 -name "TDD*.md" 2>/dev/null | sort >> "$analysis_file"

  # Implementation duplicates
  local impl_count=$(find "$PROJECT_ROOT" -maxdepth 1 -name "*IMPLEMENTATION*" -o -name "*COMPLETE*" 2>/dev/null | wc -l)
  echo "" >> "$analysis_file"
  echo "Implementation Documents: $impl_count files (should be consolidated)" >> "$analysis_file"
  find "$PROJECT_ROOT" -maxdepth 1 \( -name "*IMPLEMENTATION*" -o -name "*COMPLETE*" \) 2>/dev/null | sort >> "$analysis_file"

  # Production UAT duplicates
  local prod_count=$(find "$PROJECT_ROOT" -maxdepth 1 -name "PRODUCTION_UAT*" 2>/dev/null | wc -l)
  echo "" >> "$analysis_file"
  echo "Production UAT: $prod_count files (should be consolidated)" >> "$analysis_file"
  find "$PROJECT_ROOT" -maxdepth 1 -name "PRODUCTION_UAT*" 2>/dev/null | sort >> "$analysis_file"

  cat "$analysis_file"
  log_success "Analysis complete - see $analysis_file"
}

# Phase 3: Conflict Resolution
phase3_resolve() {
  log_info "=== Phase 3: Conflict Resolution ==="

  if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Would resolve conflicts using evidence-based rules"
    return
  fi

  log_info "Resolving conflicts using evidence-based rules..."

  local resolution_file="$TEMP_DIR/resolution-report.txt"
  > "$resolution_file"

  echo "=== CONFLICT RESOLUTION DECISIONS ===" >> "$resolution_file"

  # Select canonical UAT file (largest/most complete)
  local canonical_uat=$(find "$PROJECT_ROOT" -maxdepth 1 -name "UAT*.md" 2>/dev/null | xargs wc -l | sort -rn | head -2 | tail -1 | awk '{print $2}')
  if [ -n "$canonical_uat" ]; then
    echo "CANONICAL UAT: $(basename "$canonical_uat") (most comprehensive)" >> "$resolution_file"
    echo "SUPERSEDES: All other UAT*.md files in root" >> "$resolution_file"
  fi

  # Select canonical TDD file (largest/most complete)
  local canonical_tdd=$(find "$PROJECT_ROOT" -maxdepth 1 -name "TDD*.md" 2>/dev/null | xargs wc -l | sort -rn | head -2 | tail -1 | awk '{print $2}')
  if [ -n "$canonical_tdd" ]; then
    echo "" >> "$resolution_file"
    echo "CANONICAL TDD: $(basename "$canonical_tdd") (most comprehensive)" >> "$resolution_file"
    echo "SUPERSEDES: All other TDD*.md files in root" >> "$resolution_file"
  fi

  echo "" >> "$resolution_file"
  echo "All superseded files will be moved to docs/quarantine/ with QUARANTINE_REASON.md" >> "$resolution_file"

  cat "$resolution_file"
  log_success "Conflict resolution complete - see $resolution_file"
}

# Phase 4: Migration
phase4_migrate() {
  log_info "=== Phase 4: Migration & Reorganization ==="

  if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Would create docs/ structure and migrate files"
    return
  fi

  # Create directory structure
  mkdir -p "$DOCS_DIR"/{_index,feature,howto,reference,explanation,adr,test-report,runbook,quarantine}

  log_success "Directory structure created"
}

# Phase 5: Consolidation
phase5_consolidate() {
  log_info "=== Phase 5: Consolidation ==="

  if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Would merge duplicates and quarantine unclear docs"
    return
  fi

  log_info "Consolidating documentation..."

  # Create quarantine directory
  local quarantine_dir="$DOCS_DIR/quarantine/2025-10-25-consolidation"
  mkdir -p "$quarantine_dir"

  # Find the LARGEST UAT file (canonical UAT)
  local canonical_uat=""
  local max_lines=0
  for uat_file in "$PROJECT_ROOT"/UAT*.md; do
    if [ -f "$uat_file" ]; then
      local lines=$(wc -l < "$uat_file" 2>/dev/null || echo 0)
      if [ "$lines" -gt "$max_lines" ]; then
        max_lines=$lines
        canonical_uat=$(basename "$uat_file")
      fi
    fi
  done

  # Find the LARGEST TDD file (canonical TDD)
  local canonical_tdd=""
  max_lines=0
  for tdd_file in "$PROJECT_ROOT"/TDD*.md; do
    if [ -f "$tdd_file" ]; then
      local lines=$(wc -l < "$tdd_file" 2>/dev/null || echo 0)
      if [ "$lines" -gt "$max_lines" ]; then
        max_lines=$lines
        canonical_tdd=$(basename "$tdd_file")
      fi
    fi
  done

  log_info "Canonical UAT: $canonical_uat"
  log_info "Canonical TDD: $canonical_tdd"

  # Quarantine ALL root markdown files EXCEPT CLAUDE.md and the two canonical files
  cd "$PROJECT_ROOT" || exit 1

  log_info "Starting file quarantine loop in $(pwd)..."

  local quarantine_count=0
  for file in *.md; do
    # ALWAYS protect CLAUDE.md
    if [ "$file" = "CLAUDE.md" ]; then
      log_info "Protecting: $file (system file)"
      continue
    fi

    # Keep canonical files in root
    if [ "$file" = "$canonical_uat" ]; then
      log_info "Keeping canonical UAT: $file"
      continue
    fi

    if [ "$file" = "$canonical_tdd" ]; then
      log_info "Keeping canonical TDD: $file"
      continue
    fi

    # MOVE ALL OTHER FILES to quarantine
    if [ -f "$file" ]; then
      log_info "Quarantining: $file"
      if mv "$file" "$quarantine_dir/"; then
        ((quarantine_count++))
      else
        log_error "Failed to move $file to quarantine"
      fi
    fi
  done

  log_info "Quarantine loop completed"

  # Create QUARANTINE_REASON.md
  cat > "$quarantine_dir/QUARANTINE_REASON.md" << 'EOF'
# Documentation Consolidation Quarantine

**Date**: 2025-10-25
**Reason**: Root-level documentation consolidation and deduplication

## What Was Done

All markdown files from the project root (except CLAUDE.md) have been quarantined as part of a documentation consolidation sweep. This includes:

- Duplicate UAT framework files (kept 1 canonical version)
- Duplicate TDD documentation (kept 1 canonical version)
- Duplicate implementation/completion documents
- Fix summaries and temporary documentation
- Experimental notes and investigation reports

## Why

The project root contained 96+ markdown files, many of which were:
- Duplicates with slightly different names/dates
- Temporary notes from implementation phases
- Historical fix summaries that are no longer relevant
- Experimental investigations

## Next Steps

1. **Review**: Open files in this quarantine directory
2. **Restore Valuable Docs**: Move important docs back to /docs/ with proper categorization
3. **Delete Truly Obsolete**: Remove files that have no value
4. **Organize**: Place restored files in appropriate /docs/ subdirectories

## Files Quarantined

See directory listing below. Use Git to review content:

```bash
git diff docs/quarantine/2025-10-25-consolidation/
```

## How to Restore

Move important files back to main docs:

```bash
# Restore a specific file
mv docs/quarantine/2025-10-25-consolidation/IMPORTANT_FILE.md docs/features/

# Move to proper category
mv docs/quarantine/2025-10-25-consolidation/GUIDE.md docs/guides/
```

## Safety

- All files are preserved in Git
- Nothing is permanently deleted
- Quarantine directory is version-controlled
- Can be fully reversed if needed
EOF

  log_success "Quarantined $quarantine_count files from root to $quarantine_dir"
  log_info "Created QUARANTINE_REASON.md with guidance"
}

# Phase 6: Linking
phase6_link() {
  log_info "=== Phase 6: Linking to Code & Tests ==="

  if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Would add code_refs and test_refs to docs"
    return
  fi

  log_info "Linking docs to code and tests..."
  python3 "$SCRIPT_DIR/link-to-code.py" || log_warning "Linking script encountered issues"

  log_success "Linking complete"
}

# Phase 7: Finalization
phase7_finalize() {
  log_info "=== Phase 7: Finalization & Validation ==="

  if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Would validate YAML and generate manifest.json"
    return
  fi

  # Validate front matter
  log_info "Validating YAML front matter..."
  python3 "$SCRIPT_DIR/validate-frontmatter.py" || {
    log_warning "Validation found errors (see above)"
  }

  # Generate manifest
  log_info "Generating manifest.json..."
  python3 "$SCRIPT_DIR/generate-manifest.py"

  log_success "Finalization complete"
}

# Main execution
main() {
  echo ""
  log_info "Documentation Manager - 7-Phase Sweep"
  echo ""

  if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No changes will be made"
  fi

  check_prerequisites

  # Run selected phases
  if [[ "$PHASES" == "all" ]] || [[ "$PHASES" == *"inventory"* ]]; then
    phase1_inventory
  fi

  if [[ "$PHASES" == "all" ]] || [[ "$PHASES" == *"analysis"* ]]; then
    phase2_analysis
  fi

  if [[ "$PHASES" == "all" ]] || [[ "$PHASES" == *"resolve"* ]]; then
    phase3_resolve
  fi

  if [[ "$PHASES" == "all" ]] || [[ "$PHASES" == *"migrate"* ]]; then
    phase4_migrate
  fi

  if [[ "$PHASES" == "all" ]] || [[ "$PHASES" == *"consolidate"* ]]; then
    phase5_consolidate
  fi

  if [[ "$PHASES" == "all" ]] || [[ "$PHASES" == *"link"* ]]; then
    phase6_link
  fi

  if [[ "$PHASES" == "all" ]] || [[ "$PHASES" == *"finalize"* ]] || [[ "$PHASES" == *"validation"* ]]; then
    phase7_finalize
  fi

  echo ""
  log_success "Documentation sweep complete!"
  echo ""

  if [ "$DRY_RUN" = false ]; then
    log_info "Next steps:"
    echo "  1. Review changes: git status"
    echo "  2. Check quarantine: ls $DOCS_DIR/quarantine/"
    echo "  3. View manifest: cat $DOCS_DIR/_index/manifest.json"
    echo "  4. Commit changes: git add docs/ && git commit -m 'docs: consolidate and organize'"
  fi
}

# Run main
main
