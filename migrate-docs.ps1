# Phase 4: Document Migration Script
# Moves documents to Diátaxis structure and tracks all changes

$base = "C:\Users\chine\Projects\proagentic-dfx"
$pathMappings = @()

function Move-Doc {
    param(
        [string]$source,
        [string]$target,
        [string]$classification
    )

    if (Test-Path $source) {
        $targetDir = Split-Path $target -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }

        Move-Item -Path $source -Destination $target -Force

        $mapping = [PSCustomObject]@{
            Source = $source
            Target = $target
            Classification = $classification
            Status = "Moved"
        }

        $script:pathMappings += $mapping
        Write-Host "Moved: $(Split-Path $source -Leaf) -> $classification/" -ForegroundColor Green
    } else {
        Write-Host "Not found: $source" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Phase 4: Document Migration to Diátaxis" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Root Level -> test-report/
Write-Host "Step 1: Migrating root-level test reports..." -ForegroundColor Yellow

Move-Doc "$base\ARIA_CHANGES_DETAILED.md" "$base\docs\test-report\ARIA_CHANGES_DETAILED.md" "test-report"
Move-Doc "$base\IMPLEMENTATION-SUMMARY-REQ251-255.md" "$base\docs\test-report\IMPLEMENTATION-SUMMARY-REQ251-255.md" "test-report"
Move-Doc "$base\IMPLEMENTATION_REQ-197-202.md" "$base\docs\test-report\IMPLEMENTATION_REQ-197-202.md" "test-report"
Move-Doc "$base\MOCK_SERVER_GAP_ANALYSIS_REPORT.md" "$base\docs\test-report\MOCK_SERVER_GAP_ANALYSIS_REPORT.md" "test-report"
Move-Doc "$base\REQUIREMENTS_ALIGNMENT_GAP_ANALYSIS.md" "$base\docs\test-report\REQUIREMENTS_ALIGNMENT_GAP_ANALYSIS.md" "test-report"
Move-Doc "$base\SCF_IMPLEMENTATION_VERIFICATION.md" "$base\docs\test-report\SCF_IMPLEMENTATION_VERIFICATION.md" "test-report"
Move-Doc "$base\WCAG_ARIA_IMPROVEMENTS_SUMMARY.md" "$base\docs\test-report\WCAG_ARIA_IMPROVEMENTS_SUMMARY.md" "test-report"

# Step 2: Root Level -> explanation/
Write-Host "`nStep 2: Migrating root-level explanations..." -ForegroundColor Yellow

Move-Doc "$base\MOCK_SERVER_SUMMARY.md" "$base\docs\explanation\MOCK_SERVER_SUMMARY.md" "explanation"
Move-Doc "$base\README_PROAGENTIC_DFX.md" "$base\docs\explanation\README_PROAGENTIC_DFX.md" "explanation"

# Step 3: Root Level -> runbook/
Write-Host "`nStep 3: Migrating root-level runbooks..." -ForegroundColor Yellow

Move-Doc "$base\HANDOVER.md" "$base\docs\runbook\HANDOVER.md" "runbook"
Move-Doc "$base\MOCK_SERVER_ACTION_ITEMS.md" "$base\docs\runbook\MOCK_SERVER_ACTION_ITEMS.md" "runbook"

# Step 4: Docs Root -> test-report/
Write-Host "`nStep 4: Migrating docs/* to test-report..." -ForegroundColor Yellow

Move-Doc "$base\docs\DETAILED_GAP_ANALYSIS.md" "$base\docs\test-report\DETAILED_GAP_ANALYSIS.md" "test-report"
Move-Doc "$base\docs\ENTERPRISE_GAP_ANALYSIS.md" "$base\docs\test-report\ENTERPRISE_GAP_ANALYSIS.md" "test-report"
Move-Doc "$base\docs\HARDCODED_MOCK_DATA_VIOLATIONS.md" "$base\docs\test-report\HARDCODED_MOCK_DATA_VIOLATIONS.md" "test-report"
Move-Doc "$base\docs\RTM_REVIEW_REPORT.md" "$base\docs\test-report\RTM_REVIEW_REPORT.md" "test-report"

# Step 5: Docs Root -> explanation/
Write-Host "`nStep 5: Migrating docs/* to explanation..." -ForegroundColor Yellow

Move-Doc "$base\docs\MOCK_SERVER_ARCHITECTURE_REVIEW.md" "$base\docs\explanation\MOCK_SERVER_ARCHITECTURE_REVIEW.md" "explanation"
Move-Doc "$base\docs\MULTI-DOMAIN-ARCHITECTURE.md" "$base\docs\explanation\MULTI-DOMAIN-ARCHITECTURE.md" "explanation"

# Step 6: Docs Root -> runbook/
Write-Host "`nStep 6: Migrating docs/* to runbook..." -ForegroundColor Yellow

Move-Doc "$base\docs\DEPLOYMENT.md" "$base\docs\runbook\DEPLOYMENT.md" "runbook"
Move-Doc "$base\docs\ENTERPRISE_ACTION_PLAN.md" "$base\docs\runbook\ENTERPRISE_ACTION_PLAN.md" "runbook"

# Step 7: docs/implementation/ -> test-report/
Write-Host "`nStep 7: Migrating docs/implementation/* to test-report..." -ForegroundColor Yellow

Move-Doc "$base\docs\implementation\CHARTS_IMPLEMENTATION_SUMMARY.md" "$base\docs\test-report\CHARTS_IMPLEMENTATION_SUMMARY.md" "test-report"
Move-Doc "$base\docs\implementation\MATERIALS_COMPLIANCE_IMPLEMENTATION.md" "$base\docs\test-report\MATERIALS_COMPLIANCE_IMPLEMENTATION.md" "test-report"
Move-Doc "$base\docs\implementation\REQUIREMENTS_SCREEN_ENHANCEMENTS.md" "$base\docs\test-report\REQUIREMENTS_SCREEN_ENHANCEMENTS.md" "test-report"

# Step 8: docs/analysis/rtm/ -> explanation/rtm/
Write-Host "`nStep 8: Migrating docs/analysis/rtm/* to explanation/rtm/..." -ForegroundColor Yellow

Move-Doc "$base\docs\analysis\rtm\DUPLICATE_ACTION_PLAN.md" "$base\docs\explanation\rtm\DUPLICATE_ACTION_PLAN.md" "explanation"
Move-Doc "$base\docs\analysis\rtm\DUPLICATE_REQUIREMENTS_REPORT.md" "$base\docs\explanation\rtm\DUPLICATE_REQUIREMENTS_REPORT.md" "explanation"

# Step 9: docs/guides/ -> howto/
Write-Host "`nStep 9: Migrating docs/guides/* to howto..." -ForegroundColor Yellow

Move-Doc "$base\docs\guides\ACTIVATION_GUIDE.md" "$base\docs\howto\ACTIVATION_GUIDE.md" "howto"

# Step 10: ProAgentic-DFX -> test-report/
Write-Host "`nStep 10: Migrating proagentic-dfx/* to test-report..." -ForegroundColor Yellow

Move-Doc "$base\proagentic-dfx\CAD_IMPLEMENTATION.md" "$base\docs\test-report\CAD_IMPLEMENTATION.md" "test-report"
Move-Doc "$base\proagentic-dfx\CAD_INTEGRATION_SUMMARY.md" "$base\docs\test-report\CAD_INTEGRATION_SUMMARY.md" "test-report"
Move-Doc "$base\proagentic-dfx\COMPLIANCE_SCREEN_REFINEMENT_REPORT.md" "$base\docs\test-report\COMPLIANCE_SCREEN_REFINEMENT_REPORT.md" "test-report"
Move-Doc "$base\proagentic-dfx\DEEP_REFINEMENT_REPORT.md" "$base\docs\test-report\DEEP_REFINEMENT_REPORT.md" "test-report"
Move-Doc "$base\proagentic-dfx\ESLINT_ANALYSIS_REPORT.md" "$base\docs\test-report\ESLINT_ANALYSIS_REPORT.md" "test-report"
Move-Doc "$base\proagentic-dfx\EXPORT_SCREEN_REFINEMENT_REPORT.md" "$base\docs\test-report\EXPORT_SCREEN_REFINEMENT_REPORT.md" "test-report"
Move-Doc "$base\proagentic-dfx\HELP_SYSTEM_IMPLEMENTATION.md" "$base\docs\test-report\HELP_SYSTEM_IMPLEMENTATION.md" "test-report"
Move-Doc "$base\proagentic-dfx\IMPLEMENTATION_SUMMARY.md" "$base\docs\test-report\IMPLEMENTATION_SUMMARY.md" "test-report"
Move-Doc "$base\proagentic-dfx\PARETO_SCREEN_REFINEMENT_REPORT.md" "$base\docs\test-report\PARETO_SCREEN_REFINEMENT_REPORT.md" "test-report"
Move-Doc "$base\proagentic-dfx\VIEWERSCREEN_REFINEMENT_REPORT.md" "$base\docs\test-report\VIEWERSCREEN_REFINEMENT_REPORT.md" "test-report"

# Step 11: ProAgentic-DFX -> howto/
Write-Host "`nStep 11: Migrating proagentic-dfx/* to howto..." -ForegroundColor Yellow

Move-Doc "$base\proagentic-dfx\INSTALLATION_GUIDE.md" "$base\docs\howto\INSTALLATION_GUIDE.md" "howto"
Move-Doc "$base\proagentic-dfx\MATERIALS_COMPLIANCE_GUIDE.md" "$base\docs\howto\MATERIALS_COMPLIANCE_GUIDE.md" "howto"

# Step 12: ProAgentic-DFX -> explanation/
Write-Host "`nStep 12: Migrating proagentic-dfx/* to explanation..." -ForegroundColor Yellow

Move-Doc "$base\proagentic-dfx\OPENCASCADE_INTEGRATION_PLAN.md" "$base\docs\explanation\OPENCASCADE_INTEGRATION_PLAN.md" "explanation"
Move-Doc "$base\proagentic-dfx\README.md" "$base\docs\explanation\FRONTEND_README.md" "explanation"

# Step 13: ProAgentic-DFX/docs -> explanation/
Write-Host "`nStep 13: Migrating proagentic-dfx/docs/* to explanation..." -ForegroundColor Yellow

Move-Doc "$base\proagentic-dfx\docs\PROAGENTIC_DFX_PLATFORM.md" "$base\docs\explanation\PROAGENTIC_DFX_PLATFORM.md" "explanation"

# Step 14: ProAgentic-DFX/docs -> reference/
Write-Host "`nStep 14: Migrating proagentic-dfx/docs/* to reference..." -ForegroundColor Yellow

Move-Doc "$base\proagentic-dfx\docs\HELP_FRAMEWORK_TOPICS.md" "$base\docs\reference\HELP_FRAMEWORK_TOPICS.md" "reference"

# Step 15: ProAgentic-DFX component READMEs -> reference/
Write-Host "`nStep 15: Migrating component READMEs to reference..." -ForegroundColor Yellow

Move-Doc "$base\proagentic-dfx\src\components\charts\README.md" "$base\docs\reference\CHARTS_API.md" "reference"
Move-Doc "$base\proagentic-dfx\src\components\help\README.md" "$base\docs\reference\HELP_COMPONENT_API.md" "reference"
Move-Doc "$base\proagentic-dfx\src\lib\design-system\README.md" "$base\docs\reference\DESIGN_SYSTEM_API.md" "reference"

# Step 16: ProAgentic-DFX component docs -> howto/
Write-Host "`nStep 16: Migrating component usage docs to howto..." -ForegroundColor Yellow

Move-Doc "$base\proagentic-dfx\src\components\charts\USAGE.md" "$base\docs\howto\CHARTS_USAGE.md" "howto"

# Step 17: ProAgentic-DFX screens docs -> explanation/
Write-Host "`nStep 17: Migrating screen docs to explanation..." -ForegroundColor Yellow

Move-Doc "$base\proagentic-dfx\src\components\screens\README-DOMAIN-INTEGRATION.md" "$base\docs\explanation\DOMAIN_INTEGRATION.md" "explanation"

# Export path mappings
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Exporting path mappings..." -ForegroundColor Yellow

$mappingsJson = $pathMappings | ConvertTo-Json -Depth 10
$mappingsJson | Out-File "$base\docs\_index\PHASE4_PATH_MAPPINGS.json" -Encoding UTF8

$mappingsCsv = $pathMappings | Export-Csv -Path "$base\docs\_index\PHASE4_PATH_MAPPINGS.csv" -NoTypeInformation

Write-Host "Path mappings saved:" -ForegroundColor Green
Write-Host "  - docs/_index/PHASE4_PATH_MAPPINGS.json" -ForegroundColor Cyan
Write-Host "  - docs/_index/PHASE4_PATH_MAPPINGS.csv" -ForegroundColor Cyan

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Migration Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total documents moved: $($pathMappings.Count)" -ForegroundColor Green

$byClassification = $pathMappings | Group-Object -Property Classification
foreach ($group in $byClassification) {
    Write-Host "  $($group.Name): $($group.Count) documents" -ForegroundColor Cyan
}

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Run front matter addition script" -ForegroundColor White
Write-Host "2. Update internal links" -ForegroundColor White
Write-Host "3. Create index documents" -ForegroundColor White
Write-Host "4. Update manifest.json" -ForegroundColor White

Write-Host "`nPhase 4 Migration Complete!`n" -ForegroundColor Green
