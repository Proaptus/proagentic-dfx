---
doc_type: runbook
title: "Phase 4 Migration Plan - Diátaxis Reorganization"
version: 1.0.0
date: 2025-12-09
owner: "@doc-manager"
---

# Phase 4 Migration Plan - Diátaxis Reorganization

## Directory Structure (Target)

```
docs/
├── _index/          # Manifests, inventories, migration plans
├── feature/         # Feature cards, capabilities
├── howto/           # Step-by-step guides
├── reference/       # API, config references
├── explanation/     # Concepts, architecture explanations
├── adr/             # Architectural Decision Records
├── test-report/     # Test execution results, implementation summaries
├── runbook/         # Operational procedures
└── quarantine/      # Unclear/outdated docs (never deleted)
```

## Document Classification Matrix

### Root Level Documents (C:\Users\chine\Projects\proagentic-dfx\)

| Document | Classification | Target Directory | Reason |
|----------|---------------|------------------|---------|
| ARIA_CHANGES_DETAILED.md | test_report | docs/test-report/ | Implementation verification details |
| CLAUDE.md | reference | KEEP IN ROOT | Project configuration (special) |
| HANDOVER.md | runbook | docs/runbook/ | Operational handover procedure |
| IMPLEMENTATION-SUMMARY-REQ251-255.md | test_report | docs/test-report/ | Implementation summary |
| IMPLEMENTATION_REQ-197-202.md | test_report | docs/test-report/ | Implementation summary |
| MOCK_SERVER_ACTION_ITEMS.md | runbook | docs/runbook/ | Action items for mock server |
| MOCK_SERVER_GAP_ANALYSIS_REPORT.md | test_report | docs/test-report/ | Gap analysis report |
| MOCK_SERVER_SUMMARY.md | explanation | docs/explanation/ | Mock server overview |
| README.md | reference | KEEP IN ROOT | Project README (special) |
| README_PROAGENTIC_DFX.md | explanation | docs/explanation/ | Platform explanation |
| REQUIREMENTS_ALIGNMENT_GAP_ANALYSIS.md | test_report | docs/test-report/ | Gap analysis |
| SCF_IMPLEMENTATION_VERIFICATION.md | test_report | docs/test-report/ | Implementation verification |
| WCAG_ARIA_IMPROVEMENTS_SUMMARY.md | test_report | docs/test-report/ | WCAG improvements summary |

### Docs Directory (C:\Users\chine\Projects\proagentic-dfx\docs\)

| Document | Classification | Target Directory | Action |
|----------|---------------|------------------|---------|
| DEPLOYMENT.md | runbook | docs/runbook/ | MOVE |
| DETAILED_GAP_ANALYSIS.md | test_report | docs/test-report/ | MOVE |
| ENTERPRISE_ACTION_PLAN.md | runbook | docs/runbook/ | MOVE |
| ENTERPRISE_GAP_ANALYSIS.md | test_report | docs/test-report/ | MOVE |
| HARDCODED_MOCK_DATA_VIOLATIONS.md | test_report | docs/test-report/ | MOVE |
| MOCK_SERVER_ARCHITECTURE_REVIEW.md | explanation | docs/explanation/ | MOVE |
| MULTI-DOMAIN-ARCHITECTURE.md | explanation | docs/explanation/ | MOVE |
| RTM_REVIEW_REPORT.md | test_report | docs/test-report/ | MOVE |

### Docs Subdirectories (Already Organized)

| Current Path | Classification | Action |
|-------------|---------------|---------|
| docs/guides/ACTIVATION_GUIDE.md | howto | KEEP (already correct) |
| docs/implementation/*.md | test_report | MOVE to docs/test-report/ |
| docs/analysis/rtm/*.md | explanation | MOVE to docs/explanation/rtm/ |
| docs/reference/CICD_PIPELINE.md | reference | KEEP (already correct) |

### ProAgentic-DFX Subdirectory (C:\Users\chine\Projects\proagentic-dfx\proagentic-dfx\)

| Document | Classification | Target Directory | Reason |
|----------|---------------|------------------|---------|
| CAD_IMPLEMENTATION.md | test_report | docs/test-report/ | CAD implementation summary |
| CAD_INTEGRATION_SUMMARY.md | test_report | docs/test-report/ | Integration summary |
| COMPLIANCE_SCREEN_REFINEMENT_REPORT.md | test_report | docs/test-report/ | Screen refinement report |
| DEEP_REFINEMENT_REPORT.md | test_report | docs/test-report/ | Deep refinement report |
| ESLINT_ANALYSIS_REPORT.md | test_report | docs/test-report/ | ESLint analysis |
| EXPORT_SCREEN_REFINEMENT_REPORT.md | test_report | docs/test-report/ | Screen refinement |
| HELP_SYSTEM_IMPLEMENTATION.md | test_report | docs/test-report/ | Help system implementation |
| IMPLEMENTATION_SUMMARY.md | test_report | docs/test-report/ | General implementation summary |
| INSTALLATION_GUIDE.md | howto | docs/howto/ | Step-by-step installation |
| MATERIALS_COMPLIANCE_GUIDE.md | howto | docs/howto/ | Materials compliance guide |
| OPENCASCADE_INTEGRATION_PLAN.md | explanation | docs/explanation/ | OpenCascade integration plan |
| PARETO_SCREEN_REFINEMENT_REPORT.md | test_report | docs/test-report/ | Pareto screen refinement |
| README.md | explanation | docs/explanation/ | Frontend module explanation |
| docs/HELP_FRAMEWORK_TOPICS.md | reference | docs/reference/ | Help framework reference |
| docs/PROAGENTIC_DFX_PLATFORM.md | explanation | docs/explanation/ | Platform architecture |
| src/components/charts/README.md | reference | docs/reference/ | Charts API reference |
| src/components/charts/USAGE.md | howto | docs/howto/ | Charts usage guide |
| src/components/help/README.md | reference | docs/reference/ | Help component reference |
| src/components/screens/README-DOMAIN-INTEGRATION.md | explanation | docs/explanation/ | Domain integration |
| src/lib/design-system/README.md | reference | docs/reference/ | Design system reference |

## Migration Steps

### Step 1: Create Missing Directories
- ✅ _index/ (exists)
- ✅ feature/ (exists)
- ✅ howto/ (exists)
- ✅ reference/ (exists)
- ✅ explanation/ (exists)
- ✅ adr/ (exists)
- ✅ test-report/ (needs creation)
- ✅ runbook/ (exists)
- ✅ quarantine/ (exists)

### Step 2: Move Root-Level Documents
Execute moves for root-level markdown files

### Step 3: Reorganize Docs Directory
Move misplaced documents from docs/ root to proper subdirectories

### Step 4: Migrate ProAgentic-DFX Documents
Move all documentation from proagentic-dfx/ to main docs/

### Step 5: Add YAML Front Matter
Add/update front matter for all moved documents

### Step 6: Update Internal Links
Fix all relative path references in moved documents

### Step 7: Create Index Documents
Create README-INDEX.md files for each subdirectory

## Success Criteria

1. ✅ All documents classified by Diátaxis type
2. ✅ All documents moved to correct directory
3. ✅ All documents have YAML front matter
4. ✅ All internal links updated
5. ✅ Path mapping document created for Phase 6
6. ✅ No documents in root except README.md and CLAUDE.md
7. ✅ No documents in docs/ root (all in subdirectories)

## Path Mapping (For Phase 6)

Will be generated during migration execution.
